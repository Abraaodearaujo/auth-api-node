const app = require('./app');
const logger = require('./utils/logger');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Available routes:');
  logger.info('GET  /health');
  logger.info('POST /api/auth/register');
  logger.info('POST /api/auth/login');
  logger.info('POST /api/auth/refresh');
  logger.info('POST /api/auth/logout');
  logger.info('POST /api/auth/forgot-password');
  logger.info('POST /api/auth/reset-password');
  logger.info('GET  /api/users/me   [🔒 JWT]');
  logger.info('GET  /api/users      [🔒 JWT, admin]');
  logger.info('GET  /api/docs       [Swagger UI]');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});
