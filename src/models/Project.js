const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skills: { type: String, required: true },
  difficulty: { type: String },
  status: { type: String, enum: ['draft', 'needs review', 'published'], default: 'draft' },
  requirements: [String],
  starterCode: { type: String },
  solution: { type: String },
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningMaterial' }],
  autoGrading: { type: mongoose.Schema.Types.Mixed },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComment: { type: String },
  feedback: [FeedbackSchema],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
