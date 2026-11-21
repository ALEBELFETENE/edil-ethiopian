const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    resumeUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
      default: 'submitted',
      index: true,
    },
    employerNote: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ seeker: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
