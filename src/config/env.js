const JWT_SECRET = process.env.JWT_SECRET || 'troque-este-segredo-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const PORT = process.env.PORT || 3000;

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, PORT };