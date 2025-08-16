const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Use bcrypt, not bcryptjs
const User = require('../models/User');
require('dotenv').config({ path: '../../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);
  const email = 'admin@skillx.com';
  const password = 'SkillXAdmin!2024';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);
  await User.create({
    name: 'SkillX Admin',
    email,
    password: hash,
    role: 'admin',
    totalXp: 0,
    level: 1,
  });
  console.log('Admin user created:', email);
  process.exit(0);
}

createAdmin();
