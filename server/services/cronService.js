const cron = require('node-cron');
const Application = require('../models/Application');
const { processRefund } = require('./refundService');
const emailService = require('./emailService');
const notifications = require('./notificationService');

const startCronJob = () => {
  // Run daily at 02:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running daily auto-refund check...');
    try {
      const now = new Date();

      // Find eligible priority applications where the timeout has passed without interview scheduling
      const applications = await Application.find({
        feePaid: true,
        status: { $in: ['applied', 'under_review'] },
        refundId: { $exists: false },
        refundProcessedAt: { $exists: false }
      }).populate('job').populate('candidate');

      let processedCount = 0;

      for (const app of applications) {
        // Double-check status before processing
        if (app.status === 'fee_refunded' || app.status === 'fee_forfeited' || app.refundId) {
          continue;
        }
        const appliedDate = new Date(app.appliedAt);
        const daysPassed = (now - appliedDate) / (1000 * 60 * 60 * 24);

        if (daysPassed >= app.job.challengeFeeDays) {
          console.log(`[CRON] Auto-refunding Application ${app._id} (Timeout: ${daysPassed} days)`);

          const result = await processRefund(app, 'timeout');

          if (result.success) {
            await emailService.sendFeeRefunded(
              app.candidate.email,
              app.feeAmount,
              `The recruiter did not review your application within the ${app.job.challengeFeeDays}-day guarantee period.`
            );
            await notifications.notifyFeeRefunded(
              app.candidate._id,
              app.feeAmount,
              'Not reviewed in time',
              app.job.title,
              { jobId: app.job._id, applicationId: app._id }
            );
            processedCount++;
          }
        }
      }
      console.log(`[CRON] Daily check completed. Processed ${processedCount} refunds.`);
    } catch (error) {
      console.error('[CRON Error]', error);
    }
  });

  // Interview reminders - daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running interview reminder job...');
    try {
      const now = new Date();
      const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);

      const apps = await Application.find({
        status: 'interview_scheduled',
        'interview.scheduledAt': { $gte: tomorrowStart, $lte: tomorrowEnd }
      }).populate('job').populate('candidate');

      for (const app of apps) {
        await notifications.notifyInterviewReminder(
          app.candidate._id,
          app.job.title,
          app.interview.scheduledAt,
          app.job.company,
          { jobId: app.job._id, applicationId: app._id }
        );
      }
      console.log(`[CRON] Interview reminders sent for ${apps.length} applications.`);
    } catch (error) {
      console.error('[CRON Error - Interview Reminders]', error);
    }
  });

  console.log('Cron service scheduled.');
};

module.exports = {
  startCronJob
};
