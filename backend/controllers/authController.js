const User = require('../models/User');
const { databaseReady } = require('../config/db');
const { createAccessToken } = require('../utils/jwt');
const { createVerificationToken, hashVerificationToken } = require('../utils/verificationToken');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  };
}

async function register(request, response, next) {
  try {
    const { name, email, password, role = 'seeker' } = request.body;

    if (!name || !email || !password) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Name, email, and password are required.',
      });
      return;
    }

    if (password.length < 8) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (!['seeker', 'employer'].includes(role)) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'A valid account type is required.',
      });
      return;
    }

    if (!databaseReady(response)) return;

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id');

    if (existingUser) {
      response.status(409).json({
        success: false,
        code: 'EMAIL_EXISTS',
        message: 'An account with this email already exists.',
      });
      return;
    }

    const verification = createVerificationToken();
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      verificationTokenHash: verification.hash,
      verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const token = createAccessToken(user);

    const result = {
      success: true,
      user: publicUser(user),
      token,
      message: 'Account created. Please verify your email address.',
    };
    if (process.env.NODE_ENV !== 'production') result.verificationToken = verification.token;
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(request, response, next) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
      });
      return;
    }

    if (!databaseReady(response)) return;

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    const passwordMatches = user ? await user.comparePassword(password) : false;

    if (!user || !passwordMatches || user.status !== 'active') {
      response.status(401).json({
        success: false,
        code: 'AUTH_INVALID',
        message: 'The email or password is incorrect.',
      });
      return;
    }

    response.status(200).json({
      success: true,
      user: publicUser(user),
      token: createAccessToken(user),
    });
  } catch (error) {
    next(error);
  }
}

function getCurrentUser(request, response) {
  response.status(200).json({
    success: true,
    user: publicUser(request.user),
  });
}

async function updateProfile(request, response, next) {
  try {
    const { name } = request.body;
    if (!name || name.trim().length < 2) {
      response.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'A valid name is required.' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      request.user._id,
      { name: name.trim() },
      { new: true, runValidators: true },
    );
    response.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

async function changePassword(request, response, next) {
  try {
    const { currentPassword, newPassword } = request.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Current password and a new password of at least 8 characters are required.',
      });
      return;
    }

    const user = await User.findById(request.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      response.status(401).json({ success: false, code: 'PASSWORD_INVALID', message: 'The current password is incorrect.' });
      return;
    }

    user.password = newPassword;
    await user.save();
    response.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(request, response, next) {
  try {
    const { token } = request.body;
    if (!token) {
      response.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Verification token is required.' });
      return;
    }

    if (!databaseReady(response)) return;

    const user = await User.findOne({
      verificationTokenHash: hashVerificationToken(token),
      verificationExpiresAt: { $gt: new Date() },
    }).select('+verificationTokenHash +verificationExpiresAt');

    if (!user) {
      response.status(400).json({ success: false, code: 'VERIFICATION_INVALID', message: 'The verification token is invalid or expired.' });
      return;
    }

    user.emailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationExpiresAt = undefined;
    await user.save();
    response.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { changePassword, getCurrentUser, login, register, updateProfile, verifyEmail };
