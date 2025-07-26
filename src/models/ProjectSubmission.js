const mongoose = require('mongoose');

const projectSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerRole: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', required: true },
  stepIndex: { type: Number, required: true },
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  submissionUrl: { type: String },
  fileUrl: { type: String },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'reviewed', 'approved', 'rejected'], default: 'pending' },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedback: { type: String },
  score: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('ProjectSubmission', projectSubmissionSchema); 