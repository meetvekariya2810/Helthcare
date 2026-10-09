const express = require('express');
const router = express.Router();
const {
  getDatabaseStats,
  getCollectionsSummary,
  queryCollection,
  triggerSeed,
  importData,
  exportData
} = require('../controllers/adminDatabaseController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All admin database management routes are protected
router.use(protect);
router.use(requireRole('SUPER_ADMIN', 'DIRECTOR', 'AUDITOR'));

// GET /api/admin
router.get('/', (req, res) => {
  res.json({ success: true, message: 'BJK Healthcare Enterprise Administration' });
});

// GET /api/admin/database/stats
router.get('/database/stats', getDatabaseStats);

// GET /api/admin/database/collections
router.get('/database/collections', getCollectionsSummary);

// GET /api/admin/database/query
router.get('/database/query', queryCollection);

// POST /api/admin/database/seed
router.post('/database/seed', requireRole('SUPER_ADMIN'), triggerSeed);

// POST /api/admin/database/import
router.post('/database/import', requireRole('SUPER_ADMIN'), importData);

// GET /api/admin/database/export/:collection
router.get('/database/export/:collection', exportData);

module.exports = router;
