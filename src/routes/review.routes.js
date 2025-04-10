const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const uploadReviewImages = require('../middlewares/upload.review.middleware');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// CREATE - Tạo đánh giá mới (cần đăng nhập)
// Thêm console.log để debug
console.log('isAuthenticated:', isAuthenticated);
console.log('uploadReviewImages:', uploadReviewImages);
console.log('reviewController:', reviewController);
console.log('reviewController.createReview:', reviewController.createReview);

router.post('/', isAuthenticated, uploadReviewImages, reviewController.createReview);

// READ - Lấy tất cả đánh giá (chỉ admin)
router.get('/admin', isAuthenticated, isAdmin, reviewController.getAllReviews);

// READ - Lấy đánh giá theo ID món ăn (public)
router.get('/menu-item/:menuItemId', reviewController.getReviewsByMenuItem);

// READ - Lấy đánh giá của người dùng hiện tại (cần đăng nhập)
router.get('/my-reviews', isAuthenticated, reviewController.getUserReviews);

// UPDATE - Cập nhật trạng thái đánh giá (chỉ admin)
router.patch('/:id/status', isAuthenticated, isAdmin, reviewController.updateReviewStatus);

// UPDATE - Cập nhật đánh giá (chỉ người tạo)
router.put('/:id', isAuthenticated, uploadReviewImages, reviewController.updateReview);

// DELETE - Xóa đánh giá (admin hoặc người tạo)
router.delete('/:id', isAuthenticated, reviewController.deleteReview);

module.exports = router;
