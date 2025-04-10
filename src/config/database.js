const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI, {
            // Remove deprecated options
            // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Add more detailed error logging
        if (error.name === 'MongoServerError') {
            console.error('MongoDB Server Error:', error.message);
        } else if (error.name === 'MongooseError') {
            console.error('Mongoose Error:', error.message);
        } else {
            console.error('Unknown Error:', error);
        }
        process.exit(1);
    }
};

module.exports = connectDB; 