const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
    try {
        // Kiểm tra xem đã có admin chưa
        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
        
        if (!existingAdmin) {
            // Tạo admin mặc định
            const admin = new User({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: '123456Aa',
                phone: '0123456789',
                role: 'ADMIN',
                status: 'active'
            });

            // Lưu admin vào database
            await admin.save();
            console.log('Admin mặc định đã được tạo thành công');
        } else {
            console.log('Admin mặc định đã tồn tại');
        }
    } catch (error) {
        console.error('Lỗi khi tạo admin mặc định:', error);
    }
};

module.exports = initAdmin; 