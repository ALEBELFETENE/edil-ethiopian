const express = require('express');
const {
  createApplication,
  listMyApplications,
  withdrawApplication,
  listOpportunityApplications,
  updateApplicationStatus,
  listEmployerApplications,
} = require('../controllers/applicationController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.post('/', requireRole('seeker'), createApplication);
router.get('/mine', requireRole('seeker'), listMyApplications);
router.get('/employer/mine', requireRole('employer'), listEmployerApplications);
router.patch('/:id/withdraw', requireRole('seeker'), withdrawApplication);
router.get(
  '/opportunity/:opportunityId',
  requireRole('employer'),
  listOpportunityApplications,
);
router.patch('/:id/status', requireRole('employer'), updateApplicationStatus);

module.exports = router;
