const express = require('express');
const { getOwnEmployerProfile, upsertEmployerProfile } = require('../controllers/employerController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole('employer'));
router.get('/profile', getOwnEmployerProfile);
router.post('/profile', upsertEmployerProfile);

module.exports = router;
