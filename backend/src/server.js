const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidate');
const skillGapRoutes = require('./routes/skillGap');
const jobsRoutes = require('./routes/jobs');
const coursesRoutes = require('./routes/courses');
const trackingRoutes = require('./routes/tracking');
const instituteRoutes = require('./routes/institute');
const employerRoutes = require('./routes/employer');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'SkillTrack AI Backend',
    hackathon: 'Smart India Hackathon 2026',
    problemStatementId: '26135',
    theme: 'Skill Development / Employment',
    team: 'Code Warriors',
    timestamp: new Date().toISOString(),
    services: {
      api: 'UP',
      database: 'CONNECTED',
      aiService: 'READY',
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SkillTrack AI Backend API running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health:   http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = app;
