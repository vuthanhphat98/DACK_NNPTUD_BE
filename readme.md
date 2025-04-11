Hướng dẫn sử dụng API với Postman
1. Thiết lập Postman Environment
Đầu tiên, tạo một environment để lưu các biến sử dụng chung:
Nhấp vào biểu tượng "Environments" và tạo môi trường mới "Restaurant API"
Thêm các biến sau:
baseUrl: http://localhost:3000
token: (để trống, sẽ lưu sau khi đăng nhập)
2. API Authentication
Đăng ký tài khoản
Method: POST
URL: {{baseUrl}}/api/auth/register
Body (form-data):
name: Tên người dùng
email: Email người dùng
password: Mật khẩu
phone: Số điện thoại
Đăng nhập
Method: POST
URL: {{baseUrl}}/api/auth/login
Body (raw JSON):
Apply to README.md
Tests (để tự động lưu token):
Apply to README.md
Đăng xuất
Method: POST
URL: {{baseUrl}}/api/auth/logout
Authorization: Bearer Token, {{token}}
3. Quản lý Danh mục (Category)
Tạo danh mục mới
Method: POST
URL: {{baseUrl}}/api/categories
Authorization: Bearer Token, {{token}}
Body (form-data):
name: Tên danh mục (text)
description: Mô tả (text)
status: true/false (text)
image: Chọn file hình ảnh (file)
Lấy danh sách danh mục
Method: GET
URL: {{baseUrl}}/api/categories
Lấy chi tiết danh mục
Method: GET
URL: {{baseUrl}}/api/categories/:id
Thay :id bằng ID của danh mục
Cập nhật danh mục
Method: PUT
URL: {{baseUrl}}/api/categories/:id
Authorization: Bearer Token, {{token}}
Body (form-data):
name: Tên danh mục mới (text)
description: Mô tả mới (text)
status: true/false (text)
image: Chọn file hình ảnh mới (file) - tùy chọn
Xóa danh mục
Method: DELETE
URL: {{baseUrl}}/api/categories/:id
Authorization: Bearer Token, {{token}}
4. Quản lý Món ăn (Menu Item)
Tạo món ăn mới
Method: POST
URL: {{baseUrl}}/api/menu
Authorization: Bearer Token, {{token}}
Body (form-data):
name: Tên món ăn (text)
description: Mô tả (text)
price: Giá tiền (text, chỉ số)
category: ID của danh mục (text)
status: true/false (text)
image: Chọn file hình ảnh (file)
Lấy danh sách món ăn
Method: GET
URL: {{baseUrl}}/api/menu
Params (Query):
page: Số trang (mặc định 1)
limit: Số món trên một trang (mặc định 10)
Lấy chi tiết món ăn
Method: GET
URL: {{baseUrl}}/api/menu/:id
Thay :id bằng ID của món ăn
Cập nhật món ăn
Method: PUT
URL: {{baseUrl}}/api/menu/:id
Authorization: Bearer Token, {{token}}
Body (form-data):
name: Tên món mới (text)
description: Mô tả mới (text)
price: Giá tiền mới (text, chỉ số)
category: ID của danh mục mới (text)
status: true/false (text)
image: Chọn file hình ảnh mới (file) - tùy chọn
Xóa món ăn
Method: DELETE
URL: {{baseUrl}}/api/menu/:id
Authorization: Bearer Token, {{token}}
5. Kiểm tra hình ảnh
Xem hình ảnh món ăn
Method: GET
URL: {{baseUrl}}/api/uploads/menu_images/[tên-file]
Thay [tên-file] với tên file từ database (ví dụ: image-1744307207881-234662740.jpg)
Xem hình ảnh danh mục
Method: GET
URL: {{baseUrl}}/api/uploads/categories/[tên-file]
Thay [tên-file] với tên file từ database
Lưu ý
Form-data vs JSON:
Khi gửi thông tin có kèm file, sử dụng form-data
Khi chỉ gửi thông tin text, có thể sử dụng raw JSON
Xem hình ảnh:
Có thể xem hình ảnh trực tiếp trong Postman bằng cách gửi GET request đến URL hình ảnh
Xác thực:
Hầu hết các route cần xác thực (trừ đăng nhập, đăng ký và một số GET route)
Luôn đảm bảo token được thêm vào header Authorization khi cần thiết
Xử lý lỗi:
Nếu nhận được lỗi 401, có thể token đã hết hạn - cần đăng nhập lại
Nếu nhận được lỗi 404 khi tải hình ảnh, kiểm tra đường dẫn và tên file

API endpoints cho Reviews:
Tạo Review mới:
Method: POST
URL: {{baseUrl}}/api/reviews
Auth: Bearer Token
Body (form-data):
menuItem: ID của món ăn (text)
rating: 1-5 (text)
comment: Nội dung đánh giá (text)
images: Tối đa 5 hình ảnh (file)
Lấy tất cả Review (Admin):
Method: GET
URL: {{baseUrl}}/api/reviews/admin?status=pending&page=1&limit=10
Auth: Bearer Token (Admin)
Query Params:
status: pending/approved/rejected/all
page: Số trang
limit: Số review mỗi trang
Lấy Review theo món ăn:
Method: GET
URL: {{baseUrl}}/api/reviews/menu-item/:menuItemId?page=1&limit=10
Public: Không cần xác thực
Lấy Review của người dùng hiện tại:
Method: GET
URL: {{baseUrl}}/api/reviews/my-reviews?page=1&limit=10
Auth: Bearer Token
Cập nhật trạng thái Review (Admin):
Method: PATCH
URL: {{baseUrl}}/api/reviews/:id/