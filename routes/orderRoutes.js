const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

router.post('/order/:user_id', orderController.createOrder);
router.get('/order/:user_id', orderController.getUserOrders);
router.get('/order/:user_id/:order_id', orderController.getOrderDetails);
router.put('/order/:order_id', orderController.updateOrderStatus);

module.exports = router;