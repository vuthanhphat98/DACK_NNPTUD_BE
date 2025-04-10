// src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const uploadCategoryImage = require('../middlewares/upload.category.middleware');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// CREATE - Tạo danh mục mới (chỉ ADMIN)
router.post('/', isAuthenticated, isAdmin, uploadCategoryImage, categoryController.createCategory);

// READ - Lấy danh sách danh mục (công khai)
router.get('/', categoryController.getAllCategories);

// READ - Lấy thông tin danh mục theo ID (công khai)
router.get('/:id', categoryController.getCategoryById);

// UPDATE - Cập nhật danh mục (chỉ ADMIN)
router.put('/:id', isAuthenticated, isAdmin, uploadCategoryImage, categoryController.updateCategory);

// DELETE - Xóa danh mục (chỉ ADMIN)
router.delete('/:id', isAuthenticated, isAdmin, categoryController.deleteCategory);

module.exports = router;