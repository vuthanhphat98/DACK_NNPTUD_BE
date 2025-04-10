require('dotenv').config();

module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI,

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES: process.env.JWT_EXPIRES || '24h',

    // Email Configuration
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,

    // OTP Configuration
    OTP_SECRET: process.env.OTP_SECRET,
    OTP_EXPIRES: 60, // seconds

    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Session Configuration
    SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    SESSION_EXPIRES: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
}; 