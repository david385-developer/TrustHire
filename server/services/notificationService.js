const Notification = require('../models/Notification');

/**
 * All notification functions are wrapped in try-catch to ensure
 * a failed notification does not crash the main API request.
 */

const notifyInterviewScheduled = async (candidateId, jobTitle, interviewDate, mode, company) => {
  try {
    const notification = await Notification.create({
      recipient: candidateId,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `An interview has been scheduled for ${jobTitle} at ${company} on ${new Date(interviewDate).toLocaleString()} via ${mode}.`,
      link: '/dashboard/applications'
    });
    console.log('NOTIFY: Interview scheduled →', candidateId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed interview_scheduled:', error.message);
    return null;
  }
};

const notifyPriorityApplication = async (recruiterId, candidateName, jobTitle, amount) => {
  try {
    const notification = await Notification.create({
      recipient: recruiterId,
      type: 'priority_application',
      title: '⭐ Priority Application',
      message: `${candidateName} applied for ${jobTitle} with a ₹${amount} Challenge Fee. Review prioritized.`,
      link: '/recruiter/applications'
    });
    console.log('NOTIFY: Priority app →', recruiterId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed priority_application:', error.message);
    return null;
  }
};

const notifyRejected = async (candidateId, jobTitle, company, feeRefunded) => {
  try {
    const notification = await Notification.create({
      recipient: candidateId,
      type: 'rejected',
      title: 'Application Update',
      message: `Your application for ${jobTitle} at ${company} was not selected.${feeRefunded ? ' Your Challenge Fee has been refunded.' : ''}`,
      link: '/dashboard/applications'
    });
    console.log('NOTIFY: Rejected →', candidateId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed rejected:', error.message);
    return null;
  }
};

const notifyHired = async (candidateId, jobTitle, company) => {
  try {
    const notification = await Notification.create({
      recipient: candidateId,
      type: 'hired',
      title: "Congratulations! You've Been Hired!",
      message: `You have been hired for ${jobTitle} at ${company}!`,
      link: '/dashboard/applications'
    });
    console.log('NOTIFY: Hired →', candidateId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed hired:', error.message);
    return null;
  }
};

const notifyApplicationSubmitted = async (candidateId, jobTitle, company) => {
  try {
    const notification = await Notification.create({
      recipient: candidateId,
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for ${jobTitle} at ${company} has been submitted successfully.`,
      link: '/dashboard/applications'
    });
    console.log('NOTIFY: Submitted →', candidateId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed submitted:', error.message);
    return null;
  }
};

const notifyNewApplication = async (recruiterId, candidateName, jobTitle) => {
  try {
    const notification = await Notification.create({
      recipient: recruiterId,
      type: 'application_received',
      title: 'New Application',
      message: `${candidateName} applied for ${jobTitle}.`,
      link: '/recruiter/applications'
    });
    console.log('NOTIFY: New app →', recruiterId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed new_application:', error.message);
    return null;
  }
};

const notifyFeeRefunded = async (candidateId, amount, reason, jobTitle) => {
  try {
    const notification = await Notification.create({
      recipient: candidateId,
      type: 'fee_refunded',
      title: 'Challenge Fee Refunded',
      message: `Your Challenge Fee of ₹${amount} for ${jobTitle} has been refunded. Reason: ${reason}.`,
      link: '/dashboard/applications'
    });
    console.log('NOTIFY: Refunded →', candidateId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed fee_refunded:', error.message);
    return null;
  }
};

const notifyFeeForfeited = async (candidateId, amount, jobTitle, company) => {
  try {
    const notification = await Notification.create({
      recipient: candidateId,
      type: 'fee_forfeited',
      title: 'Challenge Fee Forfeited',
      message: `Your Challenge Fee of ₹${amount} for ${jobTitle} at ${company} has been forfeited due to interview no-show.`,
      link: '/dashboard/applications'
    });
    console.log('NOTIFY: Forfeited →', candidateId);
    return notification;
  } catch (error) {
    console.error('NOTIFY: Failed fee_forfeited:', error.message);
    return null;
  }
};

module.exports = {
  notifyApplicationSubmitted,
  notifyNewApplication,
  notifyInterviewScheduled,
  notifyPriorityApplication,
  notifyRejected,
  notifyHired,
  notifyFeeRefunded,
  notifyFeeForfeited
};
