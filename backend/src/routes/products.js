const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, createCategory } = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getProducts);
router.get('/categories', getCategories);
router.post('/categories', authorizeRoles('admin', 'manager'), createCategory);
router.get('/:id', getProduct);
router.post('/', authorizeRoles('admin', 'manager'), createProduct);
router.put('/:id', authorizeRoles('admin', 'manager'), updateProduct);
router.delete('/:id', authorizeRoles('admin'), deleteProduct);

module.exports = router;
