const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const { getRecruiterAnalytics } = require('../controllers/recruiterController');

router.get('/analytics', auth, roleCheck(['recruiter']), getRecruiterAnalytics);

module.exports = router;
