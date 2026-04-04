const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter'],
    required: true
  },
  resume: {
    type: String // Cloudinary URL
  },
  skills: [{
    type: String
  }],
  experience: {
    type: Number // Years
  },
  bio: {
    type: String,
    maxLength: 1000
  },
  summary: {
    type: String,
    maxLength: 500
  },
  phone: String,
  location: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  qualification: String,
  stream: String,
  graduationStatus: String,
  passedOutYear: Number,
  // Recruiter fields
  company: {
    type: String
  },
  companyName: String,
  companyLogo: String,
  companyDescription: String,
  website: String,
  headquarters: String,
  companyWebsite: String,
  companyLocation: String,
  industry: String,
  companySize: String,
  foundedIn: String,
  companyEmail: String,
  companyPhone: String,
  designation: {
    type: String
  },
  
  // Settings & Preferences
  timezone: { type: String, default: "Asia/Kolkata (GMT+5:30)" },

  notificationPreferences: {
    applicationUpdates: { type: Boolean, default: true },
    interviewReminders: { type: Boolean, default: true },
    feeRefundAlerts: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true }
  },

  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'limited', 'private'],
      default: 'limited'
    },
    showOnlineStatus: { type: Boolean, default: true },
    showSalaryExpectation: { type: Boolean, default: true }
  },

  preferences: {
    language: { type: String, default: "English (India)" },
    region: { type: String, default: "India" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    currency: { type: String, default: "INR" }
  },

  profileCompleted: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    lockedUntil: Date
  },
  resetVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
