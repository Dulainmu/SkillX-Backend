const mongoose = require('mongoose');

const skillPrerequisiteSchema = new mongoose.Schema({
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  skillName: { type: String, required: true },
  level: { type: String, enum: ['basic', 'intermediate', 'advanced'], default: 'basic' }
}, { _id: false });

const skillResourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['video', 'article', 'course', 'documentation', 'project', 'quiz'], required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
  estimatedTime: { type: Number }, // in hours
  isRequired: { type: Boolean, default: false }
}, { _id: false });

const skillProficiencyLevelSchema = new mongoose.Schema({
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  title: { type: String, required: true }, // e.g., "HTML/CSS Fundamentals", "Advanced React Patterns"
  description: { type: String, required: true },
  expectations: [String], // Array of specific expectations for this level
  projects: [String], // Suggested projects to demonstrate this level
  timeToAchieve: { type: Number }, // estimated hours to reach this level
  prerequisites: [String], // skills/concepts needed before this level
  resources: [skillResourceSchema] // specific resources for this level
}, { _id: false });

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'frontend', 'backend', 'fullstack', 'devops', 'data', 'mobile', 
      'cybersecurity', 'networking', 'database', 'qa', 'itsupport', 
      'product', 'design', 'soft-skills', 'other'
    ], 
    required: true 
  },
  subcategory: { type: String },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    required: true 
  },
  estimatedTimeToLearn: { type: Number }, // in hours
  xpReward: { type: Number, default: 100 },
  
  // Prerequisites and dependencies
  prerequisites: [skillPrerequisiteSchema],
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  
  // Learning resources
  resources: [skillResourceSchema],
  
  // Skill-specific proficiency levels
  proficiencyLevels: [skillProficiencyLevelSchema],
  
  // Career paths that use this skill
  careerPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CareerRole' }],
  
  // Market data
  marketDemand: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'very-high'], 
    default: 'medium' 
  },
  averageSalary: { type: Number }, // in USD
  jobGrowth: { type: Number }, // percentage
  
  // Skill metadata
  tags: [String],
  keywords: [String],
  
  // Status and admin
  status: { 
    type: String, 
    enum: ['draft', 'active', 'deprecated', 'archived'], 
    default: 'draft' 
  },
  isPublic: { type: Boolean, default: true },
  adminNotes: { type: String },
  
  // Statistics
  totalUsers: { type: Number, default: 0 },
  averageCompletionTime: { type: Number }, // in hours
  successRate: { type: Number }, // percentage
  rating: { type: Number, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // Audit fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
skillSchema.index({ name: 1 });
skillSchema.index({ slug: 1 });
skillSchema.index({ category: 1, difficulty: 1 });
skillSchema.index({ status: 1, isPublic: 1 });
skillSchema.index({ marketDemand: 1 });
skillSchema.index({ tags: 1 });
skillSchema.index({ 'prerequisites.skillId': 1 });

// Virtual for full category path
skillSchema.virtual('fullCategory').get(function() {
  return this.subcategory ? `${this.category}/${this.subcategory}` : this.category;
});

// Pre-save middleware to generate slug if not provided
skillSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Skill', skillSchema);
