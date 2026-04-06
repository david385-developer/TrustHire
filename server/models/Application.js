const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coverLetter: {
    type: String,
    maxLength: 1000
  },
  feePaid: {
    type: Boolean,
    default: false
  },
  feeAmount: {
    type: Number,
    default: 0
  },
  paymentId: {
    type: String
  },
  orderId: {
    type: String
  },
  refundId: {
    type: String
  },
  isPriority: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: [
      "applied",
      "under_review",
      "interview_scheduled",
      "interview_completed",
      "interview_no_show",
      "shortlisted",
      "rejected",
      "hired",
      "joined",
      "withdrawn",
      "fee_refunded",
      "fee_forfeited"
    ],
    default: "applied"
  },
  interview: {
    scheduledAt: Date,
    mode: {
      type: String,
      enum: ["online", "in_person", "phone"]
    },
    link: String,
    notes: String,
    attended: {
      type: Boolean,
      default: null
    }
  },
  refundReason: {
    type: String,
    enum: [null, "rejected", "timeout", "joined", "forfeited", "withdrawn"],
    default: null
  },
  refundProcessedAt: {
    type: Date
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound unique index to prevent duplicate applications
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Optimized indexes for common queries
ApplicationSchema.index({ candidate: 1, appliedAt: -1 });
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ feePaid: 1, status: 1, appliedAt: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
