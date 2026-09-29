const express = require('express');
const router = express.Router();
const multer = require('multer');
const store = require('../services/store');
const aiService = require('../services/aiService');
const { requireAuth } = require('../middleware/auth');

// Multer memory storage for direct streaming to Python AI service
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .pdf, .docx, and .txt files are supported.'));
    }
  },
});

// GET /api/candidate/profile
router.get('/profile', requireAuth, (req, res) => {
  const profile = store.getCandidateProfile(req.user.id);
  res.json({ success: true, profile });
});

// PUT /api/candidate/profile
router.put('/profile', requireAuth, (req, res) => {
  const updates = req.body;
  const updated = store.updateCandidateProfile(req.user.id, updates);
  store.logAudit(req.user.name, 'UPDATED_CANDIDATE_PROFILE', 'Candidate updated profile details & skills');
  res.json({ success: true, message: 'Profile updated successfully.', profile: updated });
});

// POST /api/candidate/parse-resume-text
// AI Resume parsing with Review-and-Edit workflow
router.post('/parse-resume-text', requireAuth, async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ success: false, message: 'Resume text or document content required.' });
  }

  try {
    const aiResult = await aiService.extractSkills(resumeText);
    store.logAudit(
      req.user.name,
      'RESUME_PARSED_AI',
      `Extracted ${aiResult.parsedData?.extractedSkills?.length || 0} skills from text via AI Service`
    );
    res.json(aiResult);
  } catch (err) {
    console.error('Error parsing resume text:', err);
    res.status(500).json({ success: false, message: 'Failed to parse resume text.' });
  }
});

// POST /api/candidate/upload-resume
// File upload with PyMuPDF/docx extraction via AI Service
router.post('/upload-resume', requireAuth, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a resume file (.pdf, .docx, or .txt).' });
  }

  try {
    const aiResult = await aiService.parseResumeFile(req.file.buffer, req.file.originalname);
    store.logAudit(
      req.user.name,
      'RESUME_FILE_UPLOADED',
      `Parsed resume file ${req.file.originalname} (${req.file.size} bytes)`
    );
    res.json(aiResult);
  } catch (err) {
    console.error('Error processing resume file:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to process resume file.' });
  }
});

module.exports = router;
