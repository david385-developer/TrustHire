const Application = require('../models/Application');
const Job = require('../models/Job');
const Transaction = require('../models/Transaction');
const { processRefund, processForfeit } = require('../services/refundService');
const emailService = require('../services/emailService');
const razorpay = require('../config/razorpay');
const notifications = require('../services/notificationService');

const VALID_STATUS_UPDATES = ['under_review', 'shortlisted', 'rejected', 'hired', 'joined'];

const normalizeInterviewMode = (mode) => {
  if (mode === 'in-person') return 'in_person';
  return mode;
};

exports.applyToJob = async (req, res) => {
  try {
    const { coverLetter, feeAmount } = req.body;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (!job.isActive) return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    if (job.postedBy.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job posting' });
    }

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    const requestedFee = Number(feeAmount) || 0;
    if (requestedFee < 0) {
      return res.status(400).json({ success: false, message: 'Fee amount cannot be negative' });
    }
    if (requestedFee > 0 && requestedFee !== job.challengeFeeAmount) {
      return res.status(400).json({ success: false, message: 'Invalid challenge fee amount for this job' });
    }
    if (requestedFee > 0 && !razorpay) {
      return res.status(503).json({ success: false, message: 'Challenge fee payments are temporarily unavailable' });
    }

    const application = new Application({
      job: jobId,
      candidate: req.user.id,
      coverLetter: String(coverLetter || '').trim(),
      feeAmount: requestedFee
    });

    if (requestedFee > 0) {
      // Create Razorpay Order
      const options = {
        amount: Math.round(requestedFee * 100),
        currency: 'INR',
        receipt: `receipt_app_${application._id}`
      };
      
      const order = await razorpay.orders.create(options);
      application.orderId = order.id;
      
      await application.save();

      return res.status(201).json({ 
        success: true, 
        data: application, 
        orderId: order.id, 
        keyId: process.env.RAZORPAY_KEY_ID 
      });
    }

    // Free application
    await application.save();
    
    // Notifications
    notifications.notifyApplicationSubmitted(req.user.id, job.title, job.company, { jobId: job._id, applicationId: application._id }).catch(console.error);
    notifications.notifyNewApplication(job.postedBy, req.user.name || 'Candidate', job.title, { jobId: job._id, applicationId: application._id }).catch(console.error);

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location type status postedBy')
      .populate('candidate', 'name email dateOfBirth qualification stream graduationStatus passedOutYear skills experience summary bio resume company phone location');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const isCandidateOwner = application.candidate?._id?.toString() === req.user.id;
    const isRecruiterOwner = application.job?.postedBy?.toString?.() === req.user.id;
    if (!isCandidateOwner && !isRecruiterOwner && req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title company location type salary challengeFeeAmount challengeFeeDays isActive')
      .sort('-appliedAt');
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email dateOfBirth qualification stream graduationStatus passedOutYear skills experience summary bio resume phone location')
      .sort({ feePaid: -1, appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRecruiterApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).select('_id');
    const jobIds = jobs.map(j => j._id);
    
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title location company')
      .populate('candidate', 'name email dateOfBirth qualification stream graduationStatus passedOutYear skills experience summary bio resume phone')
      .sort('-appliedAt');
      
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTalentPool = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).select('_id');
    const jobIds = jobs.map(j => j._id);
    
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('candidate', 'name email skills location experience qualification stream summary bio resume')
      .populate('job', 'title')
      .select('candidate status appliedAt job');
      
    const candidatesMap = new Map();

    applications.forEach((application) => {
      const candidateId = application.candidate?._id?.toString();
      if (!candidateId) return;

      const previous = candidatesMap.get(candidateId);
      const baseCandidate = application.candidate.toObject ? application.candidate.toObject() : application.candidate;
      const currentAppliedAt = new Date(application.appliedAt || 0).getTime();
      const previousAppliedAt = previous ? new Date(previous.lastAppliedAt || 0).getTime() : 0;

      if (!previous || currentAppliedAt >= previousAppliedAt) {
        candidatesMap.set(candidateId, {
          ...baseCandidate,
          latestApplicationId: application._id,
          latestJobTitle: application.job?.title || 'Untitled role',
          latestStatus: application.status,
          lastAppliedAt: application.appliedAt,
          applicationCount: (previous?.applicationCount || 0) + 1
        });
      } else {
        previous.applicationCount += 1;
      }
    });

    const candidates = Array.from(candidatesMap.values()).sort(
      (a, b) => new Date(b.lastAppliedAt).getTime() - new Date(a.lastAppliedAt).getTime()
    );
      
    res.json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUS_UPDATES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (application.status === status) {
      return res.json({ success: true, data: application });
    }

    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // Side effects
    if (status === 'rejected' && oldStatus !== 'rejected') {
      if (application.feePaid && !application.refundId && application.status !== 'fee_refunded') {
        const result = await processRefund(application, 'rejected');
        if (result.success) {
          // Status already updated in processRefund
        }
      }
      emailService.sendApplicationRejected(application.candidate.email, application.job.title, application.feePaid);
      notifications.notifyRejected(application.candidate._id, application.job.title, application.job.company, application.feePaid, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
    } 
    else if (status === 'joined' && oldStatus !== 'joined') {
      if (application.feePaid && !application.refundId && application.status !== 'fee_refunded') {
        const result = await processRefund(application, 'joined');
        if (result.success) {
          // Status already updated in processRefund
        }
      }
      emailService.sendApplicationHired(application.candidate.email, application.job.title, application.feePaid);
      notifications.notifyStatusUpdated(application.candidate._id, application.job.title, 'Joined', application.job.company, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
    }
    else if (status === 'hired' && oldStatus !== 'hired') {
      emailService.sendApplicationHired(application.candidate.email, application.job.title, false);
      notifications.notifyHired(application.candidate._id, application.job.title, application.job.company, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
    }
    else if (status === 'shortlisted' && oldStatus !== 'shortlisted') {
      notifications.notifyStatusUpdated(application.candidate._id, application.job.title, 'Shortlisted', application.job.company, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
    } else if (status === 'under_review' && oldStatus !== 'under_review') {
      notifications.notifyStatusUpdated(application.candidate._id, application.job.title, 'Under Review', application.job.company, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const { scheduledAt, mode, link, notes } = req.body;
    const normalizedMode = normalizeInterviewMode(mode);
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: 'Interview date and time are required' });
    }
    if (!['online', 'in_person', 'phone'].includes(normalizedMode)) {
      return res.status(400).json({ success: false, message: 'Please select a valid interview mode' });
    }
    if (normalizedMode === 'online' && !String(link || '').trim()) {
      return res.status(400).json({ success: false, message: 'Meeting link is required for online interviews' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = 'interview_scheduled';
    application.interview = { scheduledAt, mode: normalizedMode, link, notes };
    await application.save();

    emailService.sendInterviewScheduled(application.candidate.email, application.job.title, application.interview);
    notifications.notifyInterviewScheduled(
      application.candidate._id,
      application.job.title,
      scheduledAt,
      mode,
      application.job.company,
      { jobId: application.job._id, applicationId: application._id, meetingLink: link, notes }
    ).catch(console.error);

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { attended } = req.body; // boolean
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!application.interview || !application.interview.scheduledAt) {
      return res.status(400).json({ success: false, message: 'Interview has not been scheduled for this application' });
    }

    application.interview.attended = attended;
    
    if (attended === false) {
      // No Show! Forfeit.
      await processForfeit(application);
      application.status = 'interview_no_show';
      await application.save();
      emailService.sendFeeForfeited(application.candidate.email, application.job.title);
      notifications.notifyFeeForfeited(application.candidate._id, application.feeAmount, application.job.title, application.job.company, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
      notifications.notifyInterviewNoShow(application.job.postedBy, application.candidate.name || 'Candidate', application.job.title, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
    } else {
      application.status = 'interview_completed';
      await application.save();
      notifications.notifyStatusUpdated(application.candidate._id, application.job.title, 'Interview Completed', application.job.company, { jobId: application.job._id, applicationId: application._id }).catch(console.error);
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
