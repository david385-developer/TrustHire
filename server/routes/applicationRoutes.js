const express = require('express');
const router = express.Router();
const { 
  applyToJob, 
  getMyApplications, 
  getJobApplications, 
  updateApplicationStatus, 
  updateInterview, 
  updateAttendance, 
  getApplicationById,
  getAllRecruiterApplications,
  getTalentPool
} = require('../controllers/applicationController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.post('/:jobId', auth, roleCheck(['candidate']), applyToJob);
router.get('/my', auth, roleCheck(['candidate']), getMyApplications);
router.get('/recruiter/all', auth, roleCheck(['recruiter']), getAllRecruiterApplications);
router.get('/recruiter/candidates', auth, roleCheck(['recruiter']), getTalentPool);
router.get('/job/:jobId', auth, roleCheck(['recruiter']), getJobApplications);
router.get('/:id', auth, getApplicationById);

router.put('/:id/status', auth, roleCheck(['recruiter']), updateApplicationStatus);
router.put('/:id/interview', auth, roleCheck(['recruiter']), updateInterview);
router.put('/:id/attendance', auth, roleCheck(['recruiter']), updateAttendance);

module.exports = router;
