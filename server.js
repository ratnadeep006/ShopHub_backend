require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Import database
const db = require('./config/db');

// Import Redis 
const redis = require('./config/redis');

// Import rate limiter
const { apiLimiter } = require('./middleware/rateLimiter');
app.use(apiLimiter);

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const addressRoutes = require('./routes/addressRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/users', userRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', reviewRoutes);
app.use('/api', addressRoutes);
app.use('/api', couponRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});