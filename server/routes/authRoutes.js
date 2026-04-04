const express = require('express');
const router = express.Router();
const { 
  register, login, getMe, updateProfile, verifyOTP, resendOTP,
  forgotPassword, resetPassword,
  updateNotificationPrefs, updatePrivacySettings, updatePreferences, 
  changePassword, deleteAccount, exportData 
} = require('../controllers/authController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getMe);
router.put('/profile', auth, upload.single('resume'), updateProfile);

// Settings & Account
router.put('/notification-preferences', auth, updateNotificationPrefs);
router.put('/privacy-settings', auth, updatePrivacySettings);
router.put('/preferences', auth, updatePreferences);
router.put('/change-password', auth, changePassword);
router.delete('/account', auth, deleteAccount);
router.get('/export-data', auth, exportData);

module.exports = router;
