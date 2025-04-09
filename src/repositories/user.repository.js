const User = require('../models/user.model');

class UserRepository {
    async create(userData) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            return await User.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            return await User.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: Date.now() },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            return await User.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            return await User.find();
        } catch (error) {
            throw error;
        }
    }

    async findByRole(role) {
        try {
            return await User.find({ role });
        } catch (error) {
            throw error;
        }
    }

    async updateStatus(id, status) {
        try {
            return await User.findByIdAndUpdate(
                id,
                { status, updatedAt: Date.now() },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserRepository(); 