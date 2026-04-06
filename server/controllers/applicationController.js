const Application = require('../models/Application');
const Job = require('../models/Job');
const Transaction = require('../models/Transaction');
const { processRefund, processForfeit } = require('../services/refundService');
const razorpay = require('../config/razorpay');

const {
  notifyApplicationSubmitted,
  notifyNewApplication,
  notifyPriorityApplication,
  notifyInterviewScheduled,
  notifyStatusUpdated,
  notifyRejected,
  notifyHired,
  notifyFeeRefunded,
  notifyFeeForfeited
} = require('../services/notificationService');

const {
  sendApplicationReceived,
  sendInterviewScheduledEmail,
  sendShortlistedEmail,
  sendRejectedEmail,
  sendRefundEmail,
  sendHiredEmail,
  sendForfeitEmail
} = require('../services/emailService');

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
      feeAmount: job.challengeFeeAmount // Set from job directly
    });

    await application.save();

    const candidate = req.user;

    // Notifications and Emails
    try {
      await notifyApplicationSubmitted(candidate.id, job.title, job.company);
    } catch (err) {
      console.error('Notify submit failed:', err.message);
    }

    try {
      await sendApplicationReceived(candidate.email, candidate.name, job.title, job.company);
    } catch (err) {
      console.error('Email submit failed:', err.message);
    }

    try {
      await notifyNewApplication(job.postedBy, candidate.name, job.title);
    } catch (err) {
      console.error('Notify new app failed:', err.message);
    }

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
    const { status: newStatus } = req.body;
    if (!VALID_STATUS_UPDATES.includes(newStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (application.status === newStatus) {
      return res.json({ success: true, data: application });
    }

    const oldStatus = application.status;
    application.status = newStatus;
    await application.save();

    const candidate = application.candidate;
    const job = application.job;

    if (newStatus === 'shortlisted') {
      try {
        await notifyStatusUpdated(application.candidate, job.title, 'Shortlisted', job.company);
      } catch (err) {
        console.error('Notify failed:', err.message);
      }
      try {
        await sendShortlistedEmail(candidate.email, candidate.name, job.title, job.company);
      } catch (err) {
        console.error('Email failed:', err.message);
      }
    }

    if (newStatus === 'rejected') {
      const feeRefunded = application.feePaid;
      
      // Process actual refund if applicable
      if (feeRefunded && !application.refundId) {
        await processRefund(application, 'rejected');
      }

      try {
        await notifyRejected(application.candidate, job.title, job.company, feeRefunded);
      } catch (err) {
        console.error('Notify failed:', err.message);
      }
      try {
        await sendRejectedEmail(
          candidate.email, candidate.name, job.title,
          job.company, application.feeAmount,
          application.refundId
        );
      } catch (err) {
        console.error('Email failed:', err.message);
      }
    }

    if (newStatus === 'hired') {
      // Process actual refund if hired
      if (application.feePaid && !application.refundId) {
        await processRefund(application, 'hired');
      }

      try {
        await notifyHired(application.candidate, job.title, job.company);
      } catch (err) {
        console.error('Notify failed:', err.message);
      }
      try {
        await sendHiredEmail(candidate.email, candidate.name, job.title, job.company);
      } catch (err) {
        console.error('Email failed:', err.message);
      }
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const { scheduledAt: interviewDate, mode, link, notes } = req.body;
    const normalizedMode = normalizeInterviewMode(mode);
    
    if (!interviewDate) {
      return res.status(400).json({ success: false, message: 'Interview date and time are required' });
    }
    
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = 'interview_scheduled';
    application.interview = { scheduledAt: interviewDate, mode: normalizedMode, link, notes };
    await application.save();

    const candidate = application.candidate;
    const job = application.job;

    try {
      await notifyInterviewScheduled(application.candidate, job.title, interviewDate, mode, job.company);
    } catch (err) {
      console.error('Notify failed:', err.message);
    }
    try {
      await sendInterviewScheduledEmail(
        candidate.email, candidate.name, job.title,
        interviewDate, mode, application.interview.link, job.company
      );
    } catch (err) {
      console.error('Email failed:', err.message);
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { attended } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.interview.attended = attended;
    
    const candidate = application.candidate;
    const job = application.job;

    if (attended === false) {
      await processForfeit(application);
      application.status = 'interview_no_show';
      await application.save();

      try {
        await notifyFeeForfeited(application.candidate, application.feeAmount, job.title, job.company);
      } catch (err) {
        console.error('Notify failed:', err.message);
      }
      try {
        await sendForfeitEmail(
          candidate.email, candidate.name,
          application.feeAmount, job.title, job.company
        );
      } catch (err) {
        console.error('Email failed:', err.message);
      }
    } else {
      application.status = 'interview_completed';
      await application.save();
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this application' });
    }

    if (['withdrawn', 'rejected', 'hired', 'joined'].includes(application.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot withdraw. Application is already ${application.status.replace('_', ' ')}.` 
      });
    }

    // Update status - explicitly NO refund processed as per user requirement
    application.status = 'withdrawn';
    await application.save();

    res.json({ 
      success: true, 
      message: 'Application withdrawn. Note: Application fees are non-refundable upon withdrawal.',
      data: application 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
