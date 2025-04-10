const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Người đánh giá là bắt buộc']
    },
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: [true, 'Món ăn được đánh giá là bắt buộc']
    },
    rating: {
        type: Number,
        required: [true, 'Số sao đánh giá là bắt buộc'],
        min: [1, 'Đánh giá thấp nhất là 1 sao'],
        max: [5, 'Đánh giá cao nhất là 5 sao']
    },
    comment: {
        type: String,
        required: [true, 'Nội dung đánh giá là bắt buộc'],
        trim: true,
        minlength: [3, 'Nội dung đánh giá phải có ít nhất 3 ký tự']
    },
    images: [{
        type: String // Đường dẫn đến hình ảnh đánh giá
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Tạo index để tối ưu truy vấn
reviewSchema.index({ menuItem: 1, user: 1 }, { unique: true });

// Tính sao trung bình khi có review mới
reviewSchema.statics.calculateAverageRating = async function(menuItemId) {
    const stats = await this.aggregate([
        {
            $match: { 
                menuItem: menuItemId,
                status: 'approved' // Chỉ tính các review đã được duyệt
            }
        },
        {
            $group: {
                _id: '$menuItem',
                avgRating: { $avg: '$rating' },
                nRating: { $sum: 1 }
            }
        }
    ]);
    
    // Cập nhật thông tin rating trong MenuItem
    if (stats.length > 0) {
        await mongoose.model('MenuItem').findByIdAndUpdate(menuItemId, {
            ratingAverage: Math.round(stats[0].avgRating * 10) / 10, // Làm tròn 1 chữ số thập phân
            ratingCount: stats[0].nRating
        });
    } else {
        // Nếu không có review nào được duyệt
        await mongoose.model('MenuItem').findByIdAndUpdate(menuItemId, {
            ratingAverage: 0,
            ratingCount: 0
        });
    }
};

// Tự động tính rating sau khi lưu
reviewSchema.post('save', function() {
    // this.constructor chính là model Review
    this.constructor.calculateAverageRating(this.menuItem);
});

// Tự động tính rating sau khi cập nhật hoặc xóa
reviewSchema.post(/^findOneAnd/, async function(doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.menuItem);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
