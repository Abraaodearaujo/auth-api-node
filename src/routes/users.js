const { Router } = require('express');
const authMiddleware = require('../middlewares/auth');
const { getProfile, listUsers } = require('../controllers/userController');

const router = Router();

// Todas as rotas abaixo exigem JWT válido
router.use(authMiddleware);

// GET /api/users/me  → perfil do usuário autenticado
router.get('/me', getProfile);

// GET /api/users     → lista todos os usuários
router.get('/', listUsers);

module.exports = router;
