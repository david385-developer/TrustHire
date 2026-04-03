const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    type: {
      type: String,
      enum: [
        'application_submitted',
        'application_received',
        'priority_application',
        'status_updated',
        'interview_scheduled',
        'interview_reminder',
        'interview_no_show',
        'fee_refunded',
        'fee_forfeited',
        'hired',
        'rejected',
        'application_withdrawn',
        'job_posted',
        'profile_incomplete'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    },
    // Used for TTL cleanup; we keep separate to avoid deleting all docs if user changes schema
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }
  },
  { timestamps: true }
);

// Compound index for fast unread count and sorted listing
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);

