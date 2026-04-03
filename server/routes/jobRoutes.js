const express = require('express');
const router = express.Router();
const { getJobs, getJob, createJob, updateJob, deleteJob, getMyPosts } = require('../controllers/jobController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.get('/', getJobs);
router.get('/my-posts', auth, roleCheck(['recruiter']), getMyPosts);
router.get('/:id', getJob);

router.post('/', auth, roleCheck(['recruiter']), createJob);
router.put('/:id', auth, roleCheck(['recruiter']), updateJob);
router.delete('/:id', auth, roleCheck(['recruiter']), deleteJob);

module.exports = router;
