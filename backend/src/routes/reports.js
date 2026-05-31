const express = require('express');
const router = express.Router();
const { getDailyReport, getMonthlyReport } = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('admin', 'manager'));

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
