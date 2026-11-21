const express = require('express');
const {
  createOpportunity,
  getOpportunity,
  listOpportunities,
} = require('../controllers/opportunityController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listOpportunities);
router.get('/:id', getOpportunity);
router.post('/', requireAuth, requireRole('employer', 'admin'), createOpportunity);

module.exports = router;
