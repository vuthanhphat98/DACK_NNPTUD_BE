
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ file và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Thư mục lưu trữ ảnh (đảm bảo thư mục này tồn tại và có quyền ghi)
        cb(null, path.join(__dirname, '../../public/uploads/menu_images'));
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Hàm lọc file: chỉ chấp nhận file ảnh
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { // Kiểm tra mimetype bắt đầu bằng 'image/'
        cb(null, true); // Chấp nhận file
    } else {
        cb(new Error('Chỉ cho phép tải lên file hình ảnh!'), false); // Từ chối file
    }
};

// Cấu hình multer middleware
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 600 * 900 * 5 // Giới hạn dung lượng file 5MB
    }
});

// Middleware để xử lý upload một file ảnh có field name là 'image'
// .single('image') -> 'image' phải khớp với tên field trong form-data gửi từ Postman/frontend
const uploadMenuItemImage = upload.single('image');

module.exports = uploadMenuItemImage;