const isAdmin = (req, res, next) => {
    // Kiểm tra xem user đã đăng nhập chưa
    if (!req.session.user) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    // Kiểm tra xem user có phải là admin không
    if (req.session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    next();
};

module.exports = isAdmin; 