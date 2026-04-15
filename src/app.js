const express = require('express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

module.exports = app;
