const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getDb, save } = require('../config/database');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_DAYS,
  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES,
} = require('../config/env');
const ApiError = require('../errors/ApiError');

const SALT_ROUNDS = 12;

function createAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function generateRandomToken() {
  return crypto.randomBytes(40).toString('hex');
}

function formatTimestamp(date) {
  return date.toISOString();
}

async function getUserByEmail(db, email) {
  const stmt = db.prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
  stmt.bind([email]);
  const user = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return user;
}

async function getUserById(db, id) {
  const stmt = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?');
  stmt.bind([id]);
  const user = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return user;
}

function createRefreshToken(db, userId) {
  const refreshToken = generateRandomToken();
  const expiresAt = formatTimestamp(
    new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
  );

  const stmt = db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
  stmt.run([userId, refreshToken, expiresAt]);
  stmt.free();

  return refreshToken;
}

async function getRefreshToken(db, refreshToken) {
  const stmt = db.prepare('SELECT id, user_id, token, expires_at FROM refresh_tokens WHERE token = ?');
  stmt.bind([refreshToken]);
  const tokenRow = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return tokenRow;
}

function deleteRefreshToken(db, refreshToken) {
  const stmt = db.prepare('DELETE FROM refresh_tokens WHERE token = ?');
  stmt.run([refreshToken]);
  stmt.free();
}

function createPasswordResetToken(db, userId) {
  const resetToken = generateRandomToken();
  const expiresAt = formatTimestamp(
    new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000),
  );

  const stmt = db.prepare(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
  );
  stmt.run([userId, resetToken, expiresAt]);
  stmt.free();

  return resetToken;
}

async function getPasswordResetToken(db, token) {
  const stmt = db.prepare(
    'SELECT id, user_id, token, expires_at, used FROM password_reset_tokens WHERE token = ?',
  );
  stmt.bind([token]);
  const record = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return record;
}

function markResetTokenUsed(db, tokenId) {
  const stmt = db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?');
  stmt.run([tokenId]);
  stmt.free();
}

async function register(req, res, next) {
  const { name, email, password } = req.body;

  try {
    const db = await getDb();
    const existing = await getUserByEmail(db, email);

    if (existing) {
      return next(ApiError.conflict('Email is already registered.'));
    }

    const countStmt = db.prepare('SELECT count(*) AS count FROM users');
    countStmt.step();
    const { count } = countStmt.getAsObject();
    countStmt.free();

    const role = Number(count) === 0 ? 'admin' : 'user';
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

    const insertStmt = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    );
    insertStmt.run([name, email, passwordHash, role]);
    insertStmt.free();
    save();

    const userStmt = db.prepare('SELECT id, name, email, role FROM users WHERE email = ?');
    userStmt.bind([email]);
    userStmt.step();
    const user = userStmt.getAsObject();
    userStmt.free();

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(db, user.id);
    save();

    return res.status(201).json({
      message: 'User created successfully.',
      user,
      token,
      refreshToken,
    });
  } catch (err) {
    return next(ApiError.internal('Failed to register user.'));
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const db = await getDb();
    const userStmt = db.prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
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

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(db, user.id);
    save();

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      message: 'Login successful.',
      user: responseUser,
      token,
      refreshToken,
    });
  } catch (err) {
    return next(ApiError.internal('Failed to authenticate user.'));
  }
}

async function refreshToken(req, res, next) {
  const { refreshToken } = req.body;

  try {
    const db = await getDb();
    const tokenRecord = await getRefreshToken(db, refreshToken);

    if (!tokenRecord) {
      return next(ApiError.unauthorized('Refresh token invalid.'));
    }

    const expiresAt = new Date(tokenRecord.expires_at);
    if (expiresAt < new Date()) {
      deleteRefreshToken(db, refreshToken);
      save();
      return next(ApiError.unauthorized('Refresh token expired.'));
    }

    const user = await getUserById(db, tokenRecord.user_id);
    if (!user) {
      return next(ApiError.unauthorized('User for refresh token not found.'));
    }

    deleteRefreshToken(db, refreshToken);
    const newRefreshToken = createRefreshToken(db, user.id);
    save();

    return res.status(200).json({
      message: 'Token refreshed successfully.',
      token: createAccessToken(user),
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return next(ApiError.internal('Failed to refresh token.'));
  }
}

async function logout(req, res, next) {
  const { refreshToken } = req.body;

  try {
    const db = await getDb();
    deleteRefreshToken(db, refreshToken);
    save();

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (err) {
    return next(ApiError.internal('Failed to logout.'));
  }
}

async function forgotPassword(req, res, next) {
  const { email } = req.body;

  try {
    const db = await getDb();
    const user = await getUserByEmail(db, email);

    if (!user) {
      return res.status(200).json({
        message: 'If the email exists, password reset instructions have been sent.',
      });
    }

    const resetToken = createPasswordResetToken(db, user.id);
    save();

    return res.status(200).json({
      message: 'Password reset token generated.',
      resetToken,
    });
  } catch (err) {
    return next(ApiError.internal('Failed to create reset token.'));
  }
}

async function resetPassword(req, res, next) {
  const { token, password } = req.body;

  try {
    const db = await getDb();
    const resetRecord = await getPasswordResetToken(db, token);

    if (!resetRecord || resetRecord.used) {
      return next(ApiError.unauthorized('Reset token invalid or already used.'));
    }

    const expiresAt = new Date(resetRecord.expires_at);
    if (expiresAt < new Date()) {
      return next(ApiError.unauthorized('Reset token expired.'));
    }

    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const updateStmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    updateStmt.run([passwordHash, resetRecord.user_id]);
    updateStmt.free();
    markResetTokenUsed(db, resetRecord.id);
    save();

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    return next(ApiError.internal('Failed to reset password.'));
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};