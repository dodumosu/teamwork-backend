const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/user');

const router = Router();

router.post('/auth/create-user', authMiddleware, userController.createUser);
router.post('/auth/signin', userController.login);

module.exports = router;
