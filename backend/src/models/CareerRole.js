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
  vector: { type: [Number], required: true, validate: v => v.length === 12 },
  description: { type: String, required: true },
  skills: { type: [String], default: [] },
  roadmap: { type: [String], default: [] },
  detailedRoadmap: { type: [roadmapStepSchema], default: [] },
  averageSalary: { type: String },
  jobGrowth: { type: String }
});

module.exports = mongoose.model('CareerRole', careerRoleSchema); 