const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../utils/validators');
const { auth } = require('../middleware/auth');

// Register
router.post('/register', validateRegister, authController.register);

// Login
router.post('/login', validateLogin, authController.login);

// Logout
router.post('/logout', auth, authController.logout);

// Get current user
router.get('/profile', auth, authController.getProfile);

module.exports = router; 