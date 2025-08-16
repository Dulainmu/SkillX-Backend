const AssessmentProgress = require('../models/AssessmentProgress');

// Get current user's assessment progress
exports.getMyProgress = async (req, res) => {
  try {
    const doc = await AssessmentProgress.findOne({ user: req.user.id });
    if (!doc) {
      return res.status(200).json({ 
        currentStep: 1, 
        data: {}, 
        answers: {} 
      });
    }
    
    res.status(200).json({ 
      currentStep: doc.currentStep, 
      data: doc.data || {}, 
      answers: doc.answers || {} 
    });
  } catch (err) {
    console.error('Error in getMyProgress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upsert current user's assessment progress
exports.saveMyProgress = async (req, res) => {
  try {
    const { currentStep, data, answers } = req.body || {};
    
    // Validate currentStep
    if (!currentStep || typeof currentStep !== 'number' || currentStep < 1) {
      return res.status(400).json({ 
        message: 'currentStep must be a valid number greater than 0' 
      });
    }

    // Validate and sanitize data
    const sanitizedData = data && typeof data === 'object' ? data : {};
    const sanitizedAnswers = answers && typeof answers === 'object' ? answers : {};

    const update = {
      currentStep,
      data: sanitizedData,
      answers: sanitizedAnswers,
      updatedAt: new Date()
    };

    console.log(`Saving assessment progress for user ${req.user.id}:`, {
      currentStep,
      dataKeys: Object.keys(sanitizedData),
      answerKeys: Object.keys(sanitizedAnswers)
    });

    const doc = await AssessmentProgress.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, ...update },
      { upsert: true, new: true }
    );

    console.log(`Assessment progress saved successfully for user ${req.user.id}, step ${doc.currentStep}`);

    res.status(200).json({ 
      message: 'Progress saved successfully', 
      currentStep: doc.currentStep,
      dataKeys: Object.keys(doc.data || {}),
      answerKeys: Object.keys(doc.answers || {})
    });
  } catch (err) {
    console.error('Error in saveMyProgress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Clear current user's assessment progress
exports.clearMyProgress = async (req, res) => {
  try {
    const result = await AssessmentProgress.deleteOne({ user: req.user.id });
    
    console.log(`Assessment progress cleared for user ${req.user.id}, deleted: ${result.deletedCount}`);
    
    res.status(200).json({ 
      message: 'Progress cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error in clearMyProgress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Test endpoint to verify progress saving (for debugging)
exports.testProgress = async (req, res) => {
  try {
    const testData = {
      currentStep: 2,
      data: {
        goals: 'Software Developer',
        skills: { 'JavaScript': { selected: true, level: 3 } },
        preferences: { learningStyle: ['visual', 'handsOn'] }
      },
      answers: { '1': 4, '2': 3, '3': 5 }
    };

    const update = {
      currentStep: testData.currentStep,
      data: testData.data,
      answers: testData.answers,
      updatedAt: new Date()
    };

    const doc = await AssessmentProgress.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, ...update },
      { upsert: true, new: true }
    );

    res.status(200).json({ 
      message: 'Test progress saved successfully', 
      currentStep: doc.currentStep,
      data: doc.data,
      answers: doc.answers
    });
  } catch (err) {
    console.error('Error in testProgress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


