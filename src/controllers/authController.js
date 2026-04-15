const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const SALT_ROUNDS = 12;

const register = (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existing) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

    const result = db
      .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run(name, email, passwordHash);

    const userId = result.lastInsertRowid;

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: { id: userId, name, email },
      token,
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

module.exports = { register, login };