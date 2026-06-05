const mongoose = require('mongoose');

const emailQueueSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  html: {
    type: String,
    required: true
  },
  text: {
    type: String
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
    index: true
  },
  errorMessage: {
    type: String
  },
  lastAttemptAt: {
    type: Date
  },
  nextAttemptAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

emailQueueSchema.index({ status: 1, nextAttemptAt: 1 });

module.exports = mongoose.model('EmailQueue', emailQueueSchema);
