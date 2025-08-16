const mongoose = require('mongoose');

const assessmentProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  currentStep: { type: Number, default: 1 },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AssessmentProgress', assessmentProgressSchema);


