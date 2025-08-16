// scripts/runMigration.js
// Script to run the career data migration

require('dotenv').config();
const mongoose = require('mongoose');
const { migrateCareerRoles, validateMigration, seedCareerRolesIfNeeded } = require('../src/utils/migrateCareerData');

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('\n=== Starting Career Data Migration ===\n');
    
    // Step 1: Seed career roles if they don't exist
    console.log('Step 1: Checking for existing career roles...');
    await seedCareerRolesIfNeeded();
    console.log('✅ Career roles check completed\n');
    
    // Step 2: Run the migration
    console.log('Step 2: Migrating career roles with personality data...');
    const migrationResult = await migrateCareerRoles();
    console.log('\nMigration Result:', migrationResult);
    
    // Step 3: Validate the migration
    console.log('\nStep 3: Validating migration...');
    const validationResult = await validateMigration();
    console.log('\nValidation Result:', validationResult);
    
    if (validationResult.invalidCount === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some issues. Check the logs above.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Function to just seed career roles without migration
async function seedOnly() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('\n=== Seeding Career Roles Only ===\n');
    
    await seedCareerRolesIfNeeded();
    console.log('\n✅ Career roles seeding completed!');
    
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Function to just migrate existing career roles
async function migrateOnly() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('\n=== Migrating Existing Career Roles ===\n');
    
    const migrationResult = await migrateCareerRoles();
    console.log('\nMigration Result:', migrationResult);
    
    const validationResult = await validateMigration();
    console.log('\nValidation Result:', validationResult);
    
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'seed') {
    seedOnly()
      .then(() => {
        console.log('🎉 Seeding completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
      });
  } else if (command === 'migrate') {
    migrateOnly()
      .then(() => {
        console.log('🎉 Migration completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
      });
  } else {
    runMigration()
      .then(() => {
        console.log('🎉 Full migration completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { 
  runMigration, 
  seedOnly, 
  migrateOnly 
};
