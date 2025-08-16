// utils/personalityScoring.js
// src/utils/personalityScoring.js

const BIGFIVE_KEYS = ["Openness","Conscientiousness","Extraversion","Agreeableness","Neuroticism"];
const RIASEC_KEYS  = ["Realistic","Investigative","Artistic","Social","Enterprising","Conventional"];
const WV_KEYS      = ["Achievement","Independence","Recognition","Relationships","Support","WorkingConditions"];

const norm = (v, reverse=false) => {
    const raw = reverse ? (6 - v) : v; // Likert 1..5
    return Math.max(0, Math.min(1, (raw - 1) / 4));
};

// ---------- Mini-IPIP-20 mapping (ids 1..20) ----------
function scoreBigFive(answers) {
    // Extraversion: + + - -
    const E = [ norm(answers[1]), norm(answers[2]), norm(answers[3], true), norm(answers[4], true) ];
    // Agreeableness: + + - -
    const A = [ norm(answers[5]), norm(answers[6]), norm(answers[7], true), norm(answers[8], true) ];
    // Conscientiousness: + + - -
    const C = [ norm(answers[9]), norm(answers[10]), norm(answers[11], true), norm(answers[12], true) ];
    // Neuroticism: + + - -
    const N = [ norm(answers[13]), norm(answers[14]), norm(answers[15], true), norm(answers[16], true) ];
    // Openness: + + - -
    const O = [ norm(answers[17]), norm(answers[18]), norm(answers[19], true), norm(answers[20], true) ];

    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

    return {
        Openness: avg(O),
        Conscientiousness: avg(C),
        Extraversion: avg(E),
        Agreeableness: avg(A),
        Neuroticism: avg(N)
    };
}

function scoreRIASEC(answers) {
    return {
        Realistic:      norm(answers[21]),
        Investigative:  norm(answers[22]),
        Artistic:       norm(answers[23]),
        Social:         norm(answers[24]),
        Enterprising:   norm(answers[25]),
        Conventional:   norm(answers[26])
    };
}

function scoreWorkValues(answers) {
    return {
        Achievement:        norm(answers[27]),
        Independence:       norm(answers[28]),
        Recognition:        norm(answers[29]),
        Relationships:      norm(answers[30]),
        Support:            norm(answers[31]),
        WorkingConditions:  norm(answers[32])
    };
}

/**
 * answersInput can be an array [{questionId, score}] or a map { "1":1..5, ... }
 * prefs is optional (e.g., { learningStyle: string[] })
 */
function scorePersonality(answersInput, prefs = {}) {
    const answers = {};
    if (Array.isArray(answersInput)) {
        for (const a of answersInput) answers[a.questionId] = a.score;
    } else if (answersInput && typeof answersInput === "object") {
        Object.assign(answers, answersInput);
    }

    const BigFive    = scoreBigFive(answers);
    const RIASEC     = scoreRIASEC(answers);
    const WorkValues = scoreWorkValues(answers);

    // Derive learning styles from personality/work values (interpretable rules)
    const ls = new Set();
    if (BigFive.Openness >= 0.60 || RIASEC.Artistic >= 0.60) ls.add("visual");
    if (WorkValues.Achievement >= 0.55 || WorkValues.Independence >= 0.55) ls.add("handsOn");
    if (WorkValues.WorkingConditions >= 0.55 || BigFive.Conscientiousness >= 0.62) ls.add("reading");
    if (BigFive.Extraversion >= 0.60 || RIASEC.Social >= 0.60) ls.add("auditory");

    // Merge with explicit preferences if provided (union, dedup)
    const explicit = Array.isArray(prefs?.learningStyle) ? prefs.learningStyle : [];
    for (const p of explicit) ls.add(p);
    if (!ls.size) ls.add("handsOn");

    return { RIASEC, BigFive, WorkValues, learningStyle: Array.from(ls) };
}

// Legacy boolean traits (only used if some roles still list personalityTraits:[...])
function mapProfileToTraitFlags(profile) {
    const f = {};
    f.analytical        = profile.RIASEC.Investigative >= 0.6 || profile.BigFive.Conscientiousness >= 0.6;
    f.creative          = profile.RIASEC.Artistic >= 0.6 || profile.BigFive.Openness >= 0.65;
    f.detailOriented    = profile.BigFive.Conscientiousness >= 0.65 || profile.RIASEC.Conventional >= 0.6;
    f.teamPlayer        = profile.BigFive.Agreeableness >= 0.6 || profile.RIASEC.Social >= 0.6;
    f.leadership        = profile.RIASEC.Enterprising >= 0.6 || profile.BigFive.Extraversion >= 0.6;
    f.problemSolving    = profile.RIASEC.Investigative >= 0.6;
    f.structured        = profile.RIASEC.Conventional >= 0.6;
    f.calmUnderPressure = (1 - profile.BigFive.Neuroticism) >= 0.6;
    f.communication     = profile.BigFive.Extraversion >= 0.6 || profile.BigFive.Agreeableness >= 0.6;
    return f;
}

module.exports = {
    scorePersonality,
    mapProfileToTraitFlags
};


/*
const RIASEC_KEYS = ["Realistic","Investigative","Artistic","Social","Enterprising","Conventional"];
const BIGFIVE_KEYS = ["Openness","Conscientiousness","Extraversion","Agreeableness","Neuroticism"];
const WORKVALUES_KEYS = ["Autonomy","Structure","Impact","Collaboration","Leadership","Precision","Learning"];

function normalizeLikert(v, reverse = false) {
    const raw = reverse ? (6 - v) : v; // 1..5
    return (raw - 1) / 4;               // -> 0..1
}

// answersMap: { "1": 4, ... }; questions: [{id, domain, facet, reverse?}, ...]
function scorePersonality(answersMap = {}, questions = []) {
    const buckets = {
        RIASEC: Object.create(null),
        BigFive: Object.create(null),
        WorkValues: Object.create(null)
    };

    for (const q of questions) {
        const val = answersMap[q.id];
        if (!val) continue;
        const x = normalizeLikert(val, !!q.reverse);
        const group = buckets[q.domain];          // <-- FIX: use domain (not category)
        if (!group[q.facet]) group[q.facet] = { sum: 0, n: 0 };
        group[q.facet].sum += x;
        group[q.facet].n += 1;
    }

    const avg = (obj) => {
        const out = {};
        for (const k of Object.keys(obj)) {
            const { sum, n } = obj[k];
            out[k] = n ? sum / n : 0;
        }
        return out;
    };

    const RIASEC = avg(buckets.RIASEC);
    const BigFive = avg(buckets.BigFive);
    const WorkValues = avg(buckets.WorkValues);

    // derive learning styles (unchanged)
    const learningStyle = [];
    if ((WorkValues.Learning ?? 0) >= 0.55 || (BigFive.Openness ?? 0) >= 0.60) learningStyle.push("handsOn", "reading");
    if ((WorkValues.Precision ?? 0) >= 0.55 || (BigFive.Conscientiousness ?? 0) >= 0.60) learningStyle.push("reading");
    if ((RIASEC.Artistic ?? 0) >= 0.60 || (BigFive.Openness ?? 0) >= 0.65) learningStyle.push("visual");
    if ((WorkValues.Collaboration ?? 0) >= 0.55 || (BigFive.Extraversion ?? 0) >= 0.60) learningStyle.push("auditory");

    return {
        RIASEC: RIASEC_KEYS.reduce((o,k)=> (o[k] = RIASEC[k] ?? 0, o), {}),
        BigFive: BIGFIVE_KEYS.reduce((o,k)=> (o[k] = BigFive[k] ?? 0, o), {}),
        WorkValues: WORKVALUES_KEYS.reduce((o,k)=> { if (k in WorkValues) o[k] = WorkValues[k]; return o; }, {}),
        learningStyle: Array.from(new Set(learningStyle.length ? learningStyle : ["handsOn"]))
    };
}

function mapProfileToTraitFlags(profile) {
    const f = {};
    f.analytical        = (profile.RIASEC.Investigative >= 0.6) || (profile.BigFive.Conscientiousness >= 0.6);
    f.creative          = (profile.RIASEC.Artistic >= 0.6) || (profile.BigFive.Openness >= 0.65);
    f.detailOriented    = (profile.BigFive.Conscientiousness >= 0.65) || (profile.RIASEC.Conventional >= 0.6) || ((profile.WorkValues.Precision ?? 0) >= 0.6);
    f.teamPlayer        = (profile.BigFive.Agreeableness >= 0.6) || ((profile.WorkValues.Collaboration ?? 0) >= 0.6);
    f.leadership        = ((profile.WorkValues.Leadership ?? 0) >= 0.6) || (profile.RIASEC.Enterprising >= 0.6) || (profile.BigFive.Extraversion >= 0.6);
    f.problemSolving    = (profile.RIASEC.Investigative >= 0.6);
    f.structured        = (profile.RIASEC.Conventional >= 0.6) || ((profile.WorkValues.Structure ?? 0) >= 0.6);
    f.calmUnderPressure = ((1 - (profile.BigFive.Neuroticism ?? 0)) >= 0.6);
    f.communication     = (profile.BigFive.Extraversion >= 0.6) || (profile.BigFive.Agreeableness >= 0.6);
    return f;
}

module.exports = {
    scorePersonality,
    mapProfileToTraitFlags
};
*/