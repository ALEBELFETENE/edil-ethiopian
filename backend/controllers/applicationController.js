const mongoose = require('mongoose');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
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

function validId(value, response) {
  if (mongoose.isValidObjectId(value)) return true;

  response.status(400).json({
    success: false,
    code: 'INVALID_ID',
    message: 'The requested ID is invalid.',
  });
  return false;
}

async function createApplication(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const { opportunityId, coverLetter, resumeUrl } = request.body;
    if (!validId(opportunityId, response)) return;

    const opportunity = await Opportunity.findOne({
      _id: opportunityId,
      status: 'approved',
      deadline: { $gte: new Date() },
    }).select('_id owner applicationMethod');

    if (!opportunity) {
      response.status(404).json({
        success: false,
        code: 'OPPORTUNITY_NOT_FOUND',
        message: 'The opportunity was not found or is no longer available.',
      });
      return;
    }

    if (opportunity.applicationMethod === 'external') {
      response.status(400).json({
        success: false,
        code: 'EXTERNAL_APPLICATION',
        message: 'This opportunity accepts applications through its official external URL.',
      });
      return;
    }

    const application = await Application.create({
      seeker: request.user._id,
      opportunity: opportunity._id,
      employer: opportunity.owner,
      coverLetter,
      resumeUrl,
    });
    await Notification.create({
      recipient: opportunity.owner,
      type: 'application_received',
      title: 'New application received',
      message: `A seeker applied for your opportunity.`,
    });

    response.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error.code === 11000) {
      response.status(409).json({
        success: false,
        code: 'ALREADY_APPLIED',
        message: 'You have already applied to this opportunity.',
      });
      return;
    }
    next(error);
  }
}

async function listMyApplications(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const applications = await Application.find({ seeker: request.user._id })
      .populate('opportunity', 'title type category deadline status')
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
}

async function withdrawApplication(request, response, next) {
  if (!databaseReady(response)) return;
  if (!validId(request.params.id, response)) return;

  try {
    const application = await Application.findOne({
      _id: request.params.id,
      seeker: request.user._id,
    });

    if (!application) {
      response.status(404).json({
        success: false,
        code: 'APPLICATION_NOT_FOUND',
        message: 'The application was not found.',
      });
      return;
    }

    if (['rejected', 'accepted', 'withdrawn'].includes(application.status)) {
      response.status(409).json({
        success: false,
        code: 'INVALID_STATUS_TRANSITION',
        message: 'This application cannot be withdrawn in its current state.',
      });
      return;
    }

    application.status = 'withdrawn';
    await application.save();
    response.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

async function listOpportunityApplications(request, response, next) {
  if (!databaseReady(response)) return;
  if (!validId(request.params.opportunityId, response)) return;

  try {
    const opportunity = await Opportunity.findOne({
      _id: request.params.opportunityId,
      owner: request.user._id,
    }).select('_id');

    if (!opportunity) {
      response.status(404).json({
        success: false,
        code: 'OPPORTUNITY_NOT_FOUND',
        message: 'The opportunity was not found.',
      });
      return;
    }

    const applications = await Application.find({ opportunity: opportunity._id })
      .populate('seeker', 'name email')
      .populate('opportunity', 'title')
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(request, response, next) {
  if (!databaseReady(response)) return;
  if (!validId(request.params.id, response)) return;

  try {
    const { status, employerNote } = request.body;
    const allowedStatuses = ['reviewing', 'shortlisted', 'rejected', 'accepted'];
    if (!allowedStatuses.includes(status)) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'A valid employer application status is required.',
      });
      return;
    }

    const application = await Application.findOne({
      _id: request.params.id,
      employer: request.user._id,
    });

    if (!application) {
      response.status(404).json({
        success: false,
        code: 'APPLICATION_NOT_FOUND',
        message: 'The application was not found.',
      });
      return;
    }

    if (application.status === 'withdrawn') {
      response.status(409).json({
        success: false,
        code: 'INVALID_STATUS_TRANSITION',
        message: 'A withdrawn application cannot be updated.',
      });
      return;
    }

    application.status = status;
    if (employerNote !== undefined) application.employerNote = employerNote;
    await application.save();
    await Notification.create({
      recipient: application.seeker,
      type: 'application_status',
      title: 'Application status updated',
      message: `Your application status is now ${status}.`,
    });
    response.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

async function listEmployerApplications(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const applications = await Application.find({ employer: request.user._id })
      .populate('seeker', 'name email')
      .populate('opportunity', 'title type')
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createApplication,
  listMyApplications,
  withdrawApplication,
  listOpportunityApplications,
  updateApplicationStatus,
  listEmployerApplications,
};
