const mongoose = require('mongoose');
const Payment = require('../models/Payment');

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true;
  response.status(503).json({ success: false, code: 'DATABASE_UNAVAILABLE', message: 'The database is not connected. Please try again later.' });
  return false;
}

function validReceipt(receiptData, receiptName, receiptMimeType) {
  return typeof receiptData === 'string'
    && receiptData.startsWith(`data:${receiptMimeType};base64,`)
    && receiptData.length <= 1_000_000
    && typeof receiptName === 'string'
    && receiptName.length <= 180
    && ['image/jpeg', 'image/png', 'application/pdf'].includes(receiptMimeType);
}

async function submitOpportunityPayment(request, response, next) {
  if (!databaseReady(response)) return;
  try {
    const { method, receiptData, receiptName, receiptMimeType } = request.body;
    if (!['telebirr', 'cbe', 'abyssinia'].includes(method) || !validReceipt(receiptData, receiptName, receiptMimeType)) {
      response.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Select a payment method and upload a JPG, PNG, or PDF receipt smaller than 1 MB.' });
      return;
    }

    const payment = await Payment.create({
      employer: request.user._id,
      amount: 500,
      currency: 'ETB',
      method,
      receiptData,
      receiptName,
      receiptMimeType,
    });
    response.status(201).json({ success: true, data: payment, message: 'Receipt submitted. An admin must approve the payment before you can post an opportunity.' });
  } catch (error) {
    next(error);
  }
}

async function listMyPayments(request, response, next) {
  if (!databaseReady(response)) return;
  try {
    const payments = await Payment.find({ employer: request.user._id }).sort({ createdAt: -1 }).select('-receiptData').lean();
    response.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
}

async function listPendingPayments(request, response, next) {
  if (!databaseReady(response)) return;
  try {
    const payments = await Payment.find({ status: 'pending' }).populate('employer', 'name email').sort({ createdAt: 1 }).select('+receiptData').lean();
    response.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
}

async function reviewPayment(request, response, next) {
  if (!databaseReady(response)) return;
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(400).json({ success: false, code: 'INVALID_ID', message: 'The payment ID is invalid.' });
    return;
  }
  try {
    const { status, reason } = request.body;
    if (!['approved', 'rejected'].includes(status)) {
      response.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Payment status must be approved or rejected.' });
      return;
    }
    const payment = await Payment.findOneAndUpdate(
      { _id: request.params.id, status: 'pending' },
      { status, reviewReason: reason || undefined },
      { new: true, runValidators: true },
    ).select('-receiptData');
    if (!payment) {
      response.status(404).json({ success: false, code: 'PAYMENT_NOT_FOUND', message: 'Pending payment was not found.' });
      return;
    }
    response.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
}

module.exports = { listMyPayments, listPendingPayments, reviewPayment, submitOpportunityPayment };
