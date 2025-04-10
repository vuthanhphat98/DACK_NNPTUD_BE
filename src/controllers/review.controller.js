const Review = require('../models/review.model');
const MenuItem = require('../models/menuItem.model');
const fs = require('fs');
const path = require('path');

class ReviewController {
    // CREATE - Thêm đánh giá mới
    async createReview(req, res, next) {
        try {
            const { menuItem, rating, comment } = req.body;
            const userId = req.user.id; // Lấy từ middleware auth
            
            // Kiểm tra món ăn có tồn tại không
            const menuItemExists = await MenuItem.findById(menuItem);
            if (!menuItemExists) {
                // Xóa file nếu có
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }
                return res.status(404).json({ message: 'Không tìm thấy món ăn' });
            }
            
            // Kiểm tra người dùng đã đánh giá món ăn này chưa
            const existingReview = await Review.findOne({ user: userId, menuItem });
            if (existingReview) {
                // Xóa file nếu có
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }
                return res.status(400).json({ message: 'Bạn đã đánh giá món ăn này rồi' });
            }
            
            // Xử lý hình ảnh nếu có
            let images = [];
            if (req.files && req.files.length > 0) {
                images = req.files.map(file => `/api/uploads/reviews/${file.filename}`);
            }
            
            // Tạo review mới
            const newReview = new Review({
                user: userId,
                menuItem,
                rating: Number(rating),
                comment,
                images,
                status: 'pending' // Mặc định là chờ duyệt
            });
            
            const savedReview = await newReview.save();
            
            // Populate thông tin user
            const populatedReview = await Review.findById(savedReview._id)
                .populate('user', 'name avatar')
                .populate('menuItem', 'name image');
            
            res.status(201).json({
                message: 'Đánh giá của bạn đã được ghi nhận và đang chờ duyệt',
                data: populatedReview
            });
        } catch (error) {
            // Xóa file nếu có lỗi
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
            }
            
            console.error("Create review error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // READ - Lấy tất cả đánh giá (chỉ admin)
    async getAllReviews(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const status = req.query.status || 'all'; // all, pending, approved, rejected
            
            let query = {};
            if (status !== 'all') {
                query.status = status;
            }
            
            const reviews = await Review.find(query)
                .populate('user', 'name avatar')
                .populate('menuItem', 'name image')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            
            const totalReviews = await Review.countDocuments(query);
            
            // Thêm URL đầy đủ cho hình ảnh
            const reviewsWithFullImageUrl = reviews.map(review => {
                const reviewObj = review.toObject();
                
                // Xử lý images trong review
                if (reviewObj.images && reviewObj.images.length > 0) {
                    reviewObj.imageUrls = reviewObj.images.map(img => 
                        `${req.protocol}://${req.get('host')}${img}`
                    );
                }
                
                // Xử lý image trong menuItem
                if (reviewObj.menuItem && reviewObj.menuItem.image) {
                    reviewObj.menuItem.imageUrl = `${req.protocol}://${req.get('host')}${reviewObj.menuItem.image}`;
                }
                
                return reviewObj;
            });
            
            res.status(200).json({
                message: 'Lấy danh sách đánh giá thành công',
                data: reviewsWithFullImageUrl,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReviews / limit),
                    totalItems: totalReviews
                }
            });
        } catch (error) {
            console.error("Get reviews error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // READ - Lấy đánh giá theo ID món ăn (public)
    async getReviewsByMenuItem(req, res, next) {
        try {
            const menuItemId = req.params.menuItemId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            
            // Kiểm tra món ăn có tồn tại không
            const menuItemExists = await MenuItem.findById(menuItemId);
            if (!menuItemExists) {
                return res.status(404).json({ message: 'Không tìm thấy món ăn' });
            }
            
            // Mặc định chỉ lấy các review đã được duyệt (approved)
            const reviews = await Review.find({ 
                menuItem: menuItemId,
                status: 'approved'
            })
                .populate('user', 'name avatar')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            
            const totalReviews = await Review.countDocuments({ 
                menuItem: menuItemId,
                status: 'approved'
            });
            
            // Thêm URL đầy đủ cho hình ảnh
            const reviewsWithFullImageUrl = reviews.map(review => {
                const reviewObj = review.toObject();
                
                // Xử lý images trong review
                if (reviewObj.images && reviewObj.images.length > 0) {
                    reviewObj.imageUrls = reviewObj.images.map(img => 
                        `${req.protocol}://${req.get('host')}${img}`
                    );
                }
                
                return reviewObj;
            });
            
            res.status(200).json({
                message: 'Lấy danh sách đánh giá thành công',
                data: reviewsWithFullImageUrl,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReviews / limit),
                    totalItems: totalReviews
                }
            });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID món ăn không hợp lệ' });
            }
            
            console.error("Get reviews by menu item error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // READ - Lấy đánh giá của người dùng hiện tại
    async getUserReviews(req, res, next) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            
            const reviews = await Review.find({ user: userId })
                .populate('menuItem', 'name image')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            
            const totalReviews = await Review.countDocuments({ user: userId });
            
            // Thêm URL đầy đủ cho hình ảnh
            const reviewsWithFullImageUrl = reviews.map(review => {
                const reviewObj = review.toObject();
                
                // Xử lý images trong review
                if (reviewObj.images && reviewObj.images.length > 0) {
                    reviewObj.imageUrls = reviewObj.images.map(img => 
                        `${req.protocol}://${req.get('host')}${img}`
                    );
                }
                
                // Xử lý image trong menuItem
                if (reviewObj.menuItem && reviewObj.menuItem.image) {
                    reviewObj.menuItem.imageUrl = `${req.protocol}://${req.get('host')}${reviewObj.menuItem.image}`;
                }
                
                return reviewObj;
            });
            
            res.status(200).json({
                message: 'Lấy danh sách đánh giá của bạn thành công',
                data: reviewsWithFullImageUrl,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReviews / limit),
                    totalItems: totalReviews
                }
            });
        } catch (error) {
            console.error("Get user reviews error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // UPDATE - Cập nhật trạng thái đánh giá (chỉ admin)
    async updateReviewStatus(req, res, next) {
        try {
            const reviewId = req.params.id;
            const { status } = req.body;
            
            if (!['pending', 'approved', 'rejected'].includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }
            
            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            }
            
            review.status = status;
            review.updatedAt = Date.now();
            
            const updatedReview = await review.save();
            
            res.status(200).json({
                message: 'Cập nhật trạng thái đánh giá thành công',
                data: updatedReview
            });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID đánh giá không hợp lệ' });
            }
            
            console.error("Update review status error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // UPDATE - Cập nhật đánh giá (chỉ người tạo)
    async updateReview(req, res, next) {
        try {
            const reviewId = req.params.id;
            const userId = req.user.id;
            const { rating, comment } = req.body;
            
            const review = await Review.findById(reviewId);
            if (!review) {
                // Xóa file nếu có
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }
                return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            }
            
            // Kiểm tra người dùng có quyền cập nhật không
            if (review.user.toString() !== userId) {
                // Xóa file nếu có
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }
                return res.status(403).json({ message: 'Bạn không có quyền cập nhật đánh giá này' });
            }
            
            // Cập nhật thông tin
            if (rating) review.rating = Number(rating);
            if (comment) review.comment = comment;
            
            // Xử lý hình ảnh nếu có
            if (req.files && req.files.length > 0) {
                // Xóa hình ảnh cũ
                if (review.images && review.images.length > 0) {
                    review.images.forEach(img => {
                        const imagePath = path.join(
                            __dirname, 
                            '../../public', 
                            img.replace('/api', '')
                        );
                        
                        if (fs.existsSync(imagePath)) {
                            try {
                                fs.unlinkSync(imagePath);
                            } catch (unlinkError) {
                                console.error("Error deleting old image:", unlinkError);
                            }
                        }
                    });
                }
                
                // Thêm hình ảnh mới
                review.images = req.files.map(file => `/api/uploads/reviews/${file.filename}`);
            }
            
            // Đặt lại trạng thái về pending khi cập nhật
            review.status = 'pending';
            review.updatedAt = Date.now();
            
            const updatedReview = await review.save();
            
            // Populate thông tin
            const populatedReview = await Review.findById(updatedReview._id)
                .populate('user', 'name avatar')
                .populate('menuItem', 'name image');
            
            res.status(200).json({
                message: 'Cập nhật đánh giá thành công và đang chờ duyệt',
                data: populatedReview
            });
        } catch (error) {
            // Xóa file nếu có lỗi
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
            }
            
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID đánh giá không hợp lệ' });
            }
            
            console.error("Update review error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
    
    // DELETE - Xóa đánh giá (admin hoặc người tạo)
    async deleteReview(req, res, next) {
        try {
            const reviewId = req.params.id;
            const userId = req.user.id;
            const isAdmin = req.user.role === 'ADMIN';
            
            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            }
            
            // Kiểm tra quyền xóa
            if (!isAdmin && review.user.toString() !== userId) {
                return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
            }
            
            // Xóa hình ảnh nếu có
            if (review.images && review.images.length > 0) {
                review.images.forEach(img => {
                    const imagePath = path.join(
                        __dirname, 
                        '../../public', 
                        img.replace('/api', '')
                    );
                    
                    if (fs.existsSync(imagePath)) {
                        try {
                            fs.unlinkSync(imagePath);
                        } catch (unlinkError) {
                            console.error("Error deleting image:", unlinkError);
                        }
                    }
                });
            }
            
            await Review.findByIdAndDelete(reviewId);
            
            res.status(200).json({
                message: 'Xóa đánh giá thành công'
            });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'ID đánh giá không hợp lệ' });
            }
            
            console.error("Delete review error:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
}

module.exports = new ReviewController();
