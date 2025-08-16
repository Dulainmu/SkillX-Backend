const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { _id: false });

const LearningMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'article', 'code', 'other'], required: true },
  skill: { type: String, required: true },
  level: { type: String },
  order: { type: Number },
  provider: { type: String },
  content: { type: String },
  url: { type: String },
  language: { type: String },
  status: { type: String, enum: ['draft', 'needs review', 'published'], default: 'draft' },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComment: { type: String },
  feedback: [FeedbackSchema],
}, { timestamps: true });

module.exports = mongoose.model('LearningMaterial', LearningMaterialSchema);
