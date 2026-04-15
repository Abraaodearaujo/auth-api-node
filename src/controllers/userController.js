const { getDb } = require('../config/database');

async function getProfile(req, res) {
  try {
    const db = await getDb();
    const result = db.exec('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);

    if (result.length === 0 || result[0].values.length === 0)
      return res.status(404).json({ error: 'Usuário não encontrado.' });

    const cols = result[0].columns;
    const user = Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]));

    return res.json({ user });
  } catch (err) {
    console.error('[getProfile]', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

async function listUsers(req, res) {
  try {
    const db = await getDb();
    const result = db.exec('SELECT id, name, email, created_at FROM users ORDER BY id DESC');

    const users = result.length === 0 ? [] : result[0].values.map(row =>
      Object.fromEntries(result[0].columns.map((c, i) => [c, row[i]]))
    );

    return res.json({ total: users.length, users });
  } catch (err) {
    console.error('[listUsers]', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { getProfile, listUsers };