const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, enum: [500] },
    currency: { type: String, required: true, enum: ['ETB'], default: 'ETB' },
    method: { type: String, required: true, enum: ['telebirr', 'cbe', 'abyssinia'] },
    receiptData: { type: String, required: true, select: false },
    receiptName: { type: String, required: true, maxlength: 180 },
    receiptMimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'application/pdf'] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewReason: { type: String, trim: true, maxlength: 1000 },
    usedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Payment', paymentSchema);
