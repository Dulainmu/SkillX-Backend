const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['multiple-choice', 'true-false', 'code', 'short-answer'], required: true },
  question: { type: String, required: true },
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: String,
  tags: [String],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
}, { _id: false });

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skill: { type: String, required: true },
  questions: [QuestionSchema],
  passingScore: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'needs review', 'published'], default: 'draft' },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComment: { type: String },
  feedback: [FeedbackSchema],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
