const nodemailer = require('nodemailer');

// Biến toàn cục để lưu trữ OTP
const otpStore = new Map();

class OTPService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async generateOTP(email) {
        try {
            // Tạo OTP ngẫu nhiên 6 chữ số
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Lưu OTP với thời gian hết hạn
            otpStore.set(email, {
                otp,
                expires: Date.now() + 120 * 1000 // 120 giây
            });

            // Cấu hình email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Mã OTP xác thực',
                text: `Mã đăng nhập của bạn là ${otp}`
            };

            // Gửi email
            await this.transporter.sendMail(mailOptions);
            return otp;
        } catch (error) {
            throw error;
        }
    }

    async verifyOTP(email, userInputOTP) {
        try {
            const storedOTP = otpStore.get(email);
            
            if (!storedOTP) {
                throw new Error('Không tìm thấy mã OTP cho email này');
            }

            if (Date.now() > storedOTP.expires) {
                otpStore.delete(email);
                throw new Error('Mã OTP đã hết hạn');
            }

            if (storedOTP.otp !== userInputOTP) {
                throw new Error('Mã OTP không đúng');
            }

            // Xóa OTP sau khi xác thực thành công
            otpStore.delete(email);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OTPService(); 