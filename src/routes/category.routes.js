// src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const uploadCategoryImage = require('../middlewares/upload.category.middleware');
// const { isAdmin } = require('../middlewares/auth.middleware');

// CREATE - Tạo danh mục mới
router.post('/', /* isAdmin, */ uploadCategoryImage, categoryController.createCategory);

// READ - Lấy danh sách danh mục
router.get('/', categoryController.getAllCategories);

// READ - Lấy thông tin danh mục theo ID
router.get('/:id', categoryController.getCategoryById);

// UPDATE - Cập nhật danh mục
router.put('/:id', /* isAdmin, */ uploadCategoryImage, categoryController.updateCategory);

// DELETE - Xóa danh mục
router.delete('/:id', /* isAdmin, */ categoryController.deleteCategory);

module.exports = router;