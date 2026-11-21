const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Opportunity title is required.'],
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: [true, 'Opportunity description is required.'],
      trim: true,
      maxlength: 10000,
    },
    type: {
      type: String,
      enum: ['job', 'internship', 'freelance', 'scholarship'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    remote: {
      type: Boolean,
      default: false,
      index: true,
    },
    requirements: [{ type: String, trim: true, maxlength: 300 }],
    skills: [{ type: String, trim: true, maxlength: 80 }],
    compensation: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    applicationMethod: {
      type: String,
      enum: ['platform', 'external', 'both'],
      required: true,
      default: 'platform',
    },
    officialUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    deadline: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'expired', 'archived'],
      default: 'draft',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredUntil: {
      type: Date,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
  },
  { timestamps: true },
);

opportunitySchema.index({ status: 1, deadline: 1, publishedAt: -1 });
opportunitySchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
