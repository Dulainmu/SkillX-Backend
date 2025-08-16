const mongoose = require('mongoose');

const userSkillProgressSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  skillName: { type: String, required: true },
  skillSlug: { type: String, required: true },
  
  // Progress tracking
  level: { 
    type: String, 
    enum: ['not-started', 'beginner', 'intermediate', 'advanced', 'expert'], 
    default: 'not-started' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 }, // percentage
  xpEarned: { type: Number, default: 0 },
  
  // Learning activity
  startedAt: { type: Date },
  lastPracticedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // in hours
  resourcesCompleted: [{ type: String }], // array of resource URLs completed
  
  // Assessment and validation
  selfAssessment: { type: Number, min: 1, max: 5 }, // user's self-rating
  mentorAssessment: { type: Number, min: 1, max: 5 }, // mentor's assessment
  quizScores: [{ 
    quizId: String,
    score: Number,
    maxScore: Number,
    completedAt: Date
  }],
  
  // Projects and practical work
  projectsCompleted: [{ 
    projectId: String,
    projectTitle: String,
    score: Number,
    completedAt: Date
  }],
  
  // Certifications and achievements
  certifications: [{ 
    name: String,
    issuer: String,
    issuedAt: Date,
    expiresAt: Date,
    certificateUrl: String
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['learning', 'practicing', 'proficient', 'mastered', 'maintaining'], 
    default: 'learning' 
  },
  isActive: { type: Boolean, default: true },
  
  // Notes and feedback
  notes: { type: String },
  mentorFeedback: { type: String },
  
  // Goals and planning
  targetLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'] 
  },
  targetDate: { type: Date },
  learningGoals: [String],
  
  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSkillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [userSkillProgressSchema],
  
  // Overall skill statistics
  totalSkills: { type: Number, default: 0 },
  skillsInProgress: { type: Number, default: 0 },
  skillsCompleted: { type: Number, default: 0 },
  totalXpEarned: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // in hours
  
  // Skill categories summary
  categoryProgress: [{
    category: String,
    skillsCount: Number,
    completedCount: Number,
    averageProgress: Number
  }],
  
  // Learning streak and activity
  currentStreak: { type: Number, default: 0 }, // consecutive days
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date },
  
  // Goals and achievements
  learningGoals: [{
    skillId: String,
    skillName: String,
    targetLevel: String,
    targetDate: Date,
    isCompleted: { type: Boolean, default: false }
  }],
  
  // Preferences
  preferredLearningStyle: { 
    type: String, 
    enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed'], 
    default: 'mixed' 
  },
  preferredDifficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'intermediate' 
  },
  
  // Settings
  notifications: {
    skillReminders: { type: Boolean, default: true },
    goalDeadlines: { type: Boolean, default: true },
    achievementAlerts: { type: Boolean, default: true },
    mentorFeedback: { type: Boolean, default: true }
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
userSkillSchema.index({ user: 1 });
userSkillSchema.index({ 'skills.skill': 1 });
userSkillSchema.index({ 'skills.status': 1 });
userSkillSchema.index({ lastActivityDate: -1 });
userSkillSchema.index({ totalXpEarned: -1 });

// Pre-save middleware to update statistics
userSkillSchema.pre('save', function(next) {
  if (this.skills) {
    this.totalSkills = this.skills.length;
    this.skillsInProgress = this.skills.filter(s => s.status === 'learning' || s.status === 'practicing').length;
    this.skillsCompleted = this.skills.filter(s => s.status === 'proficient' || s.status === 'mastered').length;
    this.totalXpEarned = this.skills.reduce((sum, skill) => sum + skill.xpEarned, 0);
    this.totalTimeSpent = this.skills.reduce((sum, skill) => sum + skill.timeSpent, 0);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserSkill', userSkillSchema);
