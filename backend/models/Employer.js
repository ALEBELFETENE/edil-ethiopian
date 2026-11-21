const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: [true, 'Employer name is required.'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    verificationReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Employer', employerSchema);
