const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'article', 'course', 'documentation', 'other'], default: 'article' },
  url: { type: String, required: true },
  description: { type: String }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  estimatedTime: { type: String },
  skills: { type: [String], default: [] },
  xpReward: { type: Number, default: 0 },
  resources: { type: [resourceSchema], default: [] }
}, { _id: false });

const requiredSkillSchema = new mongoose.Schema({
  skillId: { type: String, required: true },
  skillName: { type: String, required: true },
  requiredLevel: { type: Number, min: 1, max: 5, required: true },
  importance: { 
    type: String, 
    enum: ['essential', 'important', 'nice-to-have'], 
    default: 'important' 
  }
}, { _id: false });

const roadmapStepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  skills: { type: [String], default: [] },
  estimatedTime: { type: String },
  xpReward: { type: Number, default: 0 },
  projects: { type: [projectSchema], default: [] },
  resources: { type: [resourceSchema], default: [] }
}, { _id: false });

const careerRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  vector: { type: [Number], required: true, validate: v => v.length === 12 },
  description: { type: String, required: true },
  skills: { type: [String], default: [] }, // Legacy field for backward compatibility
  requiredSkills: { type: [requiredSkillSchema], default: [] }, // New field with skill levels
  roadmap: { type: [String], default: [] },
  detailedRoadmap: { type: [roadmapStepSchema], default: [] },
  averageSalary: { type: String },
  jobGrowth: { type: String },
  
  // New personality data fields for unified matching
  desiredRIASEC: {
    R: { type: Number, min: 0, max: 1, default: 0.5 }, // Realistic
    I: { type: Number, min: 0, max: 1, default: 0.5 }, // Investigative
    A: { type: Number, min: 0, max: 1, default: 0.5 }, // Artistic
    S: { type: Number, min: 0, max: 1, default: 0.5 }, // Social
    E: { type: Number, min: 0, max: 1, default: 0.5 }, // Enterprising
    C: { type: Number, min: 0, max: 1, default: 0.5 }  // Conventional
  },
  desiredBigFive: {
    Openness: { type: Number, min: 0, max: 1, default: 0.5 },
    Conscientiousness: { type: Number, min: 0, max: 1, default: 0.5 },
    Extraversion: { type: Number, min: 0, max: 1, default: 0.5 },
    Agreeableness: { type: Number, min: 0, max: 1, default: 0.5 },
    Neuroticism: { type: Number, min: 0, max: 1, default: 0.5 }
  },
  workValues: { type: [String], default: [] },
  
  // Admin fields
  isActive: { type: Boolean, default: true },
  adminNotes: { type: String },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('CareerRole', careerRoleSchema); 