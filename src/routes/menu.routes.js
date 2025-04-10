// File: src/routes/menu.routes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const uploadMenuItemImage = require('../middlewares/upload.middleware'); // Import middleware
// const { isAdmin } = require('../middlewares/auth.middleware');

// POST /api/menu - Tạo món ăn mới (sử dụng middleware upload)
// uploadMenuItemImage sẽ xử lý file có field name là 'image'
router.post('/', /* isAdmin, */ uploadMenuItemImage, menuController.createMenuItem);

// GET /api/menu - Lấy danh sách món ăn (không cần upload)
router.get('/', menuController.getAllMenuItems);

// GET /api/menu/:id - Lấy chi tiết món ăn (không cần upload)
router.get('/:id', menuController.getMenuItemById);

// PUT /api/menu/:id - Cập nhật món ăn (sử dụng middleware upload)
router.put('/:id', /* isAdmin, */ uploadMenuItemImage, menuController.updateMenuItem);

// DELETE /api/menu/:id - Xóa món ăn (không cần upload)
router.delete('/:id', /* isAdmin, */ menuController.deleteMenuItem);

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