const jwt = require('jsonwebtoken');
const store = require('../services/store');

const JWT_SECRET = process.env.JWT_SECRET || 'sih2026_skilltrack_ai_jwt_secret_codewarriors_development';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is inactive or does not exist.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Action requires role: ${allowedRoles.join(' or ')}`
      });
    }
    // Extra guard: only krishna@gmail.com may exercise ADMIN privileges
    if (allowedRoles.includes('ADMIN') && req.user.role === 'ADMIN') {
      if (req.user.email.toLowerCase() !== 'krishna@gmail.com') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. This admin account is not authorised.'
        });
      }
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
  JWT_SECRET,
};
