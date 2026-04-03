const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, verifyOTP, resendOTP } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', auth, getMe);
router.put('/profile', auth, upload.single('resume'), updateProfile);

module.exports = router;
