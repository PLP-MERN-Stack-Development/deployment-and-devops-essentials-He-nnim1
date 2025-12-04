const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateAuthRegister, validateAuthLogin } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateAuthRegister, register);
router.post('/login', validateAuthLogin, login);
router.get('/me', protect, getCurrentUser);

module.exports = router;

