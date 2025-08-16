// src/utils/unifiedCareerMatch.js
// Unified Career Matching System - Works with existing CareerRole database structure

const { WEIGHTS, LEVEL_THRESHOLDS, gapDelta } = require('./levelRules');
const { scorePersonality, mapProfileToTraitFlags } = require('./personalityScoring');

const clamp01 = (x) => Math.max(0, Math.min(1, x));

/**
 * Unified Career Matching System
 * 
 * This system works with the existing CareerRole database structure:
 * - Uses CareerRole model with vector field (12-dimensional)
 * - Converts personality profiles to vectors for matching
 * - Provides consistent scoring across all career roles
 * 
 * Weights: 60% Skills, 40% Personality (Learning style removed)
 * 
 * It eliminates the dual-system approach and provides unified matching.
 */

// ===== CORE MATCHING FUNCTIONS =====

function computeSkillFit(requiredSkills = [], userSkills = {}) {
    if (!requiredSkills || requiredSkills.length === 0) return 0.5; // Default if no skills specified
    
    let total = 0;
    let matchedSkills = 0;
    
    for (const requiredSkill of requiredSkills) {
        const userSkill = userSkills[requiredSkill.skillName];
        if (userSkill && userSkill.selected && userSkill.level > 0) {
            // User has this skill, calculate fit based on required level
            const userLevel = userSkill.level;
            const requiredLevel = requiredSkill.requiredLevel;
            
            // Calculate fit: if user level >= required level, perfect fit (1.0)
            // Otherwise, partial fit based on how close they are
            let fit = 0;
            if (userLevel >= requiredLevel) {
                fit = 1.0; // Perfect fit
            } else {
                fit = Math.max(0, userLevel / requiredLevel); // Partial fit
            }
            
            // Apply importance multiplier
            const importanceMultiplier = requiredSkill.importance === 'essential' ? 1.2 : 
                                       requiredSkill.importance === 'important' ? 1.0 : 0.8;
            
            total += fit * importanceMultiplier;
            matchedSkills++;
        }
    }
    
    // Return average fit, or 0.5 if no skills matched
    return matchedSkills > 0 ? total / matchedSkills : 0.5;
}

function bigFiveFit(userBF = {}, desiredBF = {}) {
    const keys = Object.keys(desiredBF);
    if (!keys.length) return 0.5; // Default if no personality data
    
    let sum = 0, n = 0;
    for (const k of keys) {
        const want = desiredBF[k];
        const v = userBF[k] ?? 0.5;

        let f = 0.5;
        if (typeof want === 'number') {
            // numeric closeness (0..1 target)
            f = 1 - Math.abs((want ?? 0.5) - v);
        } else if (typeof want === 'string') {
            if (want === 'high')   f = Math.max(0, Math.min(1, (v - 0.5) / 0.5));
            if (want === 'low')    f = Math.max(0, Math.min(1, (0.5 - v) / 0.5));
            if (want === 'neutral') f = 1;
        }
        sum += Math.max(0, Math.min(1, f));
        n += 1;
    }
    return n ? (sum / n) : 0.5;
}

function riasecFit(userR = {}, desiredR = {}) {
    const ks = Object.keys(desiredR);
    if (!ks.length) return 0.5; // Default if no RIASEC data
    
    let sum = 0, n = 0;
    for (const k of ks) {
        const target = desiredR[k] ?? 0.5; // 0..1
        const v = userR[k] ?? 0.5;
        const f = 1 - Math.abs(target - v);
        sum += Math.max(0, f); 
        n += 1;
    }
    return n ? (sum / n) : 0.5;
}

function workValuesFit(userWV = {}, desiredWV = []) {
    if (!desiredWV || !desiredWV.length) return 0.5; // Default if no work values
    
    let sum = 0, n = 0;
    for (const w of desiredWV) {
        const v = userWV[w] ?? 0.5;
        sum += v; 
        n += 1;
    }
    return n ? (sum / n) : 0.5;
}

function legacyTraitFit(roleTraits = [], userTraits = {}) {
    if (!roleTraits || !roleTraits.length) return 0.5; // Default
    
    const set = new Set(Object.keys(userTraits).filter((k) => userTraits[k]));
    let m = 0;
    for (const t of roleTraits) if (set.has(t)) m += 1;
    return m / roleTraits.length;
}

// ===== VECTOR-BASED MATCHING (Primary Method) =====

function cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
        return 0;
    }
    
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
}

function createUserVectorFromProfile(profile) {
    // Convert personality profile to 12-dimensional vector for CareerRole matching
    const vector = [];
    
    // Big Five (5 dimensions)
    const bigFive = profile.BigFive || {};
    vector.push(bigFive.Openness || 0.5);
    vector.push(bigFive.Conscientiousness || 0.5);
    vector.push(bigFive.Extraversion || 0.5);
    vector.push(bigFive.Agreeableness || 0.5);
    vector.push(bigFive.Neuroticism || 0.5);
    
    // RIASEC (6 dimensions)
    const riasec = profile.RIASEC || {};
    vector.push(riasec.Realistic || 0.5);
    vector.push(riasec.Investigative || 0.5);
    vector.push(riasec.Artistic || 0.5);
    vector.push(riasec.Social || 0.5);
    vector.push(riasec.Enterprising || 0.5);
    vector.push(riasec.Conventional || 0.5);
    
    // Work Values (1 dimension - average)
    const workValues = profile.WorkValues || {};
    const workValuesAvg = Object.values(workValues).reduce((sum, val) => sum + val, 0) / Math.max(Object.keys(workValues).length, 1);
    vector.push(workValuesAvg);
    
    return vector;
}

// ===== UNIFIED CAREER ROLE SCORING =====

function scoreCareerRole(careerRole, user, ctx = {}) {
    const profile = ctx.profile || {};
    
    // Primary: Vector similarity (CareerRole.vector vs user vector)
    const userVector = createUserVectorFromProfile(profile);
    const vectorSimilarity = cosineSimilarity(userVector, careerRole.vector || []);
    const personalityFit = Math.max(0, vectorSimilarity);
    
    // Secondary: Skill fit (CareerRole.requiredSkills vs user skills)
    const skillFit = computeSkillFit(careerRole.requiredSkills || [], user.skills);
    
    // Calculate weighted score (60% skills, 40% personality)
    const weighted =
        WEIGHTS.skills * skillFit +
        WEIGHTS.personality * personalityFit;
    
    // Ensure score is valid
    let finalWeightedScore = Math.round(clamp01(weighted) * 100);
    
    // Additional validation to prevent any edge cases
    if (isNaN(finalWeightedScore) || finalWeightedScore < 0 || finalWeightedScore > 100) {
        console.warn(`Invalid weightedScore calculated for role ${careerRole.name}: ${finalWeightedScore}, using fallback`);
        // Fallback calculation using individual fits with consistent weights
        const skillPct = Math.round(clamp01(skillFit) * 100);
        const persPct = Math.round(clamp01(personalityFit) * 100);
        finalWeightedScore = Math.round((skillPct * WEIGHTS.skills) + (persPct * WEIGHTS.personality));
        // Final safety check
        finalWeightedScore = Math.max(0, Math.min(100, finalWeightedScore));
    }
    
    // Calculate missing skills for learning path
    const missingSkills = [];
    if (careerRole.requiredSkills && careerRole.requiredSkills.length > 0) {
        for (const requiredSkill of careerRole.requiredSkills) {
            const userSkill = user.skills[requiredSkill.skillName];
            if (!userSkill || !userSkill.selected || userSkill.level < requiredSkill.requiredLevel) {
                missingSkills.push({ 
                    skill: requiredSkill.skillName, 
                    have: userSkill?.level || 0, 
                    need: requiredSkill.requiredLevel,
                    importance: requiredSkill.importance
                });
            }
        }
    }
    
    return {
        id: careerRole._id || careerRole.id,
        name: careerRole.name,
        slug: careerRole.slug,
        description: careerRole.description,
        averageSalary: careerRole.averageSalary,
        jobGrowth: careerRole.jobGrowth,
        skills: careerRole.requiredSkills?.map(rs => rs.skillName) || [],
        roadmap: careerRole.roadmap || [],
        detailedRoadmap: careerRole.detailedRoadmap || [],
        skillFit: clamp01(skillFit),
        personalityFit: clamp01(personalityFit),
        learningFit: 0.5, // Default since learning style is no longer used
        weightedScore: finalWeightedScore,
        matchPercentage: finalWeightedScore, // For legacy compatibility
        vector: careerRole.vector,
        missingSkills: missingSkills,
        // Add role information for compatibility
        currentRole: {
            title: careerRole.name,
            level: 'entry',
            score: finalWeightedScore,
            skillFit: clamp01(skillFit),
            personalityFit: clamp01(personalityFit),
            learningFit: 0.5
        },
        nextRole: null // CareerRole doesn't have multiple levels like career paths
    };
}

// ===== MAIN UNIFIED MATCHING FUNCTIONS =====

function matchCareerRoles(careerRoles, user, ctx = {}) {
    const results = careerRoles.map((role) => scoreCareerRole(role, user, ctx));
    const ranked = results.sort((a, b) => b.weightedScore - a.weightedScore);
    return ranked;
}

// Legacy function for compatibility (now just calls matchCareerRoles)
function matchCareers(careerRoles, user, ctx = {}) {
    return matchCareerRoles(careerRoles, user, ctx);
}

// Main function for unified matching (works with CareerRole database)
function matchAllCareers(careerRoles, user, ctx = {}) {
    // Since we only have CareerRole data, just return the matched career roles
    const results = matchCareerRoles(careerRoles, user, ctx);
    
    // Add type information for consistency
    const typedResults = results.map(result => ({
        ...result,
        type: 'careerRole',
        source: 'vector'
    }));
    
    return typedResults;
}

// ===== UTILITY FUNCTIONS =====

function normalizeUserData(userData) {
    // Ensure consistent user data format
    return {
        skills: userData.skills || {},
        personalityTraits: userData.personalityTraits || {},
        preferences: userData.preferences || { learningStyle: [] }
    };
}

function validateProfile(profile) {
    // Validate personality profile completeness
    const required = ['RIASEC', 'BigFive', 'WorkValues'];
    const missing = required.filter(key => !profile[key]);
    
    if (missing.length > 0) {
        console.warn(`Incomplete profile: missing ${missing.join(', ')}`);
        return false;
    }
    
    return true;
}

// ===== DATABASE INTEGRATION HELPERS =====

async function getCareerRolesFromDatabase(CareerRoleModel, filters = {}) {
    try {
        // Only get career roles that are:
        // 1. Active (isActive: true)
        // 2. Have a detailed roadmap with at least one step
        // 3. Have required skills defined
        // 4. Are properly set up in the admin panel
        const careerRoles = await CareerRoleModel.find({ 
            isActive: true,
            detailedRoadmap: { $exists: true, $ne: [] }, // Must have roadmap steps
            requiredSkills: { $exists: true, $ne: [] }, // Must have required skills
            ...filters 
        });
        
        console.log(`Filtered career roles: ${careerRoles.length} active roles with roadmaps found`);
        
        // Additional validation: ensure each role has proper data
        const validCareerRoles = careerRoles.filter(role => {
            const hasValidRoadmap = role.detailedRoadmap && 
                                   Array.isArray(role.detailedRoadmap) && 
                                   role.detailedRoadmap.length > 0;
            
            const hasValidSkills = role.requiredSkills && 
                                  Array.isArray(role.requiredSkills) && 
                                  role.requiredSkills.length > 0;
            
            const hasValidName = role.name && role.name.trim().length > 0;
            
            const hasValidDescription = role.description && role.description.trim().length > 0;
            
            if (!hasValidRoadmap) {
                console.warn(`Career role "${role.name}" filtered out: missing or empty detailedRoadmap`);
            }
            
            if (!hasValidSkills) {
                console.warn(`Career role "${role.name}" filtered out: missing or empty requiredSkills`);
            }
            
            if (!hasValidName) {
                console.warn(`Career role filtered out: missing or empty name`);
            }
            
            if (!hasValidDescription) {
                console.warn(`Career role "${role.name}" filtered out: missing or empty description`);
            }
            
            return hasValidRoadmap && hasValidSkills && hasValidName && hasValidDescription;
        });
        
        console.log(`Valid career roles for recommendations: ${validCareerRoles.length}`);
        
        return validCareerRoles;
    } catch (error) {
        console.error('Error fetching career roles from database:', error);
        return [];
    }
}

function convertCareerRoleToPathFormat(careerRole) {
    // Convert CareerRole to career path format for compatibility
    return {
        id: careerRole._id || careerRole.id,
        name: careerRole.name,
        description: careerRole.description,
        industry: 'Technology', // Default since CareerRole doesn't have industry
        averageSalary: careerRole.averageSalary,
        jobGrowth: careerRole.jobGrowth,
        roles: [
            {
                title: careerRole.name,
                level: 'entry',
                requiredSkills: careerRole.skills.reduce((acc, skill) => ({ ...acc, [skill]: 2 }), {}),
                learningStyleFit: ['handsOn', 'reading'] // Default
            }
        ],
        // Add personality data if available
        desiredRIASEC: careerRole.desiredRIASEC || {},
        desiredBigFive: careerRole.desiredBigFive || {},
        workValues: careerRole.workValues || []
    };
}

module.exports = {
    // Core matching functions
    matchCareers,
    matchCareerRoles,
    matchAllCareers,
    
    // Individual scoring functions
    scoreCareerRole,
    
    // Utility functions
    normalizeUserData,
    validateProfile,
    createUserVectorFromProfile,
    cosineSimilarity,
    
    // Database integration
    getCareerRolesFromDatabase,
    convertCareerRoleToPathFormat,
    
    // Individual fit functions (for testing/debugging)
    computeSkillFit,
    bigFiveFit,
    riasecFit,
    workValuesFit,
    legacyTraitFit
};
