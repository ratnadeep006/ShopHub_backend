const express = require('express');
const router = express.Router();
const {
  addReview,
  getProductReviews,
  getProductRating,
  deleteReview,
  updateReview,
  getUserReviews
} = require('../controllers/reviewController');
const { apiLimiter } = require('../middleware/rateLimiter');

// POST - Add review
router.post('/reviews/product/:product_id', apiLimiter, addReview);

// GET - Get all reviews for a product
router.get('/reviews/product/:product_id', apiLimiter, getProductReviews);

// GET - Get average rating for a product
router.get('/reviews/product/:product_id/rating', apiLimiter, getProductRating);

// GET - Get user's reviews
router.get('/reviews/user/:user_id', apiLimiter, getUserReviews);

// DELETE - Delete a review
router.delete('/reviews/:review_id', apiLimiter, deleteReview);

// PUT - Update a review
router.put('/reviews/:review_id', apiLimiter, updateReview);

module.exports = router;