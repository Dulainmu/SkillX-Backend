const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true } // e.g., 'Trophy', 'Star', etc.
});

module.exports = mongoose.model('Achievement', achievementSchema); 