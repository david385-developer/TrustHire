const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/notificationController');

router.get('/', auth, ctrl.getNotifications);
router.get('/unread-count', auth, ctrl.getUnreadCount);
router.put('/read-all', auth, ctrl.markAllAsRead);
router.put('/:id/read', auth, ctrl.markAsRead);
router.delete('/:id', auth, ctrl.deleteNotification);

module.exports = router;
