// src/utils/levelRules.js
// Weights and thresholds for career matching

const WEIGHTS = {
    skills: 0.60,        // 60% - Skill requirements match
    personality: 0.40,   // 40% - Personality fit
    learningStyle: 0.00  // 0% - Learning style preference (removed)
};

const LEVEL_THRESHOLDS = {
    entry: 0.3,      // 30% skill fit required for entry level
    mid: 0.6,        // 60% skill fit required for mid level
    advanced: 0.8    // 80% skill fit required for advanced level
};

const gapDelta = 0.5; // Minimum gap between current and required skill level

module.exports = {
    WEIGHTS,
    LEVEL_THRESHOLDS,
    gapDelta
};
