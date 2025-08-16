const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  joinDate: {
    type: String
  },
  bio: {
    type: String
  },
  avatar: {
    type: String // URL or file path to the user's avatar image
  },
  role: {
    type: String,
    enum: ['user', 'mentor', 'admin', 'student'],
    default: 'user'
  },
  totalXp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  achievements: [{ type: String }], // Array of achievement keys
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    achievement: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 