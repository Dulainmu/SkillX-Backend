const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function checkAdminUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx');
    console.log('✅ Connected to MongoDB');
    
    // Check all users
    const allUsers = await User.find({});
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Check admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`👑 Admin users: ${adminUsers.length}`);
    
    adminUsers.forEach(user => {
      console.log(`• ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check regular users
    const regularUsers = await User.find({ role: 'user' });
    console.log(`👤 Regular users: ${regularUsers.length}`);
    
    // Check other roles
    const otherUsers = await User.find({ role: { $nin: ['admin', 'user'] } });
    console.log(`🔍 Other roles: ${otherUsers.length}`);
    
    otherUsers.forEach(user => {
      console.log(`• ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Show sample users
    console.log('\n📋 Sample users:');
    allUsers.slice(0, 5).forEach(user => {
      console.log(`• ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('Error checking admin users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkAdminUsers();
