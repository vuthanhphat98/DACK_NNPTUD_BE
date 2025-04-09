const authService = require('../services/auth.service');

exports.register = async (req, res) => {
    try {
        await authService.register(req.body);
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOTP(email, otp);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
}; 