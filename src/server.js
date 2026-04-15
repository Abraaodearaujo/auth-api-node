const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`   Ambiente : ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📋 Rotas disponíveis:`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/users/me   [🔒 JWT]`);
  console.log(`   GET  /api/users      [🔒 JWT]\n`);
});
