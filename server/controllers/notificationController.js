const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const filter = { recipient: req.user._id };
    if (unreadOnly) filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: await Notification.countDocuments(filter)
      }
    });
  } catch (error) {
    console.error('GET notifications error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error('GET unread count error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { returnDocument: 'after' }
    );
    if (!notification) {
      return res.status(404).json({
        success: false, message: 'Notification not found'
      });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVapidPublicKey = async (req, res) => {
  try {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.subscribeToPush = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false, message: 'Invalid subscription'
      });
    }

    const existing = await PushSubscription.findOne({
      user: req.user._id,
      endpoint: subscription.endpoint
    });

    if (existing) {
      existing.isActive = true;
      await existing.save();
    } else {
      await PushSubscription.create({
        user: req.user._id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        isActive: true
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unsubscribeFromPush = async (req, res) => {
  try {
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id, endpoint: req.body.endpoint },
      { isActive: false }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
