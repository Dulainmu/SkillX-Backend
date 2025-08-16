const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'Award' },
  category: { 
    type: String, 
    enum: ['skill', 'progress', 'social', 'special'], 
    default: 'progress' 
  },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'], 
    default: 'common' 
  },
  criteria: {
    type: { 
      type: String, 
      enum: ['steps_completed', 'projects_completed', 'score_threshold', 'time_spent', 'submissions_approved'],
      required: true 
    },
    value: { type: Number, required: true },
    career: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole' }
  },
  xpReward: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  unlockRate: { type: Number, default: 0 }, // percentage of users who have this achievement
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Index for efficient queries
AchievementSchema.index({ category: 1, rarity: 1, isActive: 1 });
AchievementSchema.index({ 'criteria.type': 1, 'criteria.career': 1 });

module.exports = mongoose.model('Achievement', AchievementSchema); 