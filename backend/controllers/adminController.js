const mongoose = require('mongoose');
const Employer = require('../models/Employer');
const Opportunity = require('../models/Opportunity');

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true;
  response.status(503).json({
    success: false,
    code: 'DATABASE_UNAVAILABLE',
    message: 'The database is not connected. Please try again later.',
  });
  return false;
}

async function listPendingEmployers(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const profiles = await Employer.find({ verificationStatus: 'pending' })
      .populate('owner', 'name email')
      .sort({ createdAt: 1 })
      .lean();
    response.status(200).json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
}

async function reviewEmployer(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const { status, reason } = request.body;
    if (!['verified', 'rejected', 'suspended'].includes(status)) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Status must be verified, rejected, or suspended.',
      });
      return;
    }

    const profile = await Employer.findByIdAndUpdate(
      request.params.id,
      { verificationStatus: status, verificationReason: reason || undefined },
      { new: true, runValidators: true },
    );

    if (!profile) {
      response.status(404).json({
        success: false,
        code: 'EMPLOYER_NOT_FOUND',
        message: 'Employer profile was not found.',
      });
      return;
    }

    response.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

async function listPendingOpportunities(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const opportunities = await Opportunity.find({ status: 'pending_approval' })
      .populate('owner', 'name email')
      .populate('employer', 'displayName')
      .sort({ createdAt: 1 })
      .lean();
    response.status(200).json({ success: true, data: opportunities });
  } catch (error) {
    next(error);
  }
}

async function reviewOpportunity(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const { action, reason } = request.body;
    const statusByAction = { approve: 'approved', reject: 'rejected', archive: 'archived' };

    if (!statusByAction[action]) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Action must be approve, reject, or archive.',
      });
      return;
    }

    if (action === 'reject' && !reason) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'A rejection reason is required.',
      });
      return;
    }

    const update = {
      status: statusByAction[action],
      rejectionReason: action === 'reject' ? reason : undefined,
      ...(action === 'approve' ? { publishedAt: new Date() } : {}),
    };
    const opportunity = await Opportunity.findByIdAndUpdate(request.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!opportunity) {
      response.status(404).json({
        success: false,
        code: 'OPPORTUNITY_NOT_FOUND',
        message: 'Opportunity was not found.',
      });
      return;
    }

    response.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPendingEmployers,
  listPendingOpportunities,
  reviewEmployer,
  reviewOpportunity,
};
