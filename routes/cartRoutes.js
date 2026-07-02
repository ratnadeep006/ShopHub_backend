const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/cart/:user_id', cartController.addToCart);
router.get('/cart/:user_id', cartController.getCart);
router.put('/cart/:user_id/:product_id', cartController.updateQuantity);  
router.delete('/cart/:user_id/:product_id', cartController.removeFromCart);
router.delete('/cart/:user_id', cartController.clearCart);  // ← Add this

module.exports = router;