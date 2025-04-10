// src/controllers/category.controller.js
const Category = require('../models/category.model');
const fs = require('fs');
const path = require('path');

class CategoryController {
    // CREATE - Thêm danh mục mới
    async createCategory(req, res, next) {
        try {
            const { name, description, status } = req.body;
            
            // Xử lý hình ảnh nếu có
            let imagePath = null;
            if (req.file) {
                imagePath = `/api/uploads/categories/${req.file.filename}`;
            }
            
            const category = new Category({
                name,
                description,
                status: status === 'true' || status === true,
                image: imagePath
            });
            
            const savedCategory = await category.save();
            
            res.status(201).json({
                message: 'Tạo danh mục thành công',
                data: savedCategory
            });
        } catch (error) {
            // Xóa file đã upload nếu có lỗi xảy ra
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error("Error deleting uploaded file:", unlinkError);
                }
            }
            
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
            }
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
            }
            
            console.error("Create category error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // READ - Lấy tất cả danh mục
    async getAllCategories(req, res, next) {
        try {
            const categories = await Category.find().sort({ name: 1 });
            
            // Thêm URL đầy đủ cho hình ảnh
            const categoriesWithFullImageUrl = categories.map(category => {
                const imageUrl = category.image 
                    ? `${req.protocol}://${req.get('host')}${category.image}` 
                    : null;
                
                const categoryObj = category.toObject();
                return { ...categoryObj, imageUrl };
            });
            
            res.status(200).json({
                message: 'Lấy danh sách danh mục thành công',
                data: categoriesWithFullImageUrl
            });
        } catch (error) {
            console.error("Get categories error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // READ - Lấy danh mục theo ID
    async getCategoryById(req, res, next) {
        try {
            const categoryId = req.params.id;
            const category = await Category.findById(categoryId);
            
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            
            // Thêm URL đầy đủ cho hình ảnh
            const imageUrl = category.image 
                ? `${req.protocol}://${req.get('host')}${category.image}` 
                : null;
            
            const categoryObj = category.toObject();
            
            res.status(200).json({
                message: 'Lấy thông tin danh mục thành công',
                data: { ...categoryObj, imageUrl }
            });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
            }
            
            console.error("Get category error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // UPDATE - Cập nhật danh mục
    async updateCategory(req, res, next) {
        try {
            const categoryId = req.params.id;
            const { name, description, status } = req.body;
            
            const category = await Category.findById(categoryId);
            
            if (!category) {
                // Xóa file nếu có upload mà không tìm thấy category
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            
            // Xử lý hình ảnh nếu có upload mới
            if (req.file) {
                const newImagePath = `/api/uploads/categories/${req.file.filename}`;
                
                // Xóa ảnh cũ nếu có
                if (category.image) {
                    const oldImagePath = path.join(
                        __dirname, 
                        '../../public', 
                        category.image.replace('/api', '')
                    );
                    
                    if (fs.existsSync(oldImagePath)) {
                        try {
                            fs.unlinkSync(oldImagePath);
                        } catch (unlinkError) {
                            console.error("Error deleting old image:", unlinkError);
                        }
                    }
                }
                
                category.image = newImagePath;
            }
            
            // Cập nhật các thông tin khác
            if (name) category.name = name;
            if (description !== undefined) category.description = description;
            if (status !== undefined) {
                category.status = status === 'true' || status === true;
            }
            
            category.updatedAt = Date.now();
            
            const updatedCategory = await category.save();
            
            // Thêm URL đầy đủ cho hình ảnh
            const imageUrl = updatedCategory.image 
                ? `${req.protocol}://${req.get('host')}${updatedCategory.image}` 
                : null;
            
            const categoryObj = updatedCategory.toObject();
            
            res.status(200).json({
                message: 'Cập nhật danh mục thành công',
                data: { ...categoryObj, imageUrl }
            });
        } catch (error) {
            // Xóa file đã upload nếu có lỗi xảy ra
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error("Error deleting uploaded file:", unlinkError);
                }
            }
            
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
            }
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
            }
            
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
            }
            
            console.error("Update category error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // DELETE - Xóa danh mục
    async deleteCategory(req, res, next) {
        try {
            const categoryId = req.params.id;
            const category = await Category.findById(categoryId);
            
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            
            // Kiểm tra xem có món ăn nào thuộc danh mục này không
            const MenuItem = require('../models/menuItem.model');
            const itemCount = await MenuItem.countDocuments({ category: categoryId });
            
            if (itemCount > 0) {
                return res.status(400).json({ 
                    message: 'Không thể xóa danh mục này vì có món ăn đang sử dụng',
                    count: itemCount
                });
            }
            
            // Xóa ảnh nếu có
            if (category.image) {
                const imagePath = path.join(
                    __dirname, 
                    '../../public', 
                    category.image.replace('/api', '')
                );
                
                if (fs.existsSync(imagePath)) {
                    try {
                        fs.unlinkSync(imagePath);
                    } catch (unlinkError) {
                        console.error("Error deleting image:", unlinkError);
                    }
                }
            }
            
            await Category.findByIdAndDelete(categoryId);
            
            res.status(200).json({
                message: 'Xóa danh mục thành công'
            });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
            }
            
            console.error("Delete category error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
}

module.exports = new CategoryController();