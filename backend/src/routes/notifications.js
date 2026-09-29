const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { requireAuth } = require('../middleware/auth');

// All notification routes require authentication
router.use(requireAuth);

// ── GET /api/notifications ────────────────────────────────────────────────────
// Returns all notifications for the authenticated user, plus unread count
router.get('/', (req, res) => {
  const notifications = store.getNotifications(req.user.id);
  const unreadCount = store.getUnreadCount(req.user.id);
  res.json({
    success: true,
    unreadCount,
    count: notifications.length,
    notifications,
  });
});

// ── GET /api/notifications/unread-count ──────────────────────────────────────
// Lightweight poll endpoint — returns only the unread count
router.get('/unread-count', (req, res) => {
  const unreadCount = store.getUnreadCount(req.user.id);
  res.json({ success: true, unreadCount });
});

// ── PATCH /api/notifications/mark-all-read ───────────────────────────────────
// Marks every unread notification as read for the authenticated user
router.patch('/mark-all-read', (req, res) => {
  store.markAllNotificationsRead(req.user.id);
  const notifications = store.getNotifications(req.user.id);
  res.json({
    success: true,
    message: 'All notifications marked as read.',
    unreadCount: 0,
    notifications,
  });
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
// Marks a single notification as read
router.patch('/:id/read', (req, res) => {
  const notif = store.markNotificationRead(req.params.id, req.user.id);
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }
  res.json({
    success: true,
    message: 'Notification marked as read.',
    notification: notif,
    unreadCount: store.getUnreadCount(req.user.id),
  });
});

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
// Deletes a single notification
router.delete('/:id', (req, res) => {
  const deleted = store.deleteNotification(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }
  res.json({
    success: true,
    message: 'Notification deleted.',
    unreadCount: store.getUnreadCount(req.user.id),
  });
});

// ── DELETE /api/notifications ─────────────────────────────────────────────────
// Clears ALL notifications for the authenticated user
router.delete('/', (req, res) => {
  const all = store.getNotifications(req.user.id);
  all.forEach(n => store.deleteNotification(n.id, req.user.id));
  res.json({
    success: true,
    message: 'All notifications cleared.',
    unreadCount: 0,
    notifications: [],
  });
});

module.exports = router;
