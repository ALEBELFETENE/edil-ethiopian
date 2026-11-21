const mongoose = require('mongoose');

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true;

  response.status(503).json({
    success: false,
    code: 'DATABASE_UNAVAILABLE',
    message: 'The database is not connected. Please try again later.',
  });
  return false;
}

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI is not configured; database features are unavailable.');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected.');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = connectDatabase;
module.exports.databaseReady = databaseReady;
