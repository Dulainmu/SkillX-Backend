const mongoose = require('mongoose');

const stepProgressSchema = new mongoose.Schema({
  stepIndex: { type: Number, required: true },
  stepId: { type: String, required: true },
  stepTitle: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // in hours
  score: { type: Number, min: 0, max: 100 },
  projectsCompleted: { type: Number, default: 0 },
  totalProjects: { type: Number, default: 0 }
}, { _id: false });

const projectProgressSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  score: { type: Number, min: 0, max: 100 },
  submissionStatus: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'submitted', 'approved', 'rejected'],
    default: 'not-started'
  },
  timeSpent: { type: Number, default: 0 } // in hours
}, { _id: false });

const userCareerProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerRole: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole', required: true },
  steps: [stepProgressSchema],
  projects: [projectProgressSchema],
  completedResources: [{ stepIndex: Number, resourceUrl: String }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  totalXP: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // in hours
  lastActivity: { type: Date, default: Date.now },
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for efficient queries
userCareerProgressSchema.index({ user: 1, careerRole: 1 });
userCareerProgressSchema.index({ 'user': 1, 'isActive': 1 });
userCareerProgressSchema.index({ 'careerRole': 1, 'isActive': 1 });
userCareerProgressSchema.index({ 'lastActivity': -1 });

module.exports = mongoose.model('UserCareerProgress', userCareerProgressSchema); 