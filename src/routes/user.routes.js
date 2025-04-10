const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAdmin, isOwnerOrAdmin } = require('../middlewares/auth.middleware');

// Lấy tất cả users (phân trang) - chỉ admin
router.get('/', isAdmin, userController.getAllUsers);

// Lấy user theo ID - admin hoặc chính user đó
router.get('/:id', isOwnerOrAdmin, userController.getUserById);

// Tạo user mới - chỉ admin
router.post('/', isAdmin, userController.createUser);

// Cập nhật user - admin hoặc chính user đó
router.put('/:id', isOwnerOrAdmin, userController.updateUser);

// Xóa user - chỉ admin
router.delete('/:id', isAdmin, userController.deleteUser);

// Tìm kiếm user - chỉ admin
router.get('/search', isAdmin, userController.searchUsers);

// Thay đổi trạng thái user - chỉ admin
router.put('/:id/toggle-status', isAdmin, userController.toggleUserStatus);

// Cập nhật thông tin cá nhân - chính user đó
router.put('/profile', isOwnerOrAdmin, userController.updateProfile);

module.exports = router; 