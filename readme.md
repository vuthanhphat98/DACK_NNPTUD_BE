# DACK_NNPTUD_BE - Backend API for Restaurant Management System

## Công nghệ sử dụng
- Node.js
- Express.js
- MongoDB
- Session-based Authentication
- Bcrypt for Password Hashing

## Cài đặt
1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file .env và cấu hình:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/Hadidi_Restaurant
JWT_SECRET="987654321987654321987654321987654321"
JWT_EXPIRES=168h
EMAIL_USER=trungtienle8332@gmail.com
EMAIL_PASS=your_email_password
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your_session_secret
```

3. Khởi động server:
```bash
npm start
```

## API Endpoints

### Authentication
```http

#Đăng kí 
POST /api/auth/register
Content-Type: application/json

{
    "name": "User Name",
    "email": "user@example.com",
    "password": "Password123",
    "phone": "0123456789",
    "address": "User Address"
}

# Đăng nhập
POST /api/auth/login
Content-Type: application/json

{
    "email": "admin@gmail.com",
    "password": "123456Aa"
}

# Đăng xuất
POST /api/auth/logout
```

### User Management (Admin)
```http
# Lấy danh sách users (phân trang)
GET /api/users?page=1&limit=10

# Lấy thông tin user theo ID
GET /api/users/:id

# Tạo user mới
POST /api/users
Content-Type: application/json

{
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "phone": "0123456789",
    "address": "User Address"
}

# Cập nhật user
PUT /api/users/:id
Content-Type: application/json

{
    "name": "Updated Name",
    "phone": "0987654321",
    "address": "Updated Address"
}

# Xóa user
DELETE /api/users/:id

# Tìm kiếm user
GET /api/users/search?query=search_term&page=1&limit=10

# Thay đổi trạng thái user
PUT /api/users/:id/toggle-status
```

### User Profile
```http
# Cập nhật thông tin cá nhân
PUT /api/users/profile
Content-Type: application/json

{
    "name": "New Name",
    "phone": "New Phone",
    "address": "New Address",
    "password": "New Password"  // (optional)
}
```

## Tài khoản mặc định
- Email: admin@gmail.com
- Password: 123456Aa

## Cấu trúc thư mục
```
src/
├── config/         # Cấu hình
├── controllers/    # Xử lý logic
├── middlewares/    # Middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
└── utils/          # Utility functions
```

## Quyền truy cập
1. Admin:
   - Toàn quyền truy cập tất cả API
   - Quản lý users
   - Cập nhật thông tin cá nhân

2. User:
   - Xem và cập nhật thông tin cá nhân
   - Không thể truy cập các API quản lý 