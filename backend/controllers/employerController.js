const mongoose = require('mongoose');
const Employer = require('../models/Employer');

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true;
  response.status(503).json({
    success: false,
    code: 'DATABASE_UNAVAILABLE',
    message: 'The database is not connected. Please try again later.',
  });
  return false;
}

async function upsertEmployerProfile(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const { displayName, description, website } = request.body;

    if (!displayName) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Employer name is required.',
      });
      return;
    }

    const existing = await Employer.findOne({ owner: request.user._id });
    const profile = await Employer.findOneAndUpdate(
      { owner: request.user._id },
      {
        displayName,
        description,
        website,
        ...(existing?.verificationStatus === 'rejected' ? { verificationStatus: 'pending', verificationReason: undefined } : {}),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    response.status(existing ? 200 : 201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

function getOwnEmployerProfile(request, response, next) {
  if (!databaseReady(response)) return;

  Employer.findOne({ owner: request.user._id })
    .then((profile) => response.status(200).json({ success: true, data: profile }))
    .catch(next);
}

module.exports = { getOwnEmployerProfile, upsertEmployerProfile };
