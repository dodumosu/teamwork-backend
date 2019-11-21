const { Router } = require('express');
const router = Router();
const userController = require('../controllers/user');

router.post('/auth/create-user', userController.createUser);
router.post('/auth/signin', userController.login);

module.exports = router;
