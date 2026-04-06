const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const ctrl = require('../controllers/notificationController');

router.get('/', protect, ctrl.getNotifications);
router.get('/unread-count', protect, ctrl.getUnreadCount);
router.get('/vapid-public-key', protect, ctrl.getVapidPublicKey);
router.post('/subscribe', protect, ctrl.subscribe);
router.post('/unsubscribe', protect, ctrl.unsubscribe);
router.put('/read-all', protect, ctrl.markAllAsRead);
router.put('/:id/read', protect, ctrl.markAsRead);
router.delete('/:id', protect, ctrl.deleteNotification);

module.exports = router;
