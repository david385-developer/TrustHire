const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateOTP, getOTPExpiry, isOTPLocked, hasOTPExpired, getLockoutMinutesRemaining } = require('../utils/otp');
const { sendOTPEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const ensureDatabaseReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      errorCode: 'DB_UNAVAILABLE',
      message: 'Database is not connected. Please try again in a moment.'
    });
    return false;
  }

  return true;
};

// ─── REGISTER ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { 
      name, email, password, role, gender,
      company, dateOfBirth, qualification, stream, graduationStatus, passedOutYear 
    } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      gender,
      company,
      dateOfBirth,
      qualification,
      stream,
      graduationStatus,
      passedOutYear,
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: getOTPExpiry(),
        attempts: 0,
        lockedUntil: null
      }
    });

    // Fire-and-forget: don't block response if email fails
    sendOTPEmail(user.email, user.name, otp).catch((err) =>
      console.error('[register] OTP email failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      requiresVerification: true,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errorCode: 'MISSING_FIELDS',
        message: 'Please enter both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'No account found with this email. Please register first.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errorCode: 'INVALID_PASSWORD',
        message: 'Incorrect password. Please try again.'
      });
    }

    // ── Email not yet verified → send fresh OTP and redirect ──
    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = {
        code: otp,
        expiresAt: getOTPExpiry(),
        attempts: 0,
        lockedUntil: null
      };
      await user.save();

      sendOTPEmail(user.email, user.name, otp).catch((err) =>
        console.error('[login] OTP email failed:', err)
      );

      return res.status(403).json({
        success: false,
        errorCode: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email. A new code has been sent.',
        requiresVerification: true,
        email: user.email,
        name: user.name
      });
    }

    // ── Verified user → return JWT ──
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// ─── VERIFY OTP ────────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ success: false, message: 'No OTP pending. Request a new one.' });
    }

    // Check lockout
    if (isOTPLocked(user.otp)) {
      const mins = getLockoutMinutesRemaining(user.otp);
      return res.status(423).json({
        success: false,
        errorCode: 'OTP_LOCKED',
        message: `Too many attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
        lockedUntil: user.otp.lockedUntil
      });
    }

    // Check expiry
    if (hasOTPExpired(user.otp)) {
      return res.status(410).json({
        success: false,
        errorCode: 'OTP_EXPIRED',
        message: 'OTP expired. Please request a new one.'
      });
    }

    // Compare OTP
    if (otp !== user.otp.code) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;

      if (user.otp.attempts >= 5) {
        user.otp.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        return res.status(423).json({
          success: false,
          errorCode: 'OTP_LOCKED',
          message: 'Too many failed attempts. Locked for 15 minutes.',
          lockedUntil: user.otp.lockedUntil
        });
      }

      await user.save();
      const remaining = 5 - user.otp.attempts;
      return res.status(401).json({
        success: false,
        errorCode: 'INVALID_OTP',
        message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        attemptsRemaining: remaining
      });
    }

    // ── OTP is correct ──
    user.isVerified = true;
    user.otp = undefined; // Clear OTP data
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESEND OTP ────────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    if (isOTPLocked(user.otp)) {
      const mins = getLockoutMinutesRemaining(user.otp);
      return res.status(423).json({
        success: false,
        errorCode: 'OTP_LOCKED',
        message: `Too many attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`,
        lockedUntil: user.otp.lockedUntil
      });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: getOTPExpiry(),
      attempts: 0,
      lockedUntil: null
    };
    await user.save();

    sendOTPEmail(user.email, user.name, otp).catch((err) =>
      console.error('[resend-otp] OTP email failed:', err)
    );

    res.json({ success: true, message: 'New OTP sent to your email.' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ME ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const user = await User.findById(req.user.id).select('-password -otp');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE PROFILE ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const fieldsToUpdate = { ...req.body };
    delete fieldsToUpdate.password;
    delete fieldsToUpdate.role;
    delete fieldsToUpdate.email;
    delete fieldsToUpdate.isVerified;
    delete fieldsToUpdate.otp;

    if (fieldsToUpdate.skills) {
      if (typeof fieldsToUpdate.skills === 'string') {
        try {
          const parsedSkills = JSON.parse(fieldsToUpdate.skills);
          fieldsToUpdate.skills = Array.isArray(parsedSkills)
            ? parsedSkills.map((s) => String(s).trim()).filter(Boolean)
            : [];
        } catch {
          fieldsToUpdate.skills = fieldsToUpdate.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }

    if (fieldsToUpdate.experience !== undefined) {
      fieldsToUpdate.experience = Number(fieldsToUpdate.experience) || 0;
    }

    if (fieldsToUpdate.passedOutYear !== undefined && fieldsToUpdate.passedOutYear !== '') {
      fieldsToUpdate.passedOutYear = Number(fieldsToUpdate.passedOutYear);
    }

    if (fieldsToUpdate.dateOfBirth) {
      const dob = new Date(fieldsToUpdate.dateOfBirth);
      if (Number.isNaN(dob.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date of birth.' });
      }
      const minAdultDate = new Date();
      minAdultDate.setFullYear(minAdultDate.getFullYear() - 18);
      if (dob > minAdultDate) {
        return res.status(400).json({ success: false, message: 'You must be at least 18 years old.' });
      }
      fieldsToUpdate.dateOfBirth = dob;
    }

    if (fieldsToUpdate.summary && String(fieldsToUpdate.summary).length > 500) {
      return res.status(400).json({ success: false, message: 'Summary cannot exceed 500 characters.' });
    }

    if (fieldsToUpdate.bio && String(fieldsToUpdate.bio).length > 1000) {
      return res.status(400).json({ success: false, message: 'Bio cannot exceed 1000 characters.' });
    }

    if (req.file) {
      fieldsToUpdate.resume = '/uploads/' + req.file.filename;
    }

    const existingUser = await User.findById(req.user.id).select('-password -otp');
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const mergedProfile = {
      ...existingUser.toObject(),
      ...fieldsToUpdate
    };

    const profileCompleted = existingUser.role === 'recruiter'
      ? Boolean(mergedProfile.name && mergedProfile.companyName && mergedProfile.companyDescription && mergedProfile.companyLocation)
      : Boolean(
          mergedProfile.name &&
          mergedProfile.phone &&
          mergedProfile.dateOfBirth &&
          mergedProfile.qualification &&
          mergedProfile.skills?.length
        );

    fieldsToUpdate.profileCompleted = profileCompleted;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { returnDocument: 'after', runValidators: true }
    ).select('-password -otp');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
