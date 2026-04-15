const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, save } = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email e password são obrigatórios.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: 'E-mail inválido.' });

  try {
    const db = await getDb();
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0 && existing[0].values.length > 0)
      return res.status(409).json({ error: 'E-mail já cadastrado.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email.toLowerCase(), hashedPassword]);
    save();

    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];

    const token = jwt.sign({ id, email: email.toLowerCase(), name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: { id, name, email: email.toLowerCase() },
      token,
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'email e password são obrigatórios.' });

  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (result.length === 0 || result[0].values.length === 0)
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    const cols = result[0].columns;
    const row = result[0].values[0];
    const user = Object.fromEntries(cols.map((c, i) => [c, row[i]]));

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      message: 'Login realizado com sucesso.',
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { register, login };