const mongoose = require('mongoose');
const Employer = require('../models/Employer');
const Opportunity = require('../models/Opportunity');
const Payment = require('../models/Payment');

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true;

  response.status(503).json({
    success: false,
    code: 'DATABASE_UNAVAILABLE',
    message: 'The database is not connected. Please try again later.',
  });
  return false;
}

function parsePage(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

async function listOpportunities(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const page = parsePage(request.query.page, 1, 100000);
    const limit = parsePage(request.query.limit, 12, 50);
    const query = { status: 'approved', deadline: { $gte: new Date() } };

    if (request.query.type) query.type = request.query.type;
    if (request.query.category) query.category = request.query.category;
    if (request.query.location) query.location = new RegExp(request.query.location, 'i');
    if (request.query.remote === 'true') query.remote = true;
    if (request.query.q) query.$text = { $search: request.query.q };

    const [items, total] = await Promise.all([
      Opportunity.find(query)
        .populate('employer', 'displayName website')
        .sort({ featured: -1, publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Opportunity.countDocuments(query),
    ]);

    response.status(200).json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

async function getOpportunity(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: 'The opportunity ID is invalid.',
      });
      return;
    }

    const opportunity = await Opportunity.findOne({
      _id: request.params.id,
      status: 'approved',
      deadline: { $gte: new Date() },
    }).populate('employer', 'displayName description website');

    if (!opportunity) {
      response.status(404).json({
        success: false,
        code: 'OPPORTUNITY_NOT_FOUND',
        message: 'The opportunity was not found or is no longer available.',
      });
      return;
    }

    response.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
}

async function createOpportunity(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const {
      title,
      description,
      type,
      category,
      deadline,
      applicationMethod = 'platform',
      officialUrl,
      paymentId,
    } = request.body;

    if (!title || !description || !type || !category || !deadline) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Title, description, type, category, and deadline are required.',
      });
      return;
    }

    if (['external', 'both'].includes(applicationMethod) && !officialUrl) {
      response.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'An official URL is required for external applications.',
      });
      return;
    }

    const employer = await Employer.findOne({
      owner: request.user._id,
      verificationStatus: 'verified',
    });

    if (!employer) {
      response.status(403).json({
        success: false,
        code: 'EMPLOYER_NOT_VERIFIED',
        message: 'A verified employer profile is required to publish an opportunity.',
      });
      return;
    }

    let payment;
    if (request.user.role === 'employer') {
      payment = await Payment.findOne({ _id: paymentId, employer: request.user._id, amount: 500, currency: 'ETB', status: 'approved', usedAt: { $exists: false } });
      if (!payment) {
        response.status(402).json({ success: false, code: 'PAYMENT_REQUIRED', message: 'An approved 500 ETB posting payment is required before submitting an opportunity.' });
        return;
      }
    }

    const opportunity = await Opportunity.create({
      ...request.body,
      owner: request.user._id,
      employer: employer._id,
      status: 'pending_approval',
    });

    if (payment) {
      payment.usedAt = new Date();
      await payment.save();
    }

    response.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOpportunity, getOpportunity, listOpportunities };
