const express = require('express');
const router = express.Router();

const { 
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkInWishlist,
  clearWishlist,
  getWishlistCount
} = require('../controllers/wishlistController');

const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/wishlist/:user_id/:product_id', apiLimiter, addToWishlist);
router.get('/wishlist/:user_id', apiLimiter, getWishlist);
router.delete('/wishlist/:user_id/:product_id', apiLimiter, removeFromWishlist);
router.get('/wishlist/check/:user_id/:product_id', apiLimiter, checkInWishlist);
router.delete('/wishlist/:user_id', apiLimiter, clearWishlist);
router.get('/wishlist/count/:user_id', apiLimiter, getWishlistCount);

module.exports = router;