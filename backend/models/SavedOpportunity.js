const mongoose = require('mongoose');

const savedOpportunitySchema = new mongoose.Schema(
  {
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
  },
  { timestamps: true },
);

savedOpportunitySchema.index({ seeker: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('SavedOpportunity', savedOpportunitySchema);
