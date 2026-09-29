const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/employer/candidates (Consent-gated!)
router.get('/candidates', requireAuth, requireRole('EMPLOYER', 'ADMIN'), (req, res) => {
  const { skill, minExperience } = req.query;

  // Filter only candidates who have granted consent to share with employers
  const candidates = store.candidateProfiles
    .filter(cp => cp.consent && cp.consent.shareProfileWithEmployers)
    .map(cp => {
      const user = store.findUserById(cp.userId);
      return {
        id: cp.id,
        userId: cp.userId,
        name: user ? user.name : 'Candidate',
        headline: cp.headline,
        bio: cp.bio,
        location: cp.location,
        targetJobRole: cp.targetJobRole,
        yearsOfExperience: cp.yearsOfExperience,
        skills: cp.skills,
        placementStatus: cp.placementStatus,
        consentGranted: true,
      };
    });

  let filtered = [...candidates];
  if (skill) {
    filtered = filtered.filter(c =>
      c.skills.some(s => s.name.toLowerCase().includes(skill.toLowerCase()))
    );
  }
  if (minExperience) {
    filtered = filtered.filter(c => c.yearsOfExperience >= parseFloat(minExperience));
  }

  res.json({
    success: true,
    count: filtered.length,
    candidates: filtered,
    privacyNotice: 'Only candidates with active DPDP-compliant consent are displayed.',
  });
});

module.exports = router;
