const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateOTP, getOTPExpiry, isOTPLocked, hasOTPExpired, getLockoutMinutesRemaining } = require('../utils/otp');
const { sendOTPEmail, sendResetOTPEmail } = require('../services/emailService');

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

    console.log('=== REGISTER OTP DEBUG ===');
    console.log('Generated OTP:', otp);
    console.log('OTP type:', typeof otp);

    user = await User.create({
      name,
      email: email.toLowerCase(),
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
        code: String(otp),
        expiresAt: getOTPExpiry(),
        attempts: 0,
        lockedUntil: null
      }
    });

    const checkUser = await User.findOne({ email: user.email });
    console.log('Saved OTP:', JSON.stringify(checkUser.otp));
    console.log('=== END REGISTER DEBUG ===');

    // Send OTP Email
    try {
      const emailSent = await sendOTPEmail(user.email, user.name, otp);
      if (emailSent) {
        console.log('EMAIL: OTP sent to', user.email);
      } else {
        console.error('EMAIL: OTP send returned false for', user.email);
      }
    } catch (err) {
      console.error('EMAIL: OTP send exception:', err.message);
    }

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
        code: String(otp),
        expiresAt: getOTPExpiry(),
        attempts: 0,
        lockedUntil: null
      };
      await user.save();

      // Send OTP Email
      try {
        const emailSent = await sendOTPEmail(user.email, user.name, otp);
        if (emailSent) {
          console.log('EMAIL: OTP sent to', user.email);
        } else {
          console.error('EMAIL: OTP send returned false for', user.email);
        }
      } catch (err) {
        console.error('EMAIL: OTP send exception:', err.message);
      }

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

    console.log('=== VERIFY REG OTP DEBUG ===');
    console.log('Received OTP:', otp);
    console.log('Received type:', typeof otp);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    console.log('Stored OTP:', JSON.stringify(user.otp));
    console.log('Stored code:', user.otp?.code);
    console.log('Stored type:', typeof user.otp?.code);

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

    // Compare OTP as strings
    const stored = String(user.otp.code).trim();
    const received = String(otp).trim();

    console.log('Compare:', `"${stored}"`, '===', `"${received}"`, stored === received);

    if (stored !== received) {
      console.log('MISMATCH === END DEBUG ===');
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
    console.log('REG OTP VERIFIED === END DEBUG ===');
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
      code: String(otp),
      expiresAt: getOTPExpiry(),
      attempts: 0,
      lockedUntil: null
    };
    await user.save();

    // Send OTP Email
    try {
      const emailSent = await sendOTPEmail(user.email, user.name, otp);
      if (emailSent) {
        console.log('EMAIL: OTP sent to', user.email);
      } else {
        console.error('EMAIL: OTP send returned false for', user.email);
      }
    } catch (err) {
      console.error('EMAIL: OTP send exception:', err.message);
    }

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

// ─── SETTINGS ENDPOINTS ────────────────────────────────────────────────────────
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');

exports.updateNotificationPrefs = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { notificationPreferences: req.body.notificationPreferences } },
      { returnDocument: 'after', runValidators: true }
    ).select('-password -otp');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePrivacySettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { privacySettings: req.body.privacySettings } },
      { returnDocument: 'after', runValidators: true }
    ).select('-password -otp');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { preferences: req.body.preferences } },
      { returnDocument: 'after', runValidators: true }
    ).select('-password -otp');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await Application.deleteMany({ candidateId: userId });
    await Notification.deleteMany({ userId });
    await PushSubscription.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const userProfile = await User.findById(req.user.id).select('-password -otp');
    const applications = await Application.find({ candidateId: req.user.id });
    const notifications = await Notification.find({ userId: req.user.id });
    
    const exportBundle = {
      profile: userProfile,
      applications,
      notifications,
      exportedAt: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=trusthire-my-data.json');
    res.send(JSON.stringify(exportBundle, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // DEBUG
    console.log('=== FORGOT PASSWORD DEBUG ===');
    console.log('Generated OTP:', otp);
    console.log('OTP type:', typeof otp);
    console.log('User before save:', JSON.stringify(user.otp));

    // Save OTP
    user.otp = {
      code: String(otp),
      expiresAt: getOTPExpiry(),
      attempts: 0,
      lockedUntil: null
    };
    user.resetVerified = false;
    await user.save();

    // DEBUG — verify what was saved
    const savedUser = await User.findOne({ email: email.toLowerCase() });
    console.log('Saved OTP:', JSON.stringify(savedUser.otp));
    console.log('Saved OTP code:', savedUser.otp?.code);
    console.log('Saved OTP type:', typeof savedUser.otp?.code);
    console.log('=== END DEBUG ===');

    // Send email
    try {
      await sendResetOTPEmail(user.email, user.name, otp);
      console.log('EMAIL: Reset OTP sent to', user.email);
    } catch (err) {
      console.error('EMAIL: Reset OTP failed:', err.message);
    }

    res.json({
      success: true,
      message: 'Reset code sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('=== VERIFY RESET OTP DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Email received:', email);
    console.log('OTP received:', otp);
    console.log('OTP received type:', typeof otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email);
    console.log('User.otp:', JSON.stringify(user.otp));
    console.log('User.otp.code:', user.otp?.code);
    console.log('User.otp.code type:', typeof user.otp?.code);
    console.log('User.resetVerified:', user.resetVerified);

    if (!user.otp || !user.otp.code) {
      console.log('NO OTP FOUND on user');
      return res.status(400).json({
        success: false,
        message: 'No code found. Request a new one.'
      });
    }

    // Compare as strings
    const stored = String(user.otp.code).trim();
    const received = String(otp).trim();

    console.log('STORED (trimmed):', `"${stored}"`);
    console.log('RECEIVED (trimmed):', `"${received}"`);
    console.log('STORED length:', stored.length);
    console.log('RECEIVED length:', received.length);
    console.log('MATCH:', stored === received);

    // Character by character comparison
    for (let i = 0; i < Math.max(stored.length, received.length); i++) {
      console.log(
        `Char ${i}: stored="${stored[i]}" ` +
        `(${stored[i]?.charCodeAt(0)}) ` +
        `received="${received[i]}" ` +
        `(${received[i]?.charCodeAt(0)})`
      );
    }

    if (stored !== received) {
      console.log('OTP MISMATCH');
      console.log('=== END DEBUG ===');
      return res.status(400).json({
        success: false,
        message: 'Invalid code'
      });
    }

    // Check expiry
    if (new Date() > new Date(user.otp.expiresAt)) {
      console.log('OTP EXPIRED');
      console.log('=== END DEBUG ===');
      return res.status(400).json({
        success: false,
        message: 'Code expired. Request a new one.'
      });
    }

    // OTP is valid
    user.resetVerified = true;
    await user.save();

    console.log('OTP VERIFIED SUCCESSFULLY');
    console.log('=== END DEBUG ===');

    res.json({
      success: true,
      message: 'Code verified'
    });
  } catch (error) {
    console.error('VERIFY ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.resetVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your code first'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.resetVerified = false;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

