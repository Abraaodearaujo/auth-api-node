const { Router } = require('express');
const authMiddleware = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { getProfile, listUsers } = require('../controllers/userController');

const router = Router();

router.use(authMiddleware);

router.get('/me', getProfile);
router.get('/', requireRole('admin'), listUsers);

module.exports = router;
