const crypto = require('crypto');

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

function hashVerificationToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { createVerificationToken, hashVerificationToken };
