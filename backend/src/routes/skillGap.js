const express = require('express');
const router = express.Router();
const store = require('../services/store');
const aiService = require('../services/aiService');
const { requireAuth } = require('../middleware/auth');

// POST /api/skill-gap/analyze
router.post('/analyze', requireAuth, async (req, res) => {
  const { jobId, candidateSkillsOverride } = req.body;
  const job = (jobId && store.getJobById(jobId)) || store.getAllJobs()[0];
  if (!job) {
    return res.status(404).json({ success: false, message: 'No target job available for skill gap analysis.' });
  }

  const profile = store.getCandidateProfile(req.user.id);
  const candidateSkills = candidateSkillsOverride || (profile ? profile.skills : []);

  // Try AI service first
  let aiData = null;
  try {
    aiData = await aiService.calculateSkillGap(candidateSkills, job.requiredSkills, job.description);
  } catch (err) {
    console.warn('AI calculateSkillGap fallback to local:', err.message);
  }

  const weightMap = {
    REQUIRED: 3.0,
    PREFERRED: 1.5,
    NICE_TO_HAVE: 0.5,
  };

  let totalWeight = 0;
  let earnedScore = 0;

  const matchedSkills = [];
  const missingSkills = [];
  const radarData = [];

  for (const reqSkill of job.requiredSkills) {
    const w = weightMap[reqSkill.importance] || 1.0;
    totalWeight += w;

    const candSkill = candidateSkills.find(
      s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
    );

    const targetProf = reqSkill.minProficiency || 3;
    const candProf = candSkill ? candSkill.proficiency : 0;

    radarData.push({
      subject: reqSkill.name,
      requiredLevel: targetProf,
      candidateLevel: candProf,
      fullMark: 5,
    });

    if (candSkill && candProf > 0) {
      let credit = 0;
      if (candProf >= targetProf) {
        credit = 1.0;
      } else if (candProf === targetProf - 1) {
        credit = 0.75;
      } else if (candProf === targetProf - 2) {
        credit = 0.50;
      } else {
        credit = 0.25;
      }

      earnedScore += w * credit;
      matchedSkills.push({
        name: reqSkill.name,
        importance: reqSkill.importance,
        requiredProficiency: targetProf,
        currentProficiency: candProf,
        isVerified: candSkill.isVerified || false,
        proficiencyMet: candProf >= targetProf,
      });
    } else {
      missingSkills.push({
        name: reqSkill.name,
        importance: reqSkill.importance,
        requiredProficiency: targetProf,
        currentProficiency: 0,
        gapImpact: reqSkill.importance === 'REQUIRED' ? 'HIGH' : 'MEDIUM',
      });
    }
  }

  const rawMatch = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;
  const matchPercentage = aiData?.matchPercentage ?? (Math.round(rawMatch * 10) / 10);
  const skillGapScore = aiData?.skillGapScore ?? (Math.round((100 - matchPercentage) * 10) / 10);

  // Map missing skills to courses available in catalog
  const allCourses = store.getAllCourses();
  const effectiveMissing = aiData?.missingSkills ?? missingSkills;
  const recommendedCourses = allCourses.filter(course =>
    course.skillsTaught.some(st =>
      effectiveMissing.some(ms => ms.name.toLowerCase() === st.toLowerCase())
    )
  );

  store.logAudit(
    req.user.name,
    'SKILL_GAP_ANALYZED',
    `Evaluated compatibility against ${job.title} at ${job.company}: ${matchPercentage}% match`
  );

  res.json({
    success: true,
    data: {
      targetJob: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
      },
      matchPercentage,
      skillGapScore,
      semanticSimilarity: aiData?.semanticSimilarity ?? matchPercentage,
      matchedSkills: aiData?.matchedSkills ?? matchedSkills,
      missingSkills: effectiveMissing,
      radarData: aiData?.radarData ?? radarData,
      recommendedCourses,
      scoringMethodology: {
        formula: 'Weighted Deterministic Proficiency Formula: Sum(Weight * ProficiencyCredit) / Sum(Weights)',
        weights: { REQUIRED: '3.0x', PREFERRED: '1.5x', NICE_TO_HAVE: '0.5x' },
        disclaimer: 'Compatibility score measures qualification match only, NOT a statistical probability of employment.',
      },
      actionPlan: aiData?.actionPlan ?? (
        effectiveMissing.length > 0 
          ? `Bridge your highest-impact skill gap (${effectiveMissing[0].name}) to gain up to +${Math.round((3.0 / Math.max(1, totalWeight)) * 100)}% match.`
          : 'You meet all mandatory skill requirements for this position!'
      )
    }
  });
});

module.exports = router;
