const jwt = require("jsonwebtoken");
const UserRole = require("../enums/userRole.enum");

exports.currentUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lưu user vào request
    next();
  } catch (error) {
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

exports.verifyRoles = (roles) => (req, res, next) => {
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