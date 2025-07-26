const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  score: { type: Number, required: true }
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [quizAnswerSchema],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema); 