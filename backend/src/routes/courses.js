const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { requireAuth } = require('../middleware/auth');

// GET /api/courses
router.get('/', (req, res) => {
  const courses = store.getAllCourses();
  res.json({ success: true, count: courses.length, courses });
});

// GET /api/courses/recommendations
router.get('/recommendations', requireAuth, (req, res) => {
  const profile = store.getCandidateProfile(req.user.id);
  const candSkills = profile ? profile.skills.map(s => s.name.toLowerCase()) : [];
  const courses = store.getAllCourses();

  // Find courses that teach skills candidate does NOT have yet
  const recommended = courses.map(course => {
    const unacquiredSkills = course.skillsTaught.filter(s => !candSkills.includes(s.toLowerCase()));
    const coverageScore = Math.round((unacquiredSkills.length / Math.max(1, course.skillsTaught.length)) * 100);

    return {
      ...course,
      coverageScore,
      skillsToGain: unacquiredSkills,
      reasonForRecommendation: unacquiredSkills.length > 0
        ? `Directly bridges missing skills: ${unacquiredSkills.join(', ')}`
        : 'High-demand refresher course in your core domain',
    };
  }).sort((a, b) => b.coverageScore - a.coverageScore);

  res.json({ success: true, count: recommended.length, recommendations: recommended });
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', requireAuth, (req, res) => {
  const course = store.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  course.enrolledCount = (course.enrolledCount || 0) + 1;
  store.logAudit(req.user.name, 'ENROLLED_IN_COURSE', `Enrolled in ${course.title}`);

  res.json({
    success: true,
    message: `Successfully enrolled in ${course.title}! Your institute training dashboard has been updated.`,
    course,
  });
});

module.exports = router;
