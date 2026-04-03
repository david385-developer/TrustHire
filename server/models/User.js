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
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
