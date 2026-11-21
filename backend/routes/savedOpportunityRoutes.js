const express = require('express');
const { listSavedOpportunities, removeSavedOpportunity, saveOpportunity } = require('../controllers/savedOpportunityController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth, requireRole('seeker'));
router.get('/', listSavedOpportunities);
router.post('/:opportunityId', saveOpportunity);
router.delete('/:opportunityId', removeSavedOpportunity);

module.exports = router;
