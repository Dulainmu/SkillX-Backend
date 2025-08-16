const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  }
}, { timestamps: true });

module.exports = mongoose.model('PasswordReset', passwordResetSchema); 