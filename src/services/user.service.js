const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

class UserService {
    // Lấy tất cả users (phân trang)
    async getAllUsers(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const users = await User.find()
                .select('-password')
                .skip(skip)
                .limit(limit);
            
            const total = await User.countDocuments();
            
            return {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error('Lỗi khi lấy danh sách users');
        }
    }

    // Lấy user theo ID
    async getUserById(id) {
        try {
            const user = await User.findById(id).select('-password');
            if (!user) {
                throw new Error('Không tìm thấy user');
            }
            return user;
        } catch (error) {
            throw new Error('Lỗi khi lấy thông tin user');
        }
    }

    // Tạo user mới
    async createUser(userData) {
        try {
            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('Email đã tồn tại');
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Tạo user mới
            const newUser = new User({
                ...userData,
                password: hashedPassword
            });

            await newUser.save();
            return newUser;
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi tạo user');
        }
    }

    // Cập nhật user
    async updateUser(id, userData) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('Không tìm thấy user');
            }

            // Nếu có mật khẩu mới thì mã hóa
            if (userData.password) {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
            }

            // Cập nhật thông tin user
            Object.assign(user, userData);
            await user.save();

            return user;
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi cập nhật user');
        }
    }

    // Xóa user
    async deleteUser(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('Không tìm thấy user');
            }

            // Không cho phép xóa admin
            if (user.role === 'ADMIN') {
                throw new Error('Không thể xóa tài khoản admin');
            }

            await user.remove();
            return { message: 'Xóa user thành công' };
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi xóa user');
        }
    }

    // Tìm kiếm user
    async searchUsers(query, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const searchQuery = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } }
                ]
            };

            const users = await User.find(searchQuery)
                .select('-password')
                .skip(skip)
                .limit(limit);

            const total = await User.countDocuments(searchQuery);

            return {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error('Lỗi khi tìm kiếm users');
        }
    }

    // Thay đổi trạng thái user
    async toggleUserStatus(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('Không tìm thấy user');
            }

            // Không cho phép thay đổi trạng thái admin
            if (user.role === 'ADMIN') {
                throw new Error('Không thể thay đổi trạng thái admin');
            }

            user.status = user.status === 'active' ? 'banned' : 'active';
            await user.save();

            return user;
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi thay đổi trạng thái user');
        }
    }

    // Cập nhật thông tin cá nhân
    async updateProfile(userId, userData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Không tìm thấy user');
            }

            // Chỉ cho phép cập nhật các trường được phép
            const allowedFields = ['name', 'phone', 'address'];
            const updateData = {};

            // Kiểm tra và lấy các trường được phép cập nhật
            allowedFields.forEach(field => {
                if (userData[field] !== undefined) {
                    updateData[field] = userData[field];
                }
            });

            // Nếu có mật khẩu mới
            if (userData.password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(userData.password, salt);
            }

            // Cập nhật thông tin
            Object.assign(user, updateData);
            await user.save();

            // Trả về thông tin user đã cập nhật (không bao gồm mật khẩu)
            const updatedUser = user.toObject();
            delete updatedUser.password;
            return updatedUser;
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi cập nhật thông tin cá nhân');
        }
    }
}

module.exports = new UserService(); 