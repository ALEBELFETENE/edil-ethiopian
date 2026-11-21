const express = require('express');
const {
  changePassword,
  getCurrentUser,
  login,
  register,
  updateProfile,
  verifyEmail,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/profile', requireAuth, updateProfile);
router.patch('/password', requireAuth, changePassword);
router.post('/verify-email', verifyEmail);

module.exports = router;
