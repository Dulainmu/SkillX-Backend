const mongoose = require('mongoose');

const TopMatchSchema = new mongoose.Schema(
    {
      pathId: String,
      name: String,
      description: String,
      industry: String,
      averageSalary: String,
      jobGrowth: String,
      currentRole: {
        title: String,
        level: String,
        score: Number
      },
      nextRole: {
        title: String,
        level: String,
        missingSkills: [
          {
            skill: String,
            have: Number,
            need: Number
          }
        ]
      }
    },
    { _id: false }
);

const AnswerSchema = new mongoose.Schema(
  {
    questionId: String,
    score: Number
  },
  { _id: false }
);

const QuizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  // Latest top matches from assessment-based matching
  topMatches: [TopMatchSchema],
  // Raw answers array to support cosine-based recommendations API
  answers: [AnswerSchema],
  // Timestamp of the latest submission for sort operations
  timestamp: { type: Date },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
