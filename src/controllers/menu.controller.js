// File: src/controllers/menu.controller.js
const MenuItem = require('../models/menuItem.model');
const fs = require('fs'); // Import module fs để xóa file cũ (nếu cần)
const path = require('path'); // Import module path

class MenuController {

    // CREATE - Thêm món ăn mới
    async createMenuItem(req, res, next) {
        try {
            const requestData = req.body; // Dữ liệu text từ form-data

            // Kiểm tra xem có file được upload không
            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng tải lên hình ảnh cho món ăn.' });
            }

            // Lấy đường dẫn tương đối của file đã lưu để lưu vào DB
            // Ví dụ: /uploads/menu_images/image-1678886400000-123456789.jpg
            const imagePath = `/api/uploads/menu_images/${req.file.filename}`;

            const newItemData = {
                ...requestData,
                price: Number(requestData.price), // Đảm bảo giá là Number
                status: requestData.status ? requestData.status === 'true' : true, // Chuyển đổi status từ string nếu cần
                image: imagePath, // Lưu đường dẫn tương đối
                category: requestData.category // Thêm category ID
            };

            const newItem = new MenuItem(newItemData);
            const savedItem = await newItem.save();

            res.status(201).json({
                message: 'Thêm món ăn thành công!',
                data: savedItem
            });
        } catch (error) {
            // Xóa file đã upload nếu có lỗi xảy ra khi lưu DB
            if (req.file) {
                 try {
                     fs.unlinkSync(req.file.path);
                 } catch (unlinkError) {
                     console.error("Error deleting uploaded file after DB error:", unlinkError);
                 }
            }

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
            }
            console.error("Create menu item error:", error);
            res.status(500).json({ message: 'Lỗi server khi thêm món ăn', error: error.message });
        }
    }

    // READ - Lấy tất cả món ăn
    async getAllMenuItems(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const items = await MenuItem.find()
                .populate('category', 'name')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const totalItems = await MenuItem.countDocuments();

            // Tạo URL đầy đủ cho ảnh
            const itemsWithFullImageUrl = items.map(item => {
                 // Kiểm tra xem `item.image` có tồn tại và không rỗng
                 const imageUrl = item.image ? `${req.protocol}://${req.get('host')}${item.image}` : null;
                 // Trả về object mới với trường imageUrl, loại bỏ trường image cũ nếu không cần
                 // Hoặc giữ cả hai nếu bạn muốn
                 const itemObject = item.toObject(); // Chuyển Mongoose document thành plain object
                 delete itemObject.image; // Xóa trường đường dẫn tương đối nếu không cần trả về
                 return { ...itemObject, imageUrl };
            });


            res.status(200).json({
                message: 'Lấy danh sách món ăn thành công',
                data: itemsWithFullImageUrl, // <<<--- Trả về data đã thêm imageUrl
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems: totalItems
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách món ăn', error: error.message });
        }
    }

    // READ - Lấy món ăn theo ID
    async getMenuItemById(req, res, next) {
        try {
            const itemId = req.params.id;
            const item = await MenuItem.findById(itemId).populate('category', 'name');

            if (!item) {
                return res.status(404).json({ message: 'Không tìm thấy món ăn' });
            }

            // Tạo URL đầy đủ cho ảnh
            const imageUrl = item.image ? `${req.protocol}://${req.get('host')}${item.image}` : null;
            const itemObject = item.toObject();
            delete itemObject.image;

            res.status(200).json({
                message: 'Lấy thông tin món ăn thành công',
                data: { ...itemObject, imageUrl } // <<<--- Trả về data đã thêm imageUrl
            });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                 return res.status(400).json({ message: 'ID món ăn không hợp lệ' });
            }
            res.status(500).json({ message: 'Lỗi server khi lấy món ăn', error: error.message });
        }
    }

    // UPDATE - Cập nhật món ăn
    async updateMenuItem(req, res, next) {
        try {
            const itemId = req.params.id;
            const requestData = req.body;
            let imagePath = null; // khai báo biến

            // Tìm món ăn hiện tại để lấy đường dẫn ảnh cũ (nếu cần xóa)
            const existingItem = await MenuItem.findById(itemId);
            if (!existingItem) {
                // Nếu có file upload kèm theo mà item không tồn tại, xóa file đó đi
                 if (req.file) {
                     fs.unlinkSync(req.file.path);
                 }
                return res.status(404).json({ message: 'Không tìm thấy món ăn để cập nhật' });
            }

            // Nếu có file mới được tải lên
            if (req.file) {
                imagePath = `/api/uploads/menu_images/${req.file.filename}`;

                // (Tùy chọn) Xóa ảnh cũ nếu tồn tại
                if (existingItem.image) {
                    const oldImagePath = path.join(__dirname, '../../public', existingItem.image);
                    // Kiểm tra file tồn tại trước khi xóa để tránh lỗi
                    if (fs.existsSync(oldImagePath)) {
                         try {
                             fs.unlinkSync(oldImagePath);
                             console.log("Deleted old image:", oldImagePath);
                         } catch (unlinkError) {
                             console.error("Error deleting old image:", unlinkError);
                             // Có thể không cần throw lỗi ở đây, chỉ log lại
                         }
                    }
                }
            }

            // Chuẩn bị dữ liệu cập nhật
            const updatedData = {
                ...requestData,
                price: requestData.price ? Number(requestData.price) : existingItem.price,
                status: requestData.status ? requestData.status === 'true' : existingItem.status,
            };
            // Chỉ cập nhật trường image nếu có ảnh mới được tải lên
            if (imagePath) {
                updatedData.image = imagePath;
            }

            const updatedItem = await MenuItem.findByIdAndUpdate(itemId, updatedData, {
                new: true,
                runValidators: true
            });

            // Không cần kiểm tra lại updatedItem vì đã kiểm tra existingItem ở trên
            // if (!updatedItem) { ... }

            const fullImageUrl = updatedItem.image 
              ? `${req.protocol}://${req.get('host')}${updatedItem.image}` 
              : null;

            res.status(200).json({
                message: 'Cập nhật món ăn thành công',
                data: {
                    ...updatedItem.toObject(),
                    imageUrl: fullImageUrl
                }
            });
        } catch (error) {
            // Nếu có lỗi DB sau khi upload file mới, xóa file mới đó đi
             if (req.file) {
                 try {
                     fs.unlinkSync(req.file.path);
                 } catch (unlinkError) {
                     console.error("Error deleting new file after DB update error:", unlinkError);
                 }
             }

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
            }
            if (error.kind === 'ObjectId') {
                 return res.status(400).json({ message: 'ID món ăn không hợp lệ' });
            }
            console.error("Update menu item error:", error);
            res.status(500).json({ message: 'Lỗi server khi cập nhật món ăn', error: error.message });
        }
    }

    // DELETE - Xóa món ăn
    async deleteMenuItem(req, res, next) {
        try {
            const itemId = req.params.id;
            const deletedItem = await MenuItem.findByIdAndDelete(itemId);

            if (!deletedItem) {
                return res.status(404).json({ message: 'Không tìm thấy món ăn để xóa' });
            }

            // Xóa file ảnh liên quan nếu có
            if (deletedItem.image) {
                 const imagePath = path.join(__dirname, '../../public', deletedItem.image);
                 if (fs.existsSync(imagePath)) {
                     try {
                         fs.unlinkSync(imagePath);
                         console.log("Deleted image file:", imagePath);
                     } catch (unlinkError) {
                         console.error("Error deleting image file:", unlinkError);
                     }
                 }
            }

            res.status(200).json({
                message: 'Xóa món ăn thành công',
                // data: deletedItem // Có thể không cần trả về item đã xóa
            });
        } catch (error) {
             if (error.kind === 'ObjectId') {
                 return res.status(400).json({ message: 'ID món ăn không hợp lệ' });
            }
            console.error("Delete menu item error:", error);
            res.status(500).json({ message: 'Lỗi server khi xóa món ăn', error: error.message });
        }
    }
}

module.exports = new MenuController();