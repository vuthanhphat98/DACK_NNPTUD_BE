const jwt = require("jsonwebtoken");
const User = require('../models/user.model');
const config = require('../config/config');
const UserRole = require("../enums/userRole.enum");

// Kiểm tra xác thực
const isAuthenticated = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Kiểm tra người dùng có tồn tại không
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }
        
        // Kiểm tra trạng thái tài khoản
        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }
        
        // Gắn thông tin người dùng vào request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Kiểm tra quyền admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }
    res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
};

const verifyRoles = (roles) => (req, res, next) => {
  try {
    const token = req.cookies.jwt_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, truy cập bị từ chối!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (roles.length > 0 && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ!" });
  }
};

const isOwnerOrAdmin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    if (req.session.user.role === 'ADMIN' || req.session.user._id === req.params.id) {
        next();
    } else {
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
};

module.exports = {
    isAuthenticated,
    isAdmin,
    verifyRoles,
    isOwnerOrAdmin
}; 