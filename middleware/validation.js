const { body, validationResult } = require('express-validator');

// REGISTER VALIDATION RULES
exports.validateRegister = [
  // Rule 1: Check username
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isLength({ max: 50 }).withMessage('Username must not exceed 50 characters'),

  // Rule 2: Check email
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email format is invalid')
    .normalizeEmail(), // Convert to lowercase

  // Rule 3: Check password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 50 }).withMessage('Password must not exceed 50 characters'),
];

// LOGIN VALIDATION RULES
exports.validateLogin = [
  // Rule 1: Check email
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email format is invalid')
    .normalizeEmail(), // Convert to lowercase

  // Rule 2: Check password
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// HANDLE ALL VALIDATION ERRORS (for both register and login)
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Get first error
    const firstError = errors.array()[0].msg;
    
    return res.json({
      success: false,
      message: firstError
    });
  }
  
  // If no errors, continue to controller
  next();
};