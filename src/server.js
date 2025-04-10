const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const config = require('./config/config');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/error.middleware');
const initAdmin = require('./config/initAdmin');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const menuRoutes = require('./routes/menu.routes');
const categoryRoutes = require('./routes/category.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Khởi tạo admin mặc định
initAdmin();

// Middleware
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: config.SESSION_EXPIRES
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Cần thiết cho multer nếu gửi cả text fields


// Phục vụ file tĩnh từ thư mục 'public'
app.use('/api/uploads',express.static(path.join(__dirname, '../public/uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/check-image/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public/uploads/menu_images', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.send('File exists: ' + filePath);
  } else {
    res.status(404).send('File does not exist: ' + filePath);
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
}); 