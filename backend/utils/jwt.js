const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return secret;
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { createAccessToken, verifyAccessToken };
