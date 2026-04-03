const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToPush,
  unsubscribeFromPush,
  getVapidPublicKey
} = require('../controllers/notificationController');

// All notification routes should be protected except getVapidPublicKey which is needed for push registration
router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/:id/read', auth, markAsRead);
router.put('/read-all', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);
router.post('/subscribe', auth, subscribeToPush);
router.post('/unsubscribe', auth, unsubscribeFromPush);
router.get('/vapid-public-key', getVapidPublicKey);

module.exports = router;
