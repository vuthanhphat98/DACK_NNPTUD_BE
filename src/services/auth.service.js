const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const userRepository = require('../repositories/user.repository');
const otpService = require('./otp.service');
const AppError = require('../utils/appError');

class AuthService {
    async register(userData) {
        try {
            // Kiểm tra email đã tồn tại
            const existingUser = await userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError('Email đã tồn tại', 400);
            }

            // Tạo user mới
            const newUser = await userRepository.create(userData);
            return newUser;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            // Tìm user theo email
            const user = await userRepository.findByEmail(email);
            if (!user) {
                throw new AppError('Email hoặc mật khẩu không đúng', 401);
            }

            // Kiểm tra trạng thái tài khoản
            if (user.status === 'banned') {
                throw new AppError('Tài khoản của bạn đã bị khóa', 403);
            }

            // So sánh mật khẩu
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new AppError('Email hoặc mật khẩu không đúng', 401);
            }

            // Tạo và gửi OTP
            const otp = await otpService.generateOTP(user.email);

            return {
                message: 'Mã OTP đã được gửi đến email của bạn',
                otp
            };
        } catch (error) {
            throw error;
        }
    }

    generateToken(user) {
        // Chỉ lưu id và role trong token để bảo mật
        return jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );
    }

    async generateAndSendOTP(email) {
        const otp = speakeasy.totp({
            secret: process.env.OTP_SECRET,
            encoding: 'base32',
            step: 60
        });

        // Cấu hình email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Gửi email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã OTP xác thực đăng nhập',
            text: `Mã OTP của bạn là: ${otp}`
        });

        return otp;
    }

    async verifyOTP(email, otp) {
        try {
            const isValid = await otpService.verifyOTP(email, otp);
            if (!isValid) {
                throw new AppError('Mã OTP không hợp lệ', 400);
            }

            const user = await userRepository.findByEmail(email);
            if (!user) {
                throw new AppError('Người dùng không tồn tại', 404);
            }

            // Tạo token với thông tin ẩn
            const token = this.generateToken(user);

            return {
                message: 'Xác thực thành công',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService(); 