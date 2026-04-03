const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  subscribeToPush,
  unsubscribeFromPush,
  getVapidPublicKey
} = require('../controllers/notificationController');

// In-app notifications
router.get('/', auth, listNotifications);
router.get('/unread-count', auth, unreadCount);
router.put('/:id/read', auth, markRead);
router.put('/read-all', auth, markAllRead);
router.delete('/:id', auth, deleteNotification);

// Push notifications
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', auth, subscribeToPush);
router.post('/unsubscribe', auth, unsubscribeFromPush);

module.exports = router;
