const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/';

async function deleteAdmin() {
  await mongoose.connect(MONGO_URI);
  const email = 'admin@skillx.com';
  const result = await User.deleteOne({ email });
  if (result.deletedCount > 0) {
    console.log('Admin user deleted.');
  } else {
    console.log('No admin user found to delete.');
  }
  process.exit(0);
}

deleteAdmin();
