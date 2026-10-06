const db = require('../config/db');

// ADD TO WISHLIST
exports.addToWishlist = async (req, res, next) => {
  try {
    const { user_id, product_id } = req.params;

    // Check if product exists
    const [product] = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [product_id]
    );

    if (product.length === 0) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if already in wishlist
    const [existing] = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (existing.length > 0) {
      const error = new Error('Product already in wishlist');
      error.statusCode = 409;
      return next(error);
    }

    // Insert into wishlist
    await db.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [user_id, product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });

  } catch (error) {
    next(error);
  }
};

// GET WISHLIST (with product details)
exports.getWishlist = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.query(
      `SELECT p.id, p.name, p.price, p.image, p.description
       FROM products p
       JOIN wishlist w ON p.id = w.product_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

// REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { user_id, product_id } = req.params;

    const [result] = await db.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (result.affectedRows === 0) {
      const error = new Error('Product not in wishlist');
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    next(error);
  }
};

// CHECK IF IN WISHLIST
exports.checkInWishlist = async (req, res, next) => {
  try {
    const { user_id, product_id } = req.params;

    const [results] = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ? LIMIT 1',
      [user_id, product_id]
    );

    res.json({
      success: true,
      inWishlist: results.length > 0
    });

  } catch (error) {
    next(error);
  }
};

// CLEAR ENTIRE WISHLIST
exports.clearWishlist = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    await db.query(
      'DELETE FROM wishlist WHERE user_id = ?',
      [user_id]
    );

    res.json({
      success: true,
      message: 'Wishlist cleared'
    });

  } catch (error) {
    next(error);
  }
};

// GET WISHLIST COUNT
exports.getWishlistCount = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.query(
      'SELECT COUNT(*) AS count FROM wishlist WHERE user_id = ?',
      [user_id]
    );

    res.json({
      success: true,
      count: results[0].count
    });

  } catch (error) {
    next(error);
  }
};