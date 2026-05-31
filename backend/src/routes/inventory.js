const express = require('express');
const router = express.Router();
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} = require('../controllers/inventoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getInventoryItems);
router.get('/:id', getInventoryItem);
router.post('/', authorizeRoles('admin', 'manager'), createInventoryItem);
router.put('/:id', authorizeRoles('admin', 'manager'), updateInventoryItem);
router.delete('/:id', authorizeRoles('admin'), deleteInventoryItem);

module.exports = router;
