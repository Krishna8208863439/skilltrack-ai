const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', requireAuth, requireRole('ADMIN'), (req, res) => {
  const stats = store.getAdminStats();
  res.json({
    success: true,
    data: stats,
    metadata: {
      calculatedAt: new Date().toISOString(),
      formulaNotes: {
        placementRate: 'Total Verified Placements ÷ Total Completed Cohort Candidates * 100',
        interviewConversion: 'Scheduled Interviews ÷ Total Applications * 100',
      }
    }
  });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAuth, requireRole('ADMIN'), (req, res) => {
  const logs = store.getAuditLogs();
  res.json({ success: true, count: logs.length, logs });
});

// GET /api/admin/export-csv
router.get('/export-csv', requireAuth, requireRole('ADMIN'), (req, res) => {
  const stats = store.getAdminStats();
  const rows = [
    ['Metric', 'Value', 'Calculation Basis'],
    ['Total Registered Candidates', stats.overview.totalCandidates, 'Active accounts in database'],
    ['Total Verified Institutes', stats.overview.totalInstitutes, 'Accredited training centers'],
    ['Total Partner Employers', stats.overview.totalEmployers, 'Verified recruiters'],
    ['Active Job Postings', stats.overview.totalJobs, 'Open vacancy postings'],
    ['Total Job Applications', stats.overview.totalApplications, 'Submitted candidate pipelines'],
    ['Verified Placements', stats.overview.totalPlaced, 'Employment outcomes with offer letters'],
    ['Placement Rate %', `${stats.overview.placementRatePercentage}%`, 'Placed ÷ Completed Training'],
    ['Average Days to Placement', stats.overview.averageDaysToPlacement, 'From course finish to verified joining'],
  ];

  const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="SkillTrack_Employment_Intelligence_Report_2026.csv"');
  res.send(csvContent);
});

module.exports = router;
