const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, getOrderByInvoice, getDashboardStats, getTables } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/dashboard-stats', getDashboardStats);
router.get('/tables', getTables);
router.get('/invoice/:invoiceNo', getOrderByInvoice);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

module.exports = router;
