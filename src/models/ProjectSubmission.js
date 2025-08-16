const mongoose = require('mongoose');

const projectSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerRole: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', required: true },
  step: {
    id: { type: String, required: true },
    title: { type: String, required: true }
  },
  project: {
    id: { type: String, required: true },
    title: { type: String, required: true }
  },
  title: { type: String, required: true },
  description: { type: String },
  submissionUrl: { type: String },
  fileUrl: { type: String },
  attachments: [{ type: String }], // Array of file URLs
  submittedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedback: { type: String },
  score: { type: Number, min: 0, max: 100 },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  timeSpent: { type: Number }, // in hours
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'] 
  }
}, { timestamps: true });

// Indexes for efficient queries
projectSubmissionSchema.index({ user: 1, careerRole: 1 });
projectSubmissionSchema.index({ status: 1, submittedAt: -1 });
projectSubmissionSchema.index({ mentor: 1, status: 1 });
projectSubmissionSchema.index({ 'step.id': 1, 'project.id': 1 });

module.exports = mongoose.model('ProjectSubmission', projectSubmissionSchema); 