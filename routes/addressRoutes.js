const express = require('express');
const router = express.Router();
const {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');
const { apiLimiter } = require('../middleware/rateLimiter');

// POST - Add address
router.post('/addresses/:user_id', apiLimiter, addAddress);

// GET - Get all addresses for user
router.get('/addresses/:user_id', apiLimiter, getUserAddresses);

// PUT - Update address
router.put('/addresses/:address_id', apiLimiter, updateAddress);

// DELETE - Delete address
router.delete('/addresses/:address_id', apiLimiter, deleteAddress);

// PUT - Set as default
router.put('/addresses/:address_id/default', apiLimiter, setDefaultAddress);

module.exports = router;