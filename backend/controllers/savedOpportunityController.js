const mongoose = require('mongoose');
const SavedOpportunity = require('../models/SavedOpportunity');
const Opportunity = require('../models/Opportunity');

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true;
  response.status(503).json({ success: false, code: 'DATABASE_UNAVAILABLE', message: 'The database is not connected. Please try again later.' });
  return false;
}

async function saveOpportunity(request, response, next) {
  if (!databaseReady(response)) return;
  if (!mongoose.isValidObjectId(request.params.opportunityId)) {
    response.status(400).json({ success: false, code: 'INVALID_ID', message: 'The opportunity ID is invalid.' });
    return;
  }

  try {
    const opportunity = await Opportunity.findOne({ _id: request.params.opportunityId, status: 'approved', deadline: { $gte: new Date() } }).select('_id');
    if (!opportunity) {
      response.status(404).json({ success: false, code: 'OPPORTUNITY_NOT_FOUND', message: 'The opportunity was not found or is no longer available.' });
      return;
    }

    const saved = await SavedOpportunity.create({ seeker: request.user._id, opportunity: opportunity._id });
    response.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error.code === 11000) {
      response.status(409).json({ success: false, code: 'ALREADY_SAVED', message: 'This opportunity is already saved.' });
      return;
    }
    next(error);
  }
}

async function listSavedOpportunities(request, response, next) {
  if (!databaseReady(response)) return;
  try {
    const saved = await SavedOpportunity.find({ seeker: request.user._id })
      .populate('opportunity', 'title type category location remote deadline employer')
      .sort({ createdAt: -1 })
      .lean();
    response.status(200).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
}

async function removeSavedOpportunity(request, response, next) {
  if (!databaseReady(response)) return;
  if (!mongoose.isValidObjectId(request.params.opportunityId)) {
    response.status(400).json({ success: false, code: 'INVALID_ID', message: 'The opportunity ID is invalid.' });
    return;
  }

  try {
    const removed = await SavedOpportunity.findOneAndDelete({
      seeker: request.user._id,
      opportunity: request.params.opportunityId,
    });
    if (!removed) {
      response.status(404).json({ success: false, code: 'SAVED_OPPORTUNITY_NOT_FOUND', message: 'The saved opportunity was not found.' });
      return;
    }
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listSavedOpportunities, removeSavedOpportunity, saveOpportunity };
