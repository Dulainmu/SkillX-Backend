const mongoose = require('mongoose');
const CareerRole = require('../src/models/CareerRole');
require('dotenv').config();

// Try multiple MongoDB connection options
const MONGO_OPTIONS = [
  process.env.MONGO_URI,
  'mongodb://localhost:27017/skillx',
  'mongodb://127.0.0.1:27017/skillx',
  'mongodb+srv://dulainmu:abcd@database.n1bm2tm.mongodb.net/skillx'
];

async function validateCareerRoles() {
  let connected = false;
  
  for (const mongoUri of MONGO_OPTIONS) {
    if (!mongoUri) continue;
    
    try {
      console.log(`Trying to connect to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      console.log('✅ Connected to MongoDB successfully!');
      connected = true;
      break;
    } catch (error) {
      console.log(`❌ Failed to connect to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  if (!connected) {
    console.log('\n❌ Could not connect to any MongoDB instance');
    console.log('\n🔧 To fix this:');
    console.log('1. Start your local MongoDB server:');
    console.log('   brew services start mongodb-community  # macOS');
    console.log('   sudo systemctl start mongod            # Linux');
    console.log('   net start MongoDB                      # Windows');
    console.log('\n2. Or create a .env file with your MongoDB URI:');
    console.log('   MONGO_URI=mongodb://localhost:27017/skillx');
    console.log('\n3. Or use the online MongoDB Atlas connection');
    process.exit(1);
  }
  
  try {
    // Get all career roles
    const allCareerRoles = await CareerRole.find({});
    console.log(`\n📊 Total career roles in database: ${allCareerRoles.length}`);
    
    if (allCareerRoles.length === 0) {
      console.log('\n❌ No career roles found in database!');
      console.log('\n🔧 To fix this:');
      console.log('1. Run the seed script:');
      console.log('   npm run migrate:seed');
      console.log('\n2. Or create career roles in the admin panel:');
      console.log('   http://localhost:5173/admin/career-paths');
      await mongoose.disconnect();
      return;
    }
    
    // Categorize career roles
    const categories = {
      valid: [],
      inactive: [],
      noRoadmap: [],
      noSkills: [],
      noName: [],
      noDescription: [],
      incomplete: []
    };
    
    allCareerRoles.forEach(role => {
      const issues = [];
      
      // Check if active
      if (!role.isActive) {
        issues.push('inactive');
        categories.inactive.push(role);
      }
      
      // Check if has roadmap
      if (!role.detailedRoadmap || !Array.isArray(role.detailedRoadmap) || role.detailedRoadmap.length === 0) {
        issues.push('no roadmap');
        categories.noRoadmap.push(role);
      }
      
      // Check if has required skills
      if (!role.requiredSkills || !Array.isArray(role.requiredSkills) || role.requiredSkills.length === 0) {
        issues.push('no skills');
        categories.noSkills.push(role);
      }
      
      // Check if has name
      if (!role.name || role.name.trim().length === 0) {
        issues.push('no name');
        categories.noName.push(role);
      }
      
      // Check if has description
      if (!role.description || role.description.trim().length === 0) {
        issues.push('no description');
        categories.noDescription.push(role);
      }
      
      // If no issues, it's valid
      if (issues.length === 0) {
        categories.valid.push(role);
      } else {
        categories.incomplete.push(role);
      }
    });
    
    // Print summary
    console.log('\n🔍 Career Role Validation Results:');
    console.log('=====================================');
    console.log(`✅ Valid career roles: ${categories.valid.length}`);
    console.log(`❌ Inactive career roles: ${categories.inactive.length}`);
    console.log(`🚫 No roadmap: ${categories.noRoadmap.length}`);
    console.log(`🚫 No required skills: ${categories.noSkills.length}`);
    console.log(`🚫 No name: ${categories.noName.length}`);
    console.log(`🚫 No description: ${categories.noDescription.length}`);
    console.log(`⚠️  Incomplete career roles: ${categories.incomplete.length}`);
    
    // Show valid career roles
    if (categories.valid.length > 0) {
      console.log('\n✅ Valid Career Roles (will be recommended):');
      console.log('=============================================');
      categories.valid.forEach(role => {
        console.log(`• ${role.name} (${role.detailedRoadmap.length} roadmap steps, ${role.requiredSkills.length} skills)`);
      });
    }
    
    // Show inactive career roles
    if (categories.inactive.length > 0) {
      console.log('\n❌ Inactive Career Roles (need to be activated in admin):');
      console.log('=========================================================');
      categories.inactive.forEach(role => {
        console.log(`• ${role.name || 'Unnamed'} (ID: ${role._id})`);
      });
    }
    
    // Show career roles without roadmaps
    if (categories.noRoadmap.length > 0) {
      console.log('\n🚫 Career Roles Without Roadmaps (need roadmap in admin):');
      console.log('==========================================================');
      categories.noRoadmap.forEach(role => {
        console.log(`• ${role.name || 'Unnamed'} (ID: ${role._id})`);
      });
    }
    
    // Show career roles without skills
    if (categories.noSkills.length > 0) {
      console.log('\n🚫 Career Roles Without Required Skills (need skills in admin):');
      console.log('=================================================================');
      categories.noSkills.forEach(role => {
        console.log(`• ${role.name || 'Unnamed'} (ID: ${role._id})`);
      });
    }
    
    // Show incomplete career roles
    if (categories.incomplete.length > 0) {
      console.log('\n⚠️  Incomplete Career Roles (need fixes in admin):');
      console.log('==================================================');
      categories.incomplete.forEach(role => {
        const issues = [];
        if (!role.isActive) issues.push('inactive');
        if (!role.detailedRoadmap || role.detailedRoadmap.length === 0) issues.push('no roadmap');
        if (!role.requiredSkills || role.requiredSkills.length === 0) issues.push('no skills');
        if (!role.name || role.name.trim().length === 0) issues.push('no name');
        if (!role.description || role.description.trim().length === 0) issues.push('no description');
        
        console.log(`• ${role.name || 'Unnamed'} (ID: ${role._id}) - Issues: ${issues.join(', ')}`);
      });
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('===================');
    
    if (categories.valid.length === 0) {
      console.log('❌ No valid career roles found! You need to:');
      console.log('   1. Create career roles in the admin panel');
      console.log('   2. Add detailed roadmaps with steps');
      console.log('   3. Add required skills with levels');
      console.log('   4. Set isActive to true');
    } else {
      console.log(`✅ You have ${categories.valid.length} valid career roles that will be recommended`);
    }
    
    if (categories.inactive.length > 0) {
      console.log(`🔧 Activate ${categories.inactive.length} inactive career roles in the admin panel`);
    }
    
    if (categories.noRoadmap.length > 0) {
      console.log(`🔧 Add roadmaps to ${categories.noRoadmap.length} career roles in the admin panel`);
    }
    
    if (categories.noSkills.length > 0) {
      console.log(`🔧 Add required skills to ${categories.noSkills.length} career roles in the admin panel`);
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('==============');
    console.log('1. Go to http://localhost:5173/admin/career-paths');
    console.log('2. Fix the incomplete career roles listed above');
    console.log('3. Ensure each career role has:');
    console.log('   - isActive: true');
    console.log('   - detailedRoadmap with at least one step');
    console.log('   - requiredSkills with at least one skill');
    console.log('   - name and description');
    console.log('4. Test the career assessment again');
    
    await mongoose.disconnect();
    console.log('\n✅ Validation complete!');
    
  } catch (error) {
    console.error('Error validating career roles:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run validation
validateCareerRoles();
