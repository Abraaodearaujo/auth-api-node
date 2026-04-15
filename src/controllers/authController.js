const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, save } = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const ApiError = require('../errors/ApiError');

const SALT_ROUNDS = 12;

async function register(req, res, next) {
  const { name, email, password } = req.body;

  try {
    const db = await getDb();
    const existingStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    existingStmt.bind([email]);
    const existing = existingStmt.step() ? existingStmt.getAsObject() : null;
    existingStmt.free();

    if (existing) {
      return next(ApiError.conflict('Email is already registered.'));
    }

    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const insertStmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    insertStmt.run([name, email, passwordHash]);
    insertStmt.free();
    save();

    const userIdStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    userIdStmt.bind([email]);
    userIdStmt.step();
    const userId = userIdStmt.getAsObject().id;
    userIdStmt.free();
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user: { id: userId, name, email },
      token,
    });
  } catch (err) {
    return next(ApiError.internal('Failed to register user.'));
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const db = await getDb();
    const userStmt = db.prepare('SELECT * FROM users WHERE email = ?');
    userStmt.bind([email]);
    const user = userStmt.step() ? userStmt.getAsObject() : null;
    userStmt.free();

    if (!user) {
      return next(ApiError.unauthorized('Invalid credentials.'));
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return next(ApiError.unauthorized('Invalid credentials.'));
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      message: 'Login successful.',
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    return next(ApiError.internal('Failed to authenticate user.'));
  }
}

module.exports = { register, login };