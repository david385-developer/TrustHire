const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');
const webpush = require('../config/webpush');
const PushSubscription = require('../models/PushSubscription');

const sendPush = async (userId, title, body, url) => {
  try {
    const subscriptions = await PushSubscription.find({
      user: userId,
      isActive: true
    });

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title,
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: url || '/dashboard' }
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired
          sub.isActive = false;
          await sub.save();
        }
      }
    }
  } catch (err) {
    console.error('[Push Send Error]', err);
  }
};

async function createNotification(payload, emailOptions) {
  const notification = await Notification.create(payload);
  
  // Send push notification (fire and forget)
  sendPush(payload.recipient, payload.title, payload.message, payload.link).catch(err => 
    console.error('[Push Service Error]', err)
  );

  if (emailOptions?.send === true && emailOptions?.to && emailOptions?.handler) {
    try {
      await emailOptions.handler(...emailOptions.args);
    } catch (e) {
      console.error('[Notification Email Error]', e.message || e);
    }
  }
  return notification;
}

// -------------------- Candidate Notifications --------------------
exports.notifyApplicationSubmitted = async (candidateId, jobTitle, companyName, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  return createNotification(
    {
      recipient: candidateId,
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for ${jobTitle} at ${companyName} has been submitted successfully.`,
      link: '/dashboard/applications',
      relatedJob: related.jobId,
      relatedApplication: related.applicationId
    },
    {
      send: true,
      to: candidate?.email,
      handler: emailService.sendApplicationReceived,
      args: [candidate?.email, jobTitle]
    }
  );
};

exports.notifyStatusUpdated = async (candidateId, jobTitle, newStatus, companyName, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  return createNotification(
    {
      recipient: candidateId,
      type: 'status_updated',
      title: 'Application Update',
      message: `Your application for ${jobTitle} at ${companyName} has been updated to: ${newStatus}.`,
      link: '/dashboard/applications',
      relatedJob: related.jobId,
      relatedApplication: related.applicationId
    },
    { send: false }
  );
};

exports.notifyInterviewScheduled = async (candidateId, jobTitle, interview, mode, companyName, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  return createNotification(
    {
      recipient: candidateId,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `An interview has been scheduled for ${jobTitle} at ${companyName} on ${new Date(interview).toLocaleString()} via ${mode}.`,
      link: '/dashboard/applications',
      relatedJob: related.jobId,
      relatedApplication: related.applicationId
    },
    {
      send: true,
      to: candidate?.email,
      handler: emailService.sendInterviewScheduled,
      args: [candidate?.email, jobTitle, { scheduledAt: interview, mode, link: related?.meetingLink, notes: related?.notes }]
    }
  );
};

exports.notifyInterviewReminder = async (candidateId, jobTitle, interviewDate, companyName, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  return createNotification(
    {
      recipient: candidateId,
      type: 'interview_reminder',
      title: 'Interview Reminder',
      message: `Your interview for ${jobTitle} at ${companyName} is tomorrow at ${new Date(interviewDate).toLocaleString()}. Don't miss it — no-shows forfeit the Challenge Fee.`,
      link: '/dashboard/applications',
      relatedJob: related.jobId,
      relatedApplication: related.applicationId
    },
    {
      send: true,
      to: candidate?.email,
      handler: emailService.sendInterviewReminder,
      args: [candidate?.email, jobTitle, interviewDate]
    }
  );
};

exports.notifyFeeRefunded = async (candidateId, amount, reason, jobTitle, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  return createNotification(
    {
      recipient: candidateId,
      type: 'fee_refunded',
      title: 'Challenge Fee Refunded',
      message: `Your Challenge Fee of ₹${amount} for ${jobTitle} has been refunded. Reason: ${reason}.`,
      link: '/dashboard/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    {
      send: true,
      to: candidate?.email,
      handler: emailService.sendFeeRefunded,
      args: [candidate?.email, amount, reason]
    }
  );
};

exports.notifyFeeForfeited = async (candidateId, amount, jobTitle, companyName, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  return createNotification(
    {
      recipient: candidateId,
      type: 'fee_forfeited',
      title: 'Challenge Fee Forfeited',
      message: `Your Challenge Fee of ₹${amount} for ${jobTitle} at ${companyName} has been forfeited due to interview no-show.`,
      link: '/dashboard/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    {
      send: true,
      to: candidate?.email,
      handler: emailService.sendFeeForfeited,
      args: [candidate?.email, jobTitle]
    }
  );
};

exports.notifyHired = async (candidateId, jobTitle, companyName, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  return createNotification(
    {
      recipient: candidateId,
      type: 'hired',
      title: "Congratulations! You've Been Hired!",
      message: `You have been hired for ${jobTitle} at ${companyName}! Your Challenge Fee will be refunded.`,
      link: '/dashboard/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    {
      send: true,
      to: candidate?.email,
      handler: emailService.sendApplicationHired,
      args: [candidate?.email, jobTitle, true]
    }
  );
};

exports.notifyRejected = async (candidateId, jobTitle, companyName, feeRefunded, related = {}) => {
  const candidate = await User.findById(candidateId).select('email');
  const feeText = feeRefunded ? ' Your Challenge Fee has been refunded.' : '';
  return createNotification(
    {
      recipient: candidateId,
      type: 'rejected',
      title: 'Application Update',
      message: `Your application for ${jobTitle} at ${companyName} was not selected.${feeText}`,
      link: '/dashboard/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    {
      send: true,
      to: candidate?.email,
      handler: emailService.sendApplicationRejected,
      args: [candidate?.email, jobTitle, !!feeRefunded]
    }
  );
};

// -------------------- Recruiter Notifications --------------------
exports.notifyNewApplication = async (recruiterId, candidateName, jobTitle, related = {}) => {
  return createNotification(
    {
      recipient: recruiterId,
      type: 'application_received',
      title: 'New Application',
      message: `${candidateName} applied for ${jobTitle}.`,
      link: '/recruiter/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    { send: false }
  );
};

exports.notifyPriorityApplication = async (recruiterId, candidateName, jobTitle, amount, related = {}) => {
  const recruiter = await User.findById(recruiterId).select('email');
  return createNotification(
    {
      recipient: recruiterId,
      type: 'priority_application',
      title: '⭐ Priority Application',
      message: `${candidateName} applied for ${jobTitle} with a ₹${amount} Challenge Fee. Review prioritized.`,
      link: '/recruiter/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    {
      send: true,
      to: recruiter?.email,
      handler: emailService.sendPriorityApplicationReceived,
      args: [recruiter?.email, candidateName, jobTitle, amount]
    }
  );
};

exports.notifyInterviewNoShow = async (recruiterId, candidateName, jobTitle, related = {}) => {
  return createNotification(
    {
      recipient: recruiterId,
      type: 'interview_no_show',
      title: 'Candidate No-Show',
      message: `${candidateName} did not attend the interview for ${jobTitle}. Their Challenge Fee has been forfeited.`,
      link: '/recruiter/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    { send: false }
  );
};

exports.notifyApplicationWithdrawn = async (recruiterId, candidateName, jobTitle, related = {}) => {
  return createNotification(
    {
      recipient: recruiterId,
      type: 'application_withdrawn',
      title: 'Application Withdrawn',
      message: `${candidateName} has withdrawn their application for ${jobTitle}.`,
      link: '/recruiter/applications',
      relatedApplication: related.applicationId,
      relatedJob: related.jobId
    },
    { send: false }
  );
};
