
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên món ăn là bắt buộc'],
        trim: true
    },
    price: {
        type: Number, // Lưu giá dưới dạng Number
        required: [true, 'Giá món ăn là bắt buộc'],
        min: [0, 'Giá không thể âm']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String, // Đường dẫn tới ảnh
        trim: true,
        default: ''
    },
    detail: {
        type: String,
        trim: true,
        default: ''
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến model Category (nếu có)
        ref: 'Category' // Tên model Category
        // Nếu không dùng Category model, có thể để type: String
    },
    category_name: { // Lưu thêm tên category để dễ truy vấn (hoặc dùng $lookup)
        type: String,
        trim: true
    },
    status: {
        type: Boolean,
        default: true // true: còn hàng, false: hết hàng
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo index cho các trường hay tìm kiếm (tùy chọn)
menuItemSchema.index({ name: 'text', description: 'text' }); // Index dạng text search
menuItemSchema.index({ category_name: 1 });
menuItemSchema.index({ price: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;