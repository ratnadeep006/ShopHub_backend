const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { 
  validateRegister,
  validateLogin,
  handleValidationErrors  
} = require('../middleware/validation');
const { 
  loginLimiter,
  registerLimiter,
  passwordResetLimiter
} = require('../middleware/rateLimiter');

// ============ AUTH ROUTES ============

// REGISTER
router.post(
  '/register',
  registerLimiter,
  validateRegister,
  handleValidationErrors,
  userController.register
);

// LOGIN
router.post(
  '/login',
  loginLimiter,
  validateLogin,
  handleValidationErrors,
  userController.login
);

// FORGOT PASSWORD
router.post(
  '/forgot-password',
  passwordResetLimiter,
  userController.forgotPassword
);

// RESET PASSWORD
router.post(
  '/reset-password',
  userController.resetPassword
);

// ============ USER ROUTES ============

// GET all users list
router.get(
  '/list',
  userController.user_list
);

// GET user by ID (protected)
router.get(
  '/user/:id',
  verifyToken,
  userController.get_user_by_id
);

// UPDATE profile (protected)
router.put(
  '/user/:id',
  verifyToken,
  userController.updateProfile
);

module.exports = router;  