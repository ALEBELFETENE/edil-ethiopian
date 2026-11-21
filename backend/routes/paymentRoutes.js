const express = require('express');
const { listMyPayments, listPendingPayments, reviewPayment, submitOpportunityPayment } = require('../controllers/paymentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/opportunity-fee', requireAuth, requireRole('employer'), submitOpportunityPayment);
router.get('/mine', requireAuth, requireRole('employer'), listMyPayments);
router.get('/pending', requireAuth, requireRole('admin'), listPendingPayments);
router.patch('/:id/review', requireAuth, requireRole('admin'), reviewPayment);

module.exports = router;
