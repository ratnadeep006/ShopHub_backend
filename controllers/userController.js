const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../services/emailService');

// REGISTER
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      return next(error);
    }

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'User Registered Successfully',
      user_id: result.insertId
    });

  } catch (error) {
    next(error);
  }
};

// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [result] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (result.length === 0) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // Create JWT token WITH ROLE
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login Successfully',
      token: token,
      role: user.role, 
      data: userWithoutPassword
    });

  } catch (error) {
    next(error);
  }
};

// GET USER LIST
exports.user_list = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'SELECT id, name, email, created_at FROM users'
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
exports.get_user_by_id = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );

    if (result.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [user] = await db.query(
      'SELECT id, name FROM users WHERE email = ?',
      [email]
    );

    if (user.length === 0) {
      const error = new Error('No account found with this email');
      error.statusCode = 404;
      return next(error);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user[0].id]
    );

    // Send email
    await sendResetEmail(email, resetToken, user[0].name);

    res.json({
      success: true,
      message: 'Password reset email sent! Check your inbox'
    });

  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      const error = new Error('Token and new password are required');
      error.statusCode = 400;
      return next(error);
    }

    if (newPassword.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.statusCode = 400;
      return next(error);
    }

    // Find user with valid token
    const [user] = await db.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (user.length === 0) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      return next(error);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user[0].id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully! You can now login'
    });

  } catch (error) {
    next(error);
  }
};