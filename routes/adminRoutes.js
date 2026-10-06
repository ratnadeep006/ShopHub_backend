const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  getAllReturns,
  approveReturn,
  rejectReturn,
  getAnalytics
} = require('../controllers/adminController');

// ============ USERS ============
router.get('/users', verifyAdmin, apiLimiter, getAllUsers);
router.get('/users/:id', verifyAdmin, apiLimiter, getUserById);
router.delete('/users/:id', verifyAdmin, apiLimiter, deleteUser);

// ============ ORDERS ============
router.get('/orders', verifyAdmin, apiLimiter, getAllOrders);
router.put('/orders/:id/status', verifyAdmin, apiLimiter, updateOrderStatus);

// ============ PRODUCTS ============
router.get('/products', verifyAdmin, apiLimiter, getAllProducts);
router.post('/products', verifyAdmin, apiLimiter, addProduct);
router.put('/products/:id', verifyAdmin, apiLimiter, updateProduct);
router.delete('/products/:id', verifyAdmin, apiLimiter, deleteProduct);

// ============ COUPONS ============
router.get('/coupons', verifyAdmin, apiLimiter, getAllCoupons);
router.post('/coupons', verifyAdmin, apiLimiter, addCoupon);
router.put('/coupons/:id', verifyAdmin, apiLimiter, updateCoupon);
router.delete('/coupons/:id', verifyAdmin, apiLimiter, deleteCoupon);

// ============ RETURNS ============
router.get('/returns', verifyAdmin, apiLimiter, getAllReturns);
router.put('/returns/:id/approve', verifyAdmin, apiLimiter, approveReturn);
router.put('/returns/:id/reject', verifyAdmin, apiLimiter, rejectReturn);

// ============ ANALYTICS ============
router.get('/analytics', verifyAdmin, apiLimiter, getAnalytics);

module.exports = router;