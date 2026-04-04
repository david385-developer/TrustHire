const Notification = require('../models/Notification');

const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipient: data.recipient,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || '/dashboard/applications'
    });
    console.log(`NOTIFY: ${data.type} → ${data.recipient}`);
    return notification;
  } catch (error) {
    console.error(`NOTIFY: Failed ${data.type}:`,
      error.message);
    return null;
  }
};

const notifyApplicationSubmitted = async (candidateId,
  jobTitle, company) => {
  return createNotification({
    recipient: candidateId,
    type: 'application_submitted',
    title: 'Application Submitted',
    message: `Your application for ${jobTitle} at ${company}
      has been submitted successfully.`,
    link: '/dashboard/applications'
  });
};

const notifyNewApplication = async (recruiterId,
  candidateName, jobTitle) => {
  return createNotification({
    recipient: recruiterId,
    type: 'application_received',
    title: 'New Application',
    message: `${candidateName} applied for ${jobTitle}.`,
    link: '/recruiter/applications'
  });
};

const notifyPriorityApplication = async (recruiterId,
  candidateName, jobTitle, amount) => {
  return createNotification({
    recipient: recruiterId,
    type: 'priority_application',
    title: 'Priority Application',
    message: `${candidateName} applied for ${jobTitle}
      with a Rs.${amount} Challenge Fee.`,
    link: '/recruiter/applications'
  });
};

const notifyInterviewScheduled = async (candidateId,
  jobTitle, interviewDate, mode, company) => {
  return createNotification({
    recipient: candidateId,
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: `Interview for ${jobTitle} at ${company}
      on ${interviewDate} via ${mode}.`,
    link: '/dashboard/applications'
  });
};

const notifyStatusUpdated = async (candidateId, jobTitle,
  status, company) => {
  return createNotification({
    recipient: candidateId,
    type: 'status_updated',
    title: 'Application Update',
    message: `Your application for ${jobTitle} at ${company}
      has been ${status}.`,
    link: '/dashboard/applications'
  });
};

const notifyRejected = async (candidateId, jobTitle,
  company, feeRefunded) => {
  return createNotification({
    recipient: candidateId,
    type: 'rejected',
    title: 'Application Update',
    message: `Your application for ${jobTitle} at ${company}
      was not selected.${feeRefunded ? ' Fee refunded.' : ''}`,
    link: '/dashboard/applications'
  });
};

const notifyHired = async (candidateId, jobTitle,
  company) => {
  return createNotification({
    recipient: candidateId,
    type: 'hired',
    title: 'Congratulations! Hired!',
    message: `You have been hired for ${jobTitle}
      at ${company}!`,
    link: '/dashboard/applications'
  });
};

const notifyFeeRefunded = async (candidateId, amount,
  reason, jobTitle) => {
  return createNotification({
    recipient: candidateId,
    type: 'fee_refunded',
    title: 'Challenge Fee Refunded',
    message: `Rs.${amount} refunded for ${jobTitle}.
      Reason: ${reason}.`,
    link: '/dashboard/applications'
  });
};

const notifyFeeForfeited = async (candidateId, amount,
  jobTitle, company) => {
  return createNotification({
    recipient: candidateId,
    type: 'fee_forfeited',
    title: 'Challenge Fee Forfeited',
    message: `Rs.${amount} forfeited for ${jobTitle}
      at ${company} due to interview no-show.`,
    link: '/dashboard/applications'
  });
};

module.exports = {
  notifyApplicationSubmitted,
  notifyNewApplication,
  notifyPriorityApplication,
  notifyInterviewScheduled,
  notifyStatusUpdated,
  notifyRejected,
  notifyHired,
  notifyFeeRefunded,
  notifyFeeForfeited
};
