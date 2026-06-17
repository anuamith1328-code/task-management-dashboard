const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
