const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Đăng ký tài khoản
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Xác thực OTP
router.post('/verify-otp', authController.verifyOTP);

// Đăng xuất
router.post('/logout', authController.logout);

module.exports = router; 