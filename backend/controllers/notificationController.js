const mongoose = require('mongoose');
const Notification = require('../models/Notification');

function databaseReady(response) {
  if (mongoose.connection.readyState === 1) return true;
  response.status(503).json({
    success: false,
    code: 'DATABASE_UNAVAILABLE',
    message: 'The database is not connected. Please try again later.',
  });
  return false;
}

async function listNotifications(request, response, next) {
  if (!databaseReady(response)) return;

  try {
    const notifications = await Notification.find({ recipient: request.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    response.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

async function markNotificationRead(request, response, next) {
  if (!databaseReady(response)) return;
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(400).json({ success: false, code: 'INVALID_ID', message: 'The notification ID is invalid.' });
    return;
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: request.params.id, recipient: request.user._id },
      { readAt: new Date() },
      { new: true },
    );
    if (!notification) {
      response.status(404).json({ success: false, code: 'NOTIFICATION_NOT_FOUND', message: 'Notification was not found.' });
      return;
    }
    response.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
}

module.exports = { listNotifications, markNotificationRead };
