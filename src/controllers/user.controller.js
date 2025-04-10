const userService = require('../services/user.service');

class UserController {
    // Lấy tất cả users
    async getAllUsers(req, res) {
        try {
            const { page, limit } = req.query;
            const result = await userService.getAllUsers(parseInt(page), parseInt(limit));
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy user theo ID
    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    // Tạo user mới
    async createUser(req, res) {
        try {
            const newUser = await userService.createUser(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Cập nhật user
    async updateUser(req, res) {
        try {
            const updatedUser = await userService.updateUser(req.params.id, req.body);
            res.json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Xóa user
    async deleteUser(req, res) {
        try {
            const result = await userService.deleteUser(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Tìm kiếm user
    async searchUsers(req, res) {
        try {
            const { query, page, limit } = req.query;
            const result = await userService.searchUsers(query, parseInt(page), parseInt(limit));
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Thay đổi trạng thái user
    async toggleUserStatus(req, res) {
        try {
            const user = await userService.toggleUserStatus(req.params.id);
            res.json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Cập nhật thông tin cá nhân
    async updateProfile(req, res) {
        try {
            const userId = req.session.user._id;
            const updatedUser = await userService.updateProfile(userId, req.body);
            res.json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new UserController(); 