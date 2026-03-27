const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');

router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.patch('/:id/status', auth, updateOrderStatus);

module.exports = router;
