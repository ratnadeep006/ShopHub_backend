const db = require('../config/db');

// ADD REVIEW
exports.addReview = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.body.user_id;  // From frontend

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      const error = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      return next(error);
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      const error = new Error('Comment cannot be empty');
      error.statusCode = 400;
      return next(error);
    }

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

    // Check if user already reviewed this product
    const [existingReview] = await db.query(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (existingReview.length > 0) {
      const error = new Error('You already reviewed this product');
      error.statusCode = 409;
      return next(error);
    }

    // Insert review
    await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, product_id, rating, comment]
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });

  } catch (error) {
    next(error);
  }
};

// GET PRODUCT REVIEWS (with user names)
exports.getProductReviews = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    const [results] = await db.query(
      `SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, u.name as userName
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [product_id]
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

// GET PRODUCT RATING (Average rating)
exports.getProductRating = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    const [results] = await db.query(
      `SELECT 
        AVG(rating) AS averageRating,
        COUNT(*) AS totalReviews
       FROM reviews
       WHERE product_id = ?`,
      [product_id]
    );

    const averageRating = results[0].averageRating ? parseFloat(results[0].averageRating).toFixed(1) : 0;
    const totalReviews = results[0].totalReviews || 0;

    res.json({
      success: true,
      averageRating: averageRating,
      totalReviews: totalReviews
    });

  } catch (error) {
    next(error);
  }
};

// DELETE REVIEW
exports.deleteReview = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const user_id = req.body.user_id;  // Check if user owns review

    // Get review first
    const [review] = await db.query(
      'SELECT user_id FROM reviews WHERE id = ?',
      [review_id]
    );

    if (review.length === 0) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user owns this review
    if (review[0].user_id !== user_id) {
      const error = new Error('You can only delete your own review');
      error.statusCode = 403;
      return next(error);
    }

    // Delete review
    await db.query(
      'DELETE FROM reviews WHERE id = ?',
      [review_id]
    );

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE REVIEW
exports.updateReview = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.body.user_id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      const error = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      return next(error);
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      const error = new Error('Comment cannot be empty');
      error.statusCode = 400;
      return next(error);
    }

    // Get review first
    const [review] = await db.query(
      'SELECT user_id FROM reviews WHERE id = ?',
      [review_id]
    );

    if (review.length === 0) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user owns this review
    if (review[0].user_id !== user_id) {
      const error = new Error('You can only edit your own review');
      error.statusCode = 403;
      return next(error);
    }

    // Update review
    await db.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, review_id]
    );

    res.json({
      success: true,
      message: 'Review updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

// GET USER'S REVIEWS
exports.getUserReviews = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const [results] = await db.query(
      `SELECT r.id, r.product_id, r.rating, r.comment, r.created_at, p.name as productName
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
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