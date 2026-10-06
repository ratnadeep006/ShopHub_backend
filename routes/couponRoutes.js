const express = require('express');
const router = express.Router();
const {
  addCoupon,
  getAllCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');

// POST - Add a new coupon
router.post('/coupons', addCoupon);

// GET - Get all coupons
router.get('/coupons', getAllCoupons);

// GET - Get a single coupon by code
router.get('/coupons/:code', getCouponByCode);

// PUT - Update a coupon
router.put('/coupons/:coupon_id', updateCoupon);

// DELETE - Delete a coupon
router.delete('/coupons/:coupon_id', deleteCoupon);

// POST - Validate and apply a coupon at checkout
router.post('/coupons/validate', validateCoupon);

module.exports = router;