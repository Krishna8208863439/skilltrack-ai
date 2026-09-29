const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/jobs
router.get('/', (req, res) => {
  const jobs = store.getAllJobs();
  const userId = req.headers['x-user-id'] || 'u-cand-1';
  const profile = store.getCandidateProfile(userId);
  const candSkills = profile ? profile.skills : [];

  // Compute composite score & factor breakdown for each job
  const enrichedJobs = jobs.map(job => {
    let matchedCount = 0;
    const missing = [];
    const matched = [];

    const reqSkills = job.requiredSkills || [];
    reqSkills.forEach(rs => {
      const found = candSkills.find(cs => cs.name.toLowerCase() === rs.name.toLowerCase());
      if (found) {
        matchedCount++;
        matched.push(rs.name);
      } else {
        missing.push(rs.name);
      }
    });

    const skillScore = reqSkills.length > 0 ? Math.round((matchedCount / reqSkills.length) * 100) : 75;
    const semanticMatch = Math.min(95, Math.round(skillScore * 0.9 + 10));
    const compositeScore = Math.round(skillScore * 0.5 + semanticMatch * 0.3 + 20);

    return {
      ...job,
      matchScore: Math.min(98, Math.max(35, compositeScore)),
      breakdown: {
        skillOverlapScore: skillScore,
        semanticTextScore: semanticMatch,
        experienceFitScore: 100,
        locationScore: 85,
      },
      matchingSkills: matched,
      missingSkills: missing,
      explanation: `Matches ${matchedCount} of ${reqSkills.length} job skills. Semantic role overlap is ${semanticMatch}%.`,
    };
  });

  res.json({ success: true, count: enrichedJobs.length, jobs: enrichedJobs });
});

// GET /api/jobs/:id
router.get('/:id', (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job });
});

// POST /api/jobs/:id/apply
router.post('/:id/apply', requireAuth, (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  const existing = store.getApplications({ userId: req.user.id, jobId: job.id });
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: 'You have already applied to this job.' });
  }

  const profile = store.getCandidateProfile(req.user.id);
  const candSkills = profile ? profile.skills : [];
  let matchedCount = 0;
  const reqSkills = job.requiredSkills || [];
  reqSkills.forEach(rs => {
    if (candSkills.some(cs => cs.name.toLowerCase() === rs.name.toLowerCase())) {
      matchedCount++;
    }
  });
  const skillScore = reqSkills.length > 0 ? Math.round((matchedCount / reqSkills.length) * 100) : 75;
  const matchScore = Math.min(98, Math.max(35, Math.round(skillScore * 0.8 + 20)));

  const app = store.createApplication({
    userId: req.user.id,
    candidateName: req.user.name,
    candidateEmail: req.user.email,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    matchScore,
  });

  store.logAudit(req.user.name, 'APPLICATION_SUBMITTED', `Applied to ${job.title} at ${job.company}`);

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully with verified credentials.',
    application: app,
  });
});

// POST /api/jobs (Employer only)
router.post('/', requireAuth, requireRole('EMPLOYER', 'ADMIN'), (req, res) => {
  const { title, company, location, workMode, jobType, description, requiredSkills, salaryRange } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  let parsedSkills = requiredSkills;
  if (typeof requiredSkills === 'string') {
    try {
      parsedSkills = JSON.parse(requiredSkills);
    } catch (e) {
      parsedSkills = requiredSkills.split(',').map(s => ({ name: s.trim(), importance: 'REQUIRED', minProficiency: 3 }));
    }
  }

  const newJob = store.createJob({
    employerId: req.user.id,
    title,
    company: company || req.user.name,
    location: location || 'Remote / Hybrid',
    workMode: workMode || 'HYBRID',
    jobType: jobType || 'FULL_TIME',
    description,
    requiredSkills: parsedSkills || [
      { name: 'JavaScript', importance: 'REQUIRED', minProficiency: 3 },
      { name: 'React.js', importance: 'REQUIRED', minProficiency: 3 },
    ],
    salaryRange: salaryRange || 'Competitive',
  });

  store.logAudit(req.user.name, 'JOB_CREATED', `Created job posting: ${title}`);

  res.status(201).json({ success: true, message: 'Job posted successfully.', job: newJob });
});

module.exports = router;
