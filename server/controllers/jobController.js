const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const Job = require('../models/Job');

const normalizeJobPayload = (payload = {}) => {
  const title = String(payload.title || '').trim();
  const description = String(payload.description || '').trim();
  const company = String(payload.company || '').trim();
  const location = String(payload.location || '').trim();
  const type = String(payload.type || '').trim();
  const salaryMin = Number(payload?.salary?.min);
  const salaryMax = Number(payload?.salary?.max);
  const experienceMin = Number(payload?.experienceRequired?.min ?? 0);
  const experienceMax = Number(payload?.experienceRequired?.max ?? 0);
  const challengeFeeAmount = Number(payload.challengeFeeAmount || 0);
  const challengeFeeDays = Number(payload.challengeFeeDays || 30);
  const skills = Array.isArray(payload.skills)
    ? payload.skills.map((skill) => String(skill).trim()).filter(Boolean)
    : [];

  return {
    title,
    description,
    company,
    location,
    type,
    salary: {
      min: Number.isFinite(salaryMin) ? salaryMin : NaN,
      max: Number.isFinite(salaryMax) ? salaryMax : NaN,
      currency: payload?.salary?.currency || 'INR'
    },
    experienceRequired: {
      min: Number.isFinite(experienceMin) ? experienceMin : NaN,
      max: Number.isFinite(experienceMax) ? experienceMax : NaN
    },
    challengeFeeAmount: Number.isFinite(challengeFeeAmount) ? challengeFeeAmount : NaN,
    challengeFeeDays: Number.isFinite(challengeFeeDays) ? challengeFeeDays : NaN,
    skills
  };
};

const validateJobPayload = (payload) => {
  if (!payload.title) return 'Job title is required';
  if (!payload.description || payload.description.length < 100) return 'Job description must be at least 100 characters';
  if (!payload.company) return 'Company name is required';
  if (!payload.location) return 'Location is required';
  if (!['full-time', 'part-time', 'contract', 'remote'].includes(payload.type)) return 'Please select a valid job type';
  if (!Number.isFinite(payload.salary.min) || payload.salary.min < 0) return 'Minimum salary must be a valid positive number';
  if (!Number.isFinite(payload.salary.max) || payload.salary.max < payload.salary.min) return 'Maximum salary must be greater than or equal to minimum salary';
  if (!Number.isFinite(payload.experienceRequired.min) || payload.experienceRequired.min < 0) return 'Minimum experience must be a valid positive number';
  if (!Number.isFinite(payload.experienceRequired.max) || payload.experienceRequired.max < payload.experienceRequired.min) {
    return 'Maximum experience must be greater than or equal to minimum experience';
  }
  if (!payload.skills.length) return 'Please add at least one required skill';
  if (!Number.isFinite(payload.challengeFeeAmount) || payload.challengeFeeAmount < 0 || payload.challengeFeeAmount > 5000) {
    return 'Challenge fee must be between 0 and 5000';
  }
  if (!Number.isFinite(payload.challengeFeeDays) || payload.challengeFeeDays < 7 || payload.challengeFeeDays > 90) {
    return 'Challenge fee review window must be between 7 and 90 days';
  }

  return null;
};

const getCandidateIdFromRequest = async (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { search, location, type, minSalary, maxSalary, skills, hasFee, sort, page = 1, limit = 12 } = req.query;

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
    if (skills) query.skills = { $in: skills.split(',') };
    if (hasFee === 'yes') query.challengeFeeAmount = { $gt: 0 };
    if (hasFee === 'no') query.challengeFeeAmount = 0;

    let sortObj = { createdAt: -1 };
    if (sort) {
      if (sort === 'createdAt') sortObj = { createdAt: 1 };
      else if (sort === '-createdAt') sortObj = { createdAt: -1 };
      else if (sort === 'salary.min') sortObj = { 'salary.min': 1 };
      else if (sort === '-salary.max') sortObj = { 'salary.max': -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('postedBy', 'name company');

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { returnDocument: 'after' })
      .populate('postedBy', 'name company companyName');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const candidateId = await getCandidateIdFromRequest(req);
    let hasApplied = false;

    if (candidateId) {
      hasApplied = await Application.exists({ job: job._id, candidate: candidateId });
    }

    res.json({ success: true, data: job, hasApplied: Boolean(hasApplied) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const jobData = normalizeJobPayload(req.body);
    const validationError = validateJobPayload(jobData);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    jobData.postedBy = req.user.id;
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const jobData = normalizeJobPayload(req.body);
    const validationError = validateJobPayload(jobData);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    job = await Job.findByIdAndUpdate(req.params.id, jobData, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    job.isActive = false;
    await job.save();
    res.json({ success: true, message: 'Job deleted/deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort('-createdAt').lean();
    const jobIds = jobs.map((job) => job._id);

    const applicationStats = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$job',
          applicationCount: { $sum: 1 },
          priorityCount: { $sum: { $cond: ['$isPriority', 1, 0] } },
          shortlistedCount: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
          interviewCount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['interview_scheduled', 'interview_completed', 'interview_no_show']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const statsByJob = applicationStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = stat;
      return acc;
    }, {});

    const enrichedJobs = jobs.map((job) => {
      const stats = statsByJob[job._id.toString()] || {};
      return {
        ...job,
        applicationCount: stats.applicationCount || 0,
        priorityCount: stats.priorityCount || 0,
        shortlistedCount: stats.shortlistedCount || 0,
        interviewCount: stats.interviewCount || 0
      };
    });

    res.json({ success: true, data: enrichedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
