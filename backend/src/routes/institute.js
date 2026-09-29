const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/institute/programs
router.get('/programs', requireAuth, (req, res) => {
  const programs = store.getTrainingPrograms();
  const enrollments = store.getEnrollments();
  res.json({ success: true, programs, enrollments });
});

// POST /api/institute/verify-completion
router.post('/verify-completion', requireAuth, requireRole('INSTITUTE', 'ADMIN'), (req, res) => {
  const { enrollmentId, finalScore, skillNameToVerify } = req.body;
  const enrollments = store.getEnrollments();
  const enr = enrollments.find(e => e.id === enrollmentId) || enrollments[0];

  enr.status = 'COMPLETED';
  enr.finalScore = finalScore || 90;
  enr.completionDate = new Date().toISOString();

  // Find candidate and mark skill as verified!
  const profile = store.getCandidateProfile(enr.userId);
  if (profile && skillNameToVerify) {
    const sk = profile.skills.find(s => s.name.toLowerCase() === skillNameToVerify.toLowerCase());
    if (sk) {
      sk.isVerified = true;
      sk.source = 'INSTITUTE_VERIFIED';
      sk.proficiency = Math.min(5, sk.proficiency + 1);
    }
  }

  store.logAudit(req.user.name, 'VERIFIED_TRAINING_COMPLETION', `Verified completion for enrollment ${enrollmentId}`);

  res.json({
    success: true,
    message: 'Training completion verified. Candidate skill level upgraded to INSTITUTE_VERIFIED.',
    enrollment: enr,
  });
});

module.exports = router;
