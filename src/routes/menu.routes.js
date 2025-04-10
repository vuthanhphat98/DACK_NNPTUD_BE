// File: src/routes/menu.routes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const uploadMenuItemImage = require('../middlewares/upload.middleware');
const multer = require('multer'); // Thêm import multer
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// POST /api/menu - Tạo món ăn mới (chỉ ADMIN)
router.post('/', isAuthenticated, isAdmin, uploadMenuItemImage, menuController.createMenuItem);

// GET /api/menu - Lấy danh sách món ăn (công khai)
router.get('/', menuController.getAllMenuItems);

// GET /api/menu/:id - Lấy chi tiết món ăn (công khai)
router.get('/:id', menuController.getMenuItemById);

// PUT /api/menu/:id - Cập nhật món ăn (chỉ ADMIN)
router.put('/:id', isAuthenticated, isAdmin, uploadMenuItemImage, menuController.updateMenuItem);

// DELETE /api/menu/:id - Xóa món ăn (chỉ ADMIN)
router.delete('/:id', isAuthenticated, isAdmin, menuController.deleteMenuItem);

// Middleware xử lý lỗi từ multer (đặt sau các route dùng multer)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Lỗi từ Multer (ví dụ: file quá lớn)
        return res.status(400).json({ message: `Lỗi tải ảnh: ${err.message}` });
    } else if (err) {
        // Lỗi khác (ví dụ: loại file không hợp lệ từ fileFilter)
        return res.status(400).json({ message: err.message });
    }
    next();
});

module.exports = router;