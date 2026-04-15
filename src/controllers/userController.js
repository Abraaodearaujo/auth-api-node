const { getDb } = require('../config/database');
const ApiError = require('../errors/ApiError');

async function getProfile(req, res, next) {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
    stmt.bind([req.user.id]);

    if (!stmt.step()) {
      stmt.free();
      return next(ApiError.notFound('User not found.'));
    }

    const user = stmt.getAsObject();
    stmt.free();

    return res.json({ user });
  } catch (err) {
    return next(ApiError.internal('Failed to fetch user profile.'));
  }
}

async function listUsers(req, res, next) {
  try {
    const db = await getDb();
    const stmt = db.prepare('SELECT id, name, email, created_at FROM users ORDER BY id DESC');

    const users = [];
    while (stmt.step()) {
      users.push(stmt.getAsObject());
    }
    stmt.free();

    return res.json({ total: users.length, users });
  } catch (err) {
    return next(ApiError.internal('Failed to fetch users list.'));
  }
}

module.exports = { getProfile, listUsers };