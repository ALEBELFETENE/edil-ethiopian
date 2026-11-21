const User = require('../models/User');
const { databaseReady } = require('../config/db');
const { verifyAccessToken } = require('../utils/jwt');

async function requireAuth(request, response, next) {
  const authorization = request.get('authorization');
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    response.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'A valid bearer token is required.',
    });
    return;
  }

  if (!databaseReady(response)) return;

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('_id name email role status');

    if (!user || user.status !== 'active') {
      response.status(401).json({
        success: false,
        code: 'AUTH_INVALID',
        message: 'The account is unavailable or the token is invalid.',
      });
      return;
    }

    request.user = user;
    next();
  } catch (error) {
    response.status(401).json({
      success: false,
      code: 'AUTH_INVALID',
      message: 'The token is invalid or expired.',
    });
  }
}

function requireRole(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      response.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };
