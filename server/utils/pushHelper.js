const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Set VAPID details
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'support@trusthire.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send a push notification to all active subscriptions of a user
 * @param {string} userId - ID of the recipient user
 * @param {object} payload - Notification payload { title, body, icon, data }
 */
const sendPushNotification = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.find({ user: userId, isActive: true });
    
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const notificationPromises = subscriptions.map(sub => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keys.auth,
          p256dh: sub.keys.p256dh
        }
      };

      return webpush.sendNotification(pushConfig, JSON.stringify(payload))
        .catch(async (err) => {
          // If subscription is expired or revoked (404, 410), mark as inactive
          if (err.statusCode === 404 || err.statusCode === 410) {
            await PushSubscription.findByIdAndUpdate(sub._id, { isActive: false });
          } else {
            console.error('Error sending push notification to subscription:', sub._id, err.message);
          }
        });
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error in sendPushNotification utility:', error);
  }
};

module.exports = { sendPushNotification };
