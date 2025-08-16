// utils/careerMatch.js
// src/utils/careerMatch.js
const { WEIGHTS, LEVEL_THRESHOLDS, gapDelta } = require('./levelRules');

const clamp01 = (x) => Math.max(0, Math.min(1, x));

function computeSkillFit(requiredSkills = {}, userSkills = {}) {
    const keys = Object.keys(requiredSkills);
    if (keys.length === 0) return 0;
    let total = 0;
    for (const skill of keys) {
        const req = requiredSkills[skill];          // 1..4
        const have = userSkills[skill]?.level || 0; // 0..4
        const ratio = req > 0 ? Math.min(have / req, 1) : 1;
        total += ratio;
    }
    return total / keys.length; // 0..1
}

// ----- Personality fits -----
// Big Five can be provided either as numeric targets 0..1 (preferred) or as "high"/"low"/"neutral".
function bigFiveFit(userBF = {}, desiredBF = {}) {
    const keys = Object.keys(desiredBF);
    if (!keys.length) return 0;
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
    return n ? (sum / n) : 0;
}

function riasecFit(userR = {}, desiredR = {}) {
    const ks = Object.keys(desiredR);
    if (!ks.length) return 0;
    let sum = 0, n = 0;
    for (const k of ks) {
        const target = desiredR[k] ?? 0; // 0..1
        const v = userR[k] ?? 0;
        const f = 1 - Math.abs(target - v);
        sum += Math.max(0, f); n += 1;
    }
    return n ? (sum / n) : 0;
}

// desiredWV: string[] of O*NET families
function workValuesFit(userWV = {}, desiredWV = []) {
    if (!desiredWV || !desiredWV.length) return 0;
    let sum = 0, n = 0;
    for (const w of desiredWV) {
        const v = userWV[w] ?? 0;
        sum += v; n += 1;
    }
    return n ? (sum / n) : 0;
}

// Legacy fallback if role lists personalityTraits: string[]
function legacyTraitFit(roleTraits = [], userTraits = {}) {
    if (!roleTraits || !roleTraits.length) return 0;
    const set = new Set(Object.keys(userTraits).filter((k) => userTraits[k]));
    let m = 0;
    for (const t of roleTraits) if (set.has(t)) m += 1;
    return m / roleTraits.length;
}

function computeLearningStyleFit(roleLS = [], userLS = []) {
    if (!roleLS || !roleLS.length || !userLS || !userLS.length) return 0;
    const set = new Set(userLS);
    let m = 0;
    for (const s of roleLS) if (set.has(s)) m += 1;
    return m / roleLS.length;
}

function eligibleLevel(level, skillFit) {
    const t = LEVEL_THRESHOLDS[level] ?? 1;
    return skillFit >= t;
}

/**
 * ctx.profile should include { RIASEC, BigFive, WorkValues, learningStyle }
 */
function scoreRole(role, user, ctx = {}) {
    const skillFit = computeSkillFit(role.requiredSkills, user.skills);

    // Personality fit: prefer new schema on the career path (desiredRIASEC/desiredBigFive/workValues)
    let personalityFit = 0;
    if (role.desiredRIASEC || role.desiredBigFive || role.workValues) {
        const pf = ctx.profile || {};
        const rFit = riasecFit(pf.RIASEC || {}, role.desiredRIASEC || {});
        const bFit = bigFiveFit(pf.BigFive || {}, role.desiredBigFive || {});
        const wFit = workValuesFit(pf.WorkValues || {}, role.workValues || []);
        personalityFit = 0.45 * rFit + 0.35 * bFit + 0.20 * wFit;
    } else {
        personalityFit = legacyTraitFit(role.personalityTraits, user.personalityTraits);
    }

    // Learning style uses personality-derived styles, unioned with explicit user preference
    const userLS = (ctx.profile && ctx.profile.learningStyle) || (user.preferences?.learningStyle || []);
    const learningFit = computeLearningStyleFit(role.learningStyleFit, userLS);

    const weighted =
        WEIGHTS.skills * skillFit +
        WEIGHTS.personality * personalityFit +
        WEIGHTS.learningStyle * learningFit;

    const qualifies = eligibleLevel(role.level, skillFit);

    const missing = [];
    for (const [skill, req] of Object.entries(role.requiredSkills || {})) {
        const have = user.skills[skill]?.level || 0;
        if (have + gapDelta < req) missing.push({ skill, have, need: req });
    }

    // CRITICAL FIX: Ensure weightedScore is always a valid number between 0-100
    let finalWeightedScore = Math.round(clamp01(weighted) * 100);
    
    // Additional validation to prevent any edge cases
    if (isNaN(finalWeightedScore) || finalWeightedScore < 0 || finalWeightedScore > 100) {
        console.warn(`Invalid weightedScore calculated for role ${role.title}: ${finalWeightedScore}, using fallback`);
        // Fallback calculation using individual fits
        const skillPct = Math.round(clamp01(skillFit) * 100);
        const persPct = Math.round(clamp01(personalityFit) * 100);
        const learnPct = Math.round(clamp01(learningFit) * 100);
        finalWeightedScore = Math.round((skillPct * 0.6) + (persPct * 0.3) + (learnPct * 0.1));
        // Final safety check
        finalWeightedScore = Math.max(0, Math.min(100, finalWeightedScore));
    }

    return {
        roleTitle: role.title,
        level: role.level,
        skillFit: clamp01(skillFit),
        personalityFit: clamp01(personalityFit),
        learningFit: clamp01(learningFit),
        weightedScore: finalWeightedScore, // Always 0-100, validated
        qualifies,
        missingSkills: missing
    };
}

function evaluateCareerPath(careerPath, user, ctx = {}) {
    const scored = (careerPath.roles || []).map((r) => scoreRole(r, user, ctx));

    const order = { entry: 1, mid: 2, advanced: 3 };
    const qualified = scored
        .filter((r) => r.qualifies)
        .sort((a, b) => (order[b.level] - order[a.level]) || (b.weightedScore - a.weightedScore));

    const currentRole = qualified[0] || null;

    let nextRole = null;
    if (currentRole) {
        const higher = scored
            .filter((r) => order[r.level] > order[currentRole.level])
            .sort((a, b) => (order[a.level] - order[b.level]) || (b.weightedScore - a.weightedScore))[0];
        nextRole = higher || null;
    } else {
        nextRole = scored.find((r) => r.level === 'entry') || scored[0] || null;
    }

    // CRITICAL FIX: Ensure pathScore is always valid and consistent
    let pathScore = 0;
    if (currentRole) {
        pathScore = Math.max(0, Math.min(100, currentRole.weightedScore));
    } else {
        // If no qualified role, use the highest score from any role
        const maxScore = Math.max(...scored.map((r) => r.weightedScore || 0), 0);
        pathScore = Math.max(0, Math.min(100, maxScore));
    }

    // Final validation
    if (isNaN(pathScore) || pathScore < 0 || pathScore > 100) {
        console.warn(`Invalid pathScore calculated for career ${careerPath.name}: ${pathScore}, using fallback`);
        pathScore = Math.max(0, Math.min(100, Math.round(pathScore) || 0));
    }

    return {
        id: careerPath.id,
        name: careerPath.name,
        description: careerPath.description,
        industry: careerPath.industry,
        averageSalary: careerPath.averageSalary,
        jobGrowth: careerPath.jobGrowth,
        roles: scored,
        currentRole,
        nextRole,
        pathScore
    };
}

function matchCareers(careerPaths, user, ctx = {}) {
    const results = careerPaths.map((p) => evaluateCareerPath(p, user, ctx));
    const ranked = results.sort((a, b) => b.pathScore - a.pathScore);
    return ranked;
}

module.exports = {
    matchCareers,
    evaluateCareerPath,
    scoreRole
};


/*
const { WEIGHTS, LEVEL_THRESHOLDS, gapDelta } = require('./levelRules');
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// --- helpers: normalize desired specs ---
const R_LETTERS_TO_NAMES = { R:"Realistic", I:"Investigative", A:"Artistic", S:"Social", E:"Enterprising", C:"Conventional" };

function normalizeDesiredRIASEC(desired = {}) {
    // Accept {R:0.7,...} or {"Realistic":0.7,...}
    const out = {};
    for (const [k, v] of Object.entries(desired || {})) {
        const key = R_LETTERS_TO_NAMES[k] || k; // map letters to names if needed
        out[key] = typeof v === 'number' ? clamp01(v) : 0; // numeric target 0..1
    }
    return out;
}

function normalizeDesiredBigFive(desired = {}) {
    // Accept numeric targets (0..1) OR keywords ("high","low","neutral")
    // We convert keywords to target numbers: high=0.8, neutral=0.5, low=0.2
    const mapWord = (w) => (w === 'high' ? 0.8 : w === 'low' ? 0.2 : 0.5);
    const out = {};
    for (const [k, v] of Object.entries(desired || {})) {
        out[k] = typeof v === 'number' ? clamp01(v) : mapWord(String(v).toLowerCase());
    }
    return out;
}

function normalizeDesiredWorkValues(desired = []) {
    // Already an array of value names; keep as-is
    return Array.isArray(desired) ? desired : [];
}

// --- fits ---
function computeSkillFit(required = {}, userSkills = {}) {
    const keys = Object.keys(required || {});
    if (!keys.length) return 0;
    let total = 0;
    for (const skill of keys) {
        const req = required[skill] || 0;
        const have = userSkills[skill]?.level || 0;
        const ratio = req > 0 ? Math.min(have / req, 1) : 1;
        total += ratio;
    }
    return total / keys.length;
}

function riasecFit(userR = {}, desiredR = {}) {
    const ks = Object.keys(desiredR || {});
    if (!ks.length) return 0;
    let sum = 0;
    for (const k of ks) {
        const target = desiredR[k] ?? 0;
        const v = userR[k] ?? 0;
        sum += Math.max(0, 1 - Math.abs(target - v)); // closeness
    }
    return sum / ks.length;
}

function bigFiveFit(userBF = {}, desiredBF = {}) {
    const ks = Object.keys(desiredBF || {});
    if (!ks.length) return 0;
    let sum = 0;
    for (const k of ks) {
        const target = desiredBF[k] ?? 0.5; // numeric 0..1 after normalize
        const v = userBF[k] ?? 0.5;
        sum += Math.max(0, 1 - Math.abs(target - v)); // closeness
    }
    return sum / ks.length;
}

function workValuesFit(userWV = {}, desiredWV = []) {
    if (!desiredWV || !desiredWV.length) return 0;
    let sum = 0;
    for (const w of desiredWV) sum += (userWV[w] ?? 0);
    return sum / desiredWV.length;
}

function legacyTraitFit(roleTraits = [], userTraits = {}) {
    if (!roleTraits || !roleTraits.length) return 0;
    const set = new Set(Object.keys(userTraits).filter((k) => userTraits[k]));
    let m = 0; for (const t of roleTraits) if (set.has(t)) m += 1;
    return m / roleTraits.length;
}

function computeLearningStyleFit(roleLS = [], userLS = []) {
    if (!roleLS?.length || !userLS?.length) return 0;
    const set = new Set(userLS);
    let m = 0; for (const s of roleLS) if (set.has(s)) m += 1;
    return m / roleLS.length;
}

function eligibleLevel(level, skillFit) {
    const t = LEVEL_THRESHOLDS[level] ?? 1;
    return skillFit >= t;
}


 // scoreRole uses role-level desired* if present, else falls back to path-level values from ctx.currentPathDesired
 // ctx.profile: { RIASEC, BigFive, WorkValues, learningStyle }
 // ctx.currentPathDesired: { riasec, bigfive, workvalues }

function scoreRole(role, user, ctx = {}) {
    const skillFit = computeSkillFit(role.requiredSkills, user.skills);

    // choose desired specs from role or path
    const desiredSource = {
        riasec: normalizeDesiredRIASEC(role.desiredRIASEC || ctx.currentPathDesired?.riasec || {}),
        bigfive: normalizeDesiredBigFive(role.desiredBigFive || ctx.currentPathDesired?.bigfive || {}),
        workvalues: normalizeDesiredWorkValues(role.workValues || ctx.currentPathDesired?.workvalues || [])
    };

    const pf = ctx.profile || {};
    let personalityFit = 0;
    if (Object.keys(desiredSource.riasec).length || Object.keys(desiredSource.bigfive).length || desiredSource.workvalues.length) {
        const rFit = riasecFit(pf.RIASEC || {}, desiredSource.riasec);
        const bFit = bigFiveFit(pf.BigFive || {}, desiredSource.bigfive);
        const wFit = workValuesFit(pf.WorkValues || {}, desiredSource.workvalues);
        personalityFit = 0.45 * rFit + 0.35 * bFit + 0.20 * wFit;
    } else {
        // legacy fallback
        personalityFit = legacyTraitFit(role.personalityTraits, user.personalityTraits);
    }

    const userLS = (ctx.profile && ctx.profile.learningStyle) || (user.preferences?.learningStyle || []);
    const learningFit = computeLearningStyleFit(role.learningStyleFit, userLS);

    const weighted =
        WEIGHTS.skills * skillFit +
        WEIGHTS.personality * personalityFit +
        WEIGHTS.learningStyle * learningFit;

    const qualifies = eligibleLevel(role.level, skillFit);

    const missing = [];
    for (const [skill, req] of Object.entries(role.requiredSkills || {})) {
        const have = user.skills[skill]?.level || 0;
        if (have + gapDelta < req) missing.push({ skill, have, need: req });
    }

    return {
        roleTitle: role.title,
        level: role.level,
        skillFit: clamp01(skillFit),
        personalityFit: clamp01(personalityFit),
        learningFit: clamp01(learningFit),
        weightedScore: Math.round(clamp01(weighted) * 100),
        qualifies,
        missingSkills: missing
    };
}

function evaluateCareerPath(careerPath, user, ctx = {}) {
    // prepare path-level desired for fallback
    const currentPathDesired = {
        riasec: normalizeDesiredRIASEC(careerPath.desiredRIASEC || {}),
        bigfive: normalizeDesiredBigFive(careerPath.desiredBigFive || {}),
        workvalues: normalizeDesiredWorkValues(careerPath.workValues || [])
    };

    const scored = (careerPath.roles || []).map((r) =>
        scoreRole(r, user, { ...ctx, currentPathDesired })
    );

    const order = { entry: 1, mid: 2, advanced: 3 };
    const qualified = scored
        .filter((r) => r.qualifies)
        .sort((a, b) => (order[b.level] - order[a.level]) || (b.weightedScore - a.weightedScore));

    const currentRole = qualified[0] || null;

    let nextRole = null;
    if (currentRole) {
        const higher = scored
            .filter((r) => order[r.level] > order[currentRole.level])
            .sort((a, b) => (order[a.level] - order[b.level]) || (b.weightedScore - a.weightedScore))[0];
        nextRole = higher || null;
    } else {
        nextRole = scored.find((r) => r.level === 'entry') || scored[0] || null;
    }

    const pathScore = currentRole
        ? currentRole.weightedScore
        : Math.max(...scored.map((r) => r.weightedScore), 0);

    return {
        id: careerPath.id,
        name: careerPath.name,
        description: careerPath.description,
        industry: careerPath.industry,
        averageSalary: careerPath.averageSalary,
        jobGrowth: careerPath.jobGrowth,
        roles: scored,
        currentRole,
        nextRole,
        pathScore
    };
}

function matchCareers(careerPaths, user, ctx = {}) {
    const results = careerPaths.map((p) => evaluateCareerPath(p, user, ctx));
    return results.sort((a, b) => b.pathScore - a.pathScore);
}

module.exports = {
    matchCareers,
    evaluateCareerPath,
    scoreRole
};

*/
