const { Router } = require('express');
const userController = require('../controllers/user');

const router = Router();

router.post('/auth/create-user', userController.createUser);
router.post('/auth/signin', userController.login);

module.exports = router;
