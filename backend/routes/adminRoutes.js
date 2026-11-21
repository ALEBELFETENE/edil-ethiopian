const express = require('express');
const {
  listPendingEmployers,
  listPendingOpportunities,
  reviewEmployer,
  reviewOpportunity,
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));
router.get('/employer-verifications', listPendingEmployers);
router.patch('/employer-verifications/:id', reviewEmployer);
router.get('/opportunities/pending', listPendingOpportunities);
router.patch('/opportunities/:id/review', reviewOpportunity);

module.exports = router;
