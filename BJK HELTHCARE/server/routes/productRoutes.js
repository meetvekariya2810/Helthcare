const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Public / Read routes
router.get('/categories', getProductCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected mutation routes
router.post('/', protect, requireRole('SUPER_ADMIN', 'DIRECTOR', 'QA_MANAGER', 'REGULATORY_MANAGER', 'PRODUCTION_MANAGER'), createProduct);
router.put('/:id', protect, requireRole('SUPER_ADMIN', 'DIRECTOR', 'QA_MANAGER', 'REGULATORY_MANAGER', 'PRODUCTION_MANAGER'), updateProduct);
router.patch('/:id', protect, requireRole('SUPER_ADMIN', 'DIRECTOR', 'QA_MANAGER', 'REGULATORY_MANAGER', 'PRODUCTION_MANAGER'), updateProduct);
router.delete('/:id', protect, requireRole('SUPER_ADMIN', 'DIRECTOR'), deleteProduct);

module.exports = router;
