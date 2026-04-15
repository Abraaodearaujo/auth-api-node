require('dotenv').config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const JWT_SECRET = process.env.JWT_SECRET || 'troque-este-segredo-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const PORT = toInt(process.env.PORT, 3000);
const RATE_LIMIT_WINDOW_MS = toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const RATE_LIMIT_MAX = toInt(process.env.RATE_LIMIT_MAX, 100);
const AUTH_RATE_LIMIT_MAX = toInt(process.env.AUTH_RATE_LIMIT_MAX, 20);

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  PORT,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_MAX,
};