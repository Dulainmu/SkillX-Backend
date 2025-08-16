const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function createMentor() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'mentor1@example.com';
  const password = 'mentor1password';
  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Mentor user already exists:', email);
    await mongoose.disconnect();
    return;
  }
  const user = new User({
    name: 'Mentor One',
    email,
    password: hashedPassword,
    role: 'mentor',
    bio: 'Mentor for SkillX',
    joinDate: new Date().toLocaleString()
  });
  await user.save();
  console.log('Mentor user created:', email);
  await mongoose.disconnect();
}

createMentor(); 