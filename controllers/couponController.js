const db = require('../config/db');

// ADD COUPON
exports.addCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discount_percent,
      min_order_amount,
      max_uses,
      expiry_date,
      is_active
    } = req.body;

    // Validate required fields
    if (!code || code.trim().length === 0) {
      const error = new Error('Coupon code is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!discount_percent || discount_percent < 1 || discount_percent > 100) {
      const error = new Error('Discount percent must be between 1 and 100');
      error.statusCode = 400;
      return next(error);
    }

    // Check if coupon code already exists
    const [existingCoupon] = await db.query(
      'SELECT id FROM coupons WHERE code = ?',
      [code]
    );

    if (existingCoupon.length > 0) {
      const error = new Error('Coupon code already exists');
      error.statusCode = 409;
      return next(error);
    }

    // Insert coupon
    await db.query(
      `INSERT INTO coupons 
        (code, discount_percent, min_order_amount, max_uses, expiry_date, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        code.trim().toUpperCase(),
        discount_percent,
        min_order_amount || 0.00,
        max_uses !== undefined ? max_uses : -1,
        expiry_date || null,
        is_active !== undefined ? is_active : 1
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Coupon added successfully'
    });

  } catch (error) {
    next(error);
  }
};

// GET ALL COUPONS
exports.getAllCoupons = async (req, res, next) => {
  try {
    const [results] = await db.query(
      `SELECT id, code, discount_percent, min_order_amount, max_uses, current_uses, expiry_date, is_active, created_at
       FROM coupons
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

// GET COUPON BY CODE
exports.getCouponByCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const [results] = await db.query(
      `SELECT id, code, discount_percent, min_order_amount, max_uses, current_uses, expiry_date, is_active, created_at
       FROM coupons
       WHERE code = ?`,
      [code.trim().toUpperCase()]
    );

    if (results.length === 0) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: results[0]
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE COUPON
exports.updateCoupon = async (req, res, next) => {
  try {
    const { coupon_id } = req.params;
    const {
      discount_percent,
      min_order_amount,
      max_uses,
      expiry_date,
      is_active
    } = req.body;

    // Validate discount percent
    if (!discount_percent || discount_percent < 1 || discount_percent > 100) {
      const error = new Error('Discount percent must be between 1 and 100');
      error.statusCode = 400;
      return next(error);
    }

    // Get coupon first
    const [coupon] = await db.query(
      'SELECT id FROM coupons WHERE id = ?',
      [coupon_id]
    );

    if (coupon.length === 0) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    // Update coupon
    await db.query(
      `UPDATE coupons 
       SET discount_percent = ?, min_order_amount = ?, max_uses = ?, expiry_date = ?, is_active = ?
       WHERE id = ?`,
      [
        discount_percent,
        min_order_amount || 0.00,
        max_uses !== undefined ? max_uses : -1,
        expiry_date || null,
        is_active !== undefined ? is_active : 1,
        coupon_id
      ]
    );

    res.json({
      success: true,
      message: 'Coupon updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

// DELETE COUPON
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { coupon_id } = req.params;

    // Get coupon first
    const [coupon] = await db.query(
      'SELECT id FROM coupons WHERE id = ?',
      [coupon_id]
    );

    if (coupon.length === 0) {
      const error = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    // Delete coupon
    await db.query(
      'DELETE FROM coupons WHERE id = ?',
      [coupon_id]
    );

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// VALIDATE / APPLY COUPON (checked at checkout)
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, order_amount } = req.body;

    // Validate input
    if (!code || code.trim().length === 0) {
      const error = new Error('Coupon code is required');
      error.statusCode = 400;
      return next(error);
    }

    if (order_amount === undefined || order_amount === null || order_amount < 0) {
      const error = new Error('Valid order amount is required');
      error.statusCode = 400;
      return next(error);
    }

    // Get coupon
    const [results] = await db.query(
      'SELECT * FROM coupons WHERE code = ?',
      [code.trim().toUpperCase()]
    );

    if (results.length === 0) {
      const error = new Error('Invalid coupon code');
      error.statusCode = 404;
      return next(error);
    }

    const coupon = results[0];

    // Check if active
    if (!coupon.is_active) {
      const error = new Error('This coupon is no longer active');
      error.statusCode = 400;
      return next(error);
    }

    // Check expiry
    if (coupon.expiry_date) {
      const today = new Date();
      const expiry = new Date(coupon.expiry_date);
      if (today > expiry) {
        const error = new Error('This coupon has expired');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Check usage limit (max_uses = -1 means unlimited)
    if (coupon.max_uses !== -1 && coupon.current_uses >= coupon.max_uses) {
      const error = new Error('This coupon has reached its usage limit');
      error.statusCode = 400;
      return next(error);
    }

    // Check minimum order amount
    if (order_amount < coupon.min_order_amount) {
      const error = new Error(`Minimum order amount of ${coupon.min_order_amount} required for this coupon`);
      error.statusCode = 400;
      return next(error);
    }

    // Calculate discount
    const discountAmount = (order_amount * coupon.discount_percent) / 100;
    const finalAmount = order_amount - discountAmount;

    // Increment usage count
    await db.query(
      'UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?',
      [coupon.id]
    );

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: finalAmount.toFixed(2)
      }
    });

  } catch (error) {
    next(error);
  }
};