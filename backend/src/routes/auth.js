const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('../services/store');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = store.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  store.logAudit(user.name, 'USER_LOGIN', `Logged in with role: ${user.role}`);

  const userSafe = { ...user };
  delete userSafe.passwordHash;

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: userSafe,
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const existing = store.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const validRoles = ['CANDIDATE', 'INSTITUTE', 'EMPLOYER', 'ADMIN'];
  const userRole = validRoles.includes(role) ? role : 'CANDIDATE';

  const newUser = store.createUser({
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: userRole,
    phone: phone || '',
  });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  store.logAudit(newUser.name, 'USER_REGISTER', `New user registered as ${userRole}`);

  const userSafe = { ...newUser };
  delete userSafe.passwordHash;

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    token,
    user: userSafe,
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const userSafe = { ...req.user };
  delete userSafe.passwordHash;
  res.json({ success: true, user: userSafe });
});

module.exports = router;
