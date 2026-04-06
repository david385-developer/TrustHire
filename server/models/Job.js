const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 5000
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["full-time", "part-time", "contract", "remote"],
    required: true
  },
  category: {
    type: String,
    enum: ["Technology", "Marketing", "Finance", "Design", "Sales", "HR", "Operations", "Healthcare", "Education", "Legal", "Other"],
    default: "Technology",
    required: true
  },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: "INR" }
  },
  skills: [{
    type: String
  }],
  experienceRequired: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 20 }
  },
  challengeFeeAmount: {
    type: Number,
    default: 0,
    min: 0,
    max: 5000
  },
  challengeFeeDays: {
    type: Number,
    default: 30,
    min: 7,
    max: 90
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Optimized indexes for search and filtering
JobSchema.index({ postedBy: 1, createdAt: -1 });
JobSchema.index({ isActive: 1, createdAt: -1 });
JobSchema.index({ skills: 1 });
JobSchema.index({ location: 1 });

module.exports = mongoose.model('Job', JobSchema);
