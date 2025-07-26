const QuizResult = require('../models/QuizResult');

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers are required.' });
    }
    const quizResult = new QuizResult({
      user: req.user.id,
      answers,
      timestamp: new Date()
    });
    await quizResult.save();
    res.status(201).json({ message: 'Quiz submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get latest quiz result for user
exports.getQuizResult = async (req, res) => {
  try {
    const result = await QuizResult.findOne({ user: req.user.id }).sort({ timestamp: -1 });
    if (!result) {
      return res.status(404).json({ message: 'No quiz result found.' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 