const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { requireAuth } = require('../middleware/auth');

// GET /api/tracking/pipeline
router.get('/pipeline', requireAuth, (req, res) => {
  const isCandidate = req.user.role === 'CANDIDATE';
  const filter = isCandidate ? { userId: req.user.id } : {};

  const applications = store.getApplications(filter);
  const interviews = store.getInterviews();
  const outcomes = store.getEmploymentOutcomes();

  res.json({
    success: true,
    data: {
      applications,
      interviews,
      outcomes,
      summary: {
        totalApplications: applications.length,
        activeInterviews: interviews.filter(i => i.status === 'SCHEDULED').length,
        placedCount: outcomes.length,
      }
    }
  });
});

// POST /api/tracking/interviews/schedule
router.post('/interviews/schedule', requireAuth, (req, res) => {
  const { applicationId, round, scheduledAt, meetingUrl, interviewer } = req.body;
  if (!applicationId || !scheduledAt) {
    return res.status(400).json({ success: false, message: 'Application ID and scheduled time are required.' });
  }

  const interview = store.scheduleInterview({
    applicationId,
    round: round || 'ROUND_1_TECHNICAL',
    scheduledAt,
    meetingUrl: meetingUrl || 'https://meet.google.com/cod-ewar-sih',
    interviewer: interviewer || req.user.name,
  });

  store.logAudit(req.user.name, 'INTERVIEW_SCHEDULED', `Scheduled interview for application ${applicationId}`);

  res.status(201).json({
    success: true,
    message: 'Interview successfully scheduled and notified to candidate.',
    interview,
  });
});

// POST /api/tracking/status-update
router.post('/status-update', requireAuth, (req, res) => {
  const { applicationId, status, notes } = req.body;
  if (!applicationId || !status) {
    return res.status(400).json({ success: false, message: 'Application ID and status are required.' });
  }

  const updated = store.updateApplicationStatus(applicationId, status, notes, req.user.name);
  if (!updated) return res.status(404).json({ success: false, message: 'Application not found' });

  store.logAudit(req.user.name, 'APPLICATION_STATUS_UPDATED', `Updated application ${applicationId} to ${status}`);

  res.json({
    success: true,
    message: `Application moved to ${status}. Status history timestamped.`,
    application: updated,
  });
});

module.exports = router;
