const mongoose = require('mongoose');

const stepProgressSchema = new mongoose.Schema({
  stepIndex: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { _id: false });

const userCareerProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerRole: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', required: true },
  steps: [stepProgressSchema],
  completedResources: [{ stepIndex: Number, resourceUrl: String }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('UserCareerProgress', userCareerProgressSchema); 