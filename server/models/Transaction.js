const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ["payment", "refund", "forfeit"],
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpayRefundId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["initiated", "success", "failed"],
    required: true
  },
  reason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
