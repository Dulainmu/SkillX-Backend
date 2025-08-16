// src/utils/migrateCareerData.js
// Migration script to update existing CareerRole documents with personality data

const CareerRole = require('../models/CareerRole');

// Personality data mapping for existing career roles based on their vectors and descriptions
const careerPersonalityData = {
  'frontend-developer': {
    desiredRIASEC: { R: 0.30, I: 0.60, A: 0.70, S: 0.40, E: 0.35, C: 0.40 },
    desiredBigFive: { Openness: 0.70, Conscientiousness: 0.70, Extraversion: 0.50, Agreeableness: 0.60, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Working Conditions', 'Relationships']
  },
  'backend-developer': {
    desiredRIASEC: { R: 0.40, I: 0.70, A: 0.20, S: 0.30, E: 0.30, C: 0.60 },
    desiredBigFive: { Openness: 0.50, Conscientiousness: 0.80, Extraversion: 0.40, Agreeableness: 0.50, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Working Conditions', 'Support']
  },
  'fullstack-developer': {
    desiredRIASEC: { R: 0.45, I: 0.65, A: 0.55, S: 0.40, E: 0.35, C: 0.50 },
    desiredBigFive: { Openness: 0.60, Conscientiousness: 0.75, Extraversion: 0.50, Agreeableness: 0.50, Neuroticism: 0.35 },
    workValues: ['Achievement', 'Independence', 'Working Conditions', 'Recognition']
  },
  'devops-engineer': {
    desiredRIASEC: { R: 0.50, I: 0.60, A: 0.30, S: 0.25, E: 0.40, C: 0.70 },
    desiredBigFive: { Openness: 0.55, Conscientiousness: 0.75, Extraversion: 0.45, Agreeableness: 0.45, Neuroticism: 0.35 },
    workValues: ['Achievement', 'Independence', 'Working Conditions', 'Support']
  },
  'data-scientist': {
    desiredRIASEC: { R: 0.35, I: 0.80, A: 0.40, S: 0.30, E: 0.25, C: 0.65 },
    desiredBigFive: { Openness: 0.75, Conscientiousness: 0.70, Extraversion: 0.40, Agreeableness: 0.50, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Working Conditions']
  },
  'ui-ux-designer': {
    desiredRIASEC: { R: 0.25, I: 0.45, A: 0.80, S: 0.50, E: 0.40, C: 0.35 },
    desiredBigFive: { Openness: 0.75, Conscientiousness: 0.60, Extraversion: 0.50, Agreeableness: 0.65, Neuroticism: 0.35 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Relationships']
  },
  'product-manager': {
    desiredRIASEC: { R: 0.30, I: 0.50, A: 0.45, S: 0.60, E: 0.70, C: 0.55 },
    desiredBigFive: { Openness: 0.65, Conscientiousness: 0.70, Extraversion: 0.65, Agreeableness: 0.60, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Relationships', 'Leadership']
  },
  'software-architect': {
    desiredRIASEC: { R: 0.40, I: 0.75, A: 0.35, S: 0.30, E: 0.45, C: 0.65 },
    desiredBigFive: { Openness: 0.70, Conscientiousness: 0.80, Extraversion: 0.45, Agreeableness: 0.50, Neuroticism: 0.25 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Working Conditions']
  },
  'qa-engineer': {
    desiredRIASEC: { R: 0.45, I: 0.55, A: 0.30, S: 0.35, E: 0.30, C: 0.75 },
    desiredBigFive: { Openness: 0.50, Conscientiousness: 0.80, Extraversion: 0.40, Agreeableness: 0.55, Neuroticism: 0.35 },
    workValues: ['Achievement', 'Independence', 'Working Conditions', 'Support']
  },
  'mobile-developer': {
    desiredRIASEC: { R: 0.35, I: 0.60, A: 0.50, S: 0.35, E: 0.35, C: 0.55 },
    desiredBigFive: { Openness: 0.65, Conscientiousness: 0.70, Extraversion: 0.45, Agreeableness: 0.50, Neuroticism: 0.30 },
    workValues: ['Achievement', 'Independence', 'Recognition', 'Working Conditions']
  }
};

// Function to derive personality data from vector and description
function derivePersonalityFromVector(vector, description, name) {
    if (!vector || vector.length !== 12) {
        return createDefaultPersonalityData(name);
    }
    
    // Extract personality traits from vector
    // Vector structure: [BigFive(5), RIASEC(6), WorkValues(1)]
    const bigFive = {
        Openness: vector[0] / 5,        // Normalize from 1-5 to 0-1
        Conscientiousness: vector[1] / 5,
        Extraversion: vector[2] / 5,
        Agreeableness: vector[3] / 5,
        Neuroticism: vector[4] / 5
    };
    
    const riasec = {
        R: vector[5] / 5,  // Realistic
        I: vector[6] / 5,  // Investigative
        A: vector[7] / 5,  // Artistic
        S: vector[8] / 5,  // Social
        E: vector[9] / 5,  // Enterprising
        C: vector[10] / 5  // Conventional
    };
    
    // Determine work values based on description and vector
    const workValues = [];
    const avgWorkValue = vector[11] / 5;
    
    if (avgWorkValue > 0.6) workValues.push('Achievement');
    if (avgWorkValue > 0.5) workValues.push('Independence');
    if (avgWorkValue > 0.4) workValues.push('Recognition');
    if (avgWorkValue > 0.3) workValues.push('Working Conditions');
    if (avgWorkValue > 0.2) workValues.push('Relationships');
    
    // Add specific work values based on description keywords
    const desc = description.toLowerCase();
    if (desc.includes('creative') || desc.includes('design')) workValues.push('Recognition');
    if (desc.includes('team') || desc.includes('collaboration')) workValues.push('Relationships');
    if (desc.includes('lead') || desc.includes('manage')) workValues.push('Leadership');
    if (desc.includes('support') || desc.includes('help')) workValues.push('Support');
    
    return {
        desiredRIASEC: riasec,
        desiredBigFive: bigFive,
        workValues: [...new Set(workValues)] // Remove duplicates
    };
}

async function migrateCareerRoles() {
  try {
    console.log('Starting career role migration...');
    
    const careerRoles = await CareerRole.find({});
    console.log(`Found ${careerRoles.length} career roles to migrate`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const role of careerRoles) {
      const slug = role.slug;
      let personalityData = careerPersonalityData[slug];
      
      if (!personalityData) {
        // Derive personality data from vector and description
        personalityData = derivePersonalityFromVector(role.vector, role.description, role.name);
        console.log(`Derived personality data for ${role.name} from vector`);
      }
      
      // Update the career role with personality data
      await CareerRole.findByIdAndUpdate(role._id, {
        $set: {
          desiredRIASEC: personalityData.desiredRIASEC,
          desiredBigFive: personalityData.desiredBigFive,
          workValues: personalityData.workValues,
          version: (role.version || 1) + 1
        }
      });
      
      console.log(`Updated ${role.name} with personality data`);
      updatedCount++;
    }
    
    console.log(`Migration completed: ${updatedCount} updated, ${skippedCount} skipped`);
    return { updatedCount, skippedCount };
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function validateMigration() {
  try {
    console.log('Validating migration...');
    
    const careerRoles = await CareerRole.find({});
    let validCount = 0;
    let invalidCount = 0;
    
    for (const role of careerRoles) {
      const hasPersonalityData = role.desiredRIASEC && role.desiredBigFive && role.workValues;
      
      if (hasPersonalityData) {
        validCount++;
      } else {
        console.log(`Missing personality data: ${role.name}`);
        invalidCount++;
      }
    }
    
    console.log(`Validation complete: ${validCount} valid, ${invalidCount} invalid`);
    return { validCount, invalidCount };
    
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}

// Function to create default personality data for unknown careers
function createDefaultPersonalityData(careerName) {
  // Default personality profile for unknown careers
  return {
    desiredRIASEC: { R: 0.40, I: 0.60, A: 0.50, S: 0.40, E: 0.40, C: 0.50 },
    desiredBigFive: { Openness: 0.60, Conscientiousness: 0.70, Extraversion: 0.50, Agreeableness: 0.55, Neuroticism: 0.35 },
    workValues: ['Achievement', 'Independence', 'Working Conditions']
  };
}

// Function to seed career roles if they don't exist
async function seedCareerRolesIfNeeded() {
  try {
    const existingRoles = await CareerRole.find({});
    
    if (existingRoles.length === 0) {
      console.log('No career roles found, running seed...');
      
      // Import and run the seed file
      const { exec } = require('child_process');
      const path = require('path');
      
      return new Promise((resolve, reject) => {
        exec('node src/seed/careerRolesSeed.js', { cwd: process.cwd() }, (error, stdout, stderr) => {
          if (error) {
            console.error('Seed execution failed:', error);
            reject(error);
            return;
          }
          console.log('Seed output:', stdout);
          if (stderr) console.error('Seed errors:', stderr);
          resolve();
        });
      });
    } else {
      console.log(`Found ${existingRoles.length} existing career roles`);
    }
  } catch (error) {
    console.error('Error checking/seeding career roles:', error);
    throw error;
  }
}

module.exports = {
  migrateCareerRoles,
  validateMigration,
  createDefaultPersonalityData,
  careerPersonalityData,
  seedCareerRolesIfNeeded,
  derivePersonalityFromVector
};
