const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Initialize Resend if API key is provided (bypasses Render/Vercel SMTP port blocks)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL: EMAIL_USER or EMAIL_PASS environment variables are missing.');
    return null;
  }

  // Create transporter for SMTP relay (e.g. Gmail)
  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    pool: false, // Serverless best practice: disable connection pool
    connectionTimeout: 5000, // 5s timeout
    greetingTimeout: 5000,
    socketTimeout: 10000
  });

  return cachedTransporter;
};

const verifyEmail = async () => {
  try {
    if (resend) {
      console.log('EMAIL: Resend (HTTP API) initialized.');
      return true;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.error('EMAIL: Transporter configuration missing');
      return false;
    }

    await transporter.verify();
    console.log('EMAIL: SMTP Transporter verified successfully.');
    return true;
  } catch (error) {
    console.error('EMAIL: Transporter verification FAILED:', error.message);
    return false;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const attemptSend = async (to, subject, html, text) => {
  if (resend) {
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const { data, error } = await resend.emails.send({
      from: `TrustHire <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
      text: text
    });
    if (error) {
      throw new Error(error.message);
    }
    console.log(`EMAIL: Sent via Resend to ${to} — ${subject} — ID: ${data?.id}`);
    return true;
  }

  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('No email transporter configured');
  }

  const info = await transporter.sendMail({
    from: `"TrustHire" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text
  });
  console.log(`EMAIL: Sent via SMTP to ${to} — ${subject} — MsgID: ${info.messageId}`);
  return true;
};

// Send mail with exponential backoff and database fallback queueing
const sendMail = async (to, subject, html, text = '') => {
  let attempt = 0;
  const maxImmediateRetries = 3;
  let delay = 1000;
  let lastError = null;

  while (attempt < maxImmediateRetries) {
    try {
      const success = await attemptSend(to, subject, html, text);
      if (success) return true;
      throw new Error('Returned false without throw');
    } catch (error) {
      attempt++;
      lastError = error;
      console.warn(`EMAIL: Try ${attempt}/${maxImmediateRetries} failed for ${to}: ${error.message}`);
      if (attempt < maxImmediateRetries) {
        await sleep(delay);
        delay *= 2; // exponential backoff
      }
    }
  }

  // Fallback: Queue the failed email in MongoDB
  console.error(`EMAIL: Delivery to ${to} failed. Queueing in database for background retries...`);
  try {
    const EmailQueue = require('../models/EmailQueue');
    await EmailQueue.create({
      to,
      subject,
      html,
      text,
      status: 'pending',
      attempts: maxImmediateRetries,
      errorMessage: lastError?.message || 'SMTP timeout or send failure',
      nextAttemptAt: new Date(Date.now() + 60 * 1000) // Retry in 1 minute
    });
  } catch (dbError) {
    console.error('EMAIL: Failed to write to EmailQueue database collection:', dbError.message);
  }

  return false;
};

// HTML Email Layout Wrapper
const getPremiumTemplate = (headerTitle, recipientName, bodyHtml, actionHtml = '') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerTitle}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          color: #334155;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #f8fafc;
          padding: 40px 20px;
          box-sizing: border-box;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        .header {
          background-color: #0f172a;
          padding: 32px 24px;
          text-align: center;
          border-bottom: 4px solid #3b82f6;
        }
        .logo {
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0;
          display: inline-block;
          text-decoration: none;
        }
        .logo span {
          color: #3b82f6;
        }
        .content {
          padding: 40px 32px;
        }
        h1 {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 20px;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
          color: #475569;
          margin-top: 0;
          margin-bottom: 24px;
        }
        .button-wrapper {
          text-align: center;
          margin: 32px 0 16px;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: #ffffff !important;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          padding: 12px 32px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }
        .otp-box {
          background-color: #f1f5f9;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #0f172a;
          font-family: monospace;
          margin: 32px 0;
          border: 1px dashed #cbd5e1;
        }
        .info-card {
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          margin: 24px 0;
        }
        .info-row {
          margin-bottom: 12px;
          font-size: 15px;
        }
        .info-row:last-child {
          margin-bottom: 0;
        }
        .info-label {
          font-weight: 600;
          color: #64748b;
          display: inline-block;
          width: 120px;
        }
        .info-val {
          color: #0f172a;
        }
        .footer {
          background-color: #f8fafc;
          padding: 24px 32px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }
        .footer a {
          color: #64748b;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <a href="https://trust-hire.vercel.app" class="logo">Trust<span>Hire</span></a>
          </div>
          <div class="content">
            <h1>Hi ${recipientName},</h1>
            ${bodyHtml}
            ${actionHtml}
          </div>
          <div class="footer">
            <p>TrustHire — Commitment-Driven Recruitment Portal</p>
            <p style="margin-top: 8px;">If you have any questions, reply to this email or visit our <a href="https://trust-hire.vercel.app">Help Center</a>.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 1. Onboarding OTP Email
const sendOTPEmail = async (email, name, otp) => {
  const subject = 'Verify Your Email — TrustHire';
  const bodyHtml = `
    <p>Thank you for choosing TrustHire! We are excited to help you start your recruitment journey.</p>
    <p>Please verify your email address by entering the verification code below on the signup page. This code is only valid for the next 5 minutes.</p>
    <div class="otp-box">${otp}</div>
    <p>If you did not request this email, please ignore it or contact our support team.</p>
  `;
  const text = `Welcome to TrustHire! Please verify your email using this code: ${otp}`;
  const html = getPremiumTemplate('Verify Your Email', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// 2. Password Reset OTP Email
const sendResetOTPEmail = async (email, name, otp) => {
  const subject = 'Reset Your Password — TrustHire';
  const bodyHtml = `
    <p>We received a request to reset the password associated with your TrustHire account.</p>
    <p>Please enter the verification code below to proceed with setting a new password. This code expires in 5 minutes.</p>
    <div class="otp-box">${otp}</div>
    <p>If you did not make this request, you can safely ignore this email — your password will remain unchanged.</p>
  `;
  const text = `TrustHire Password Reset Code: ${otp}`;
  const html = getPremiumTemplate('Reset Your Password', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// 3. Application Confirmed Email
const sendApplicationReceived = async (email, name, jobTitle, company) => {
  const subject = `Application Received: ${jobTitle} at ${company}`;
  const bodyHtml = `
    <p>Your application for the role of <strong>${jobTitle}</strong> at <strong>${company}</strong> has been successfully received.</p>
    <p>The hiring team has been notified. You will receive real-time notifications here as your application moves through the review pipeline.</p>
  `;
  const text = `Hi ${name}, your application for ${jobTitle} at ${company} has been received successfully.`;
  const html = getPremiumTemplate('Application Confirmed', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// 4. Interview Scheduled Email
const sendInterviewScheduledEmail = async (email, name, jobTitle, interviewDate, mode, link, company) => {
  const subject = `Interview Scheduled: ${jobTitle} at ${company}`;
  const formattedDate = new Date(interviewDate).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const bodyHtml = `
    <p>Great news! An interview has been scheduled for your application as a <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
    <p>Please review the details below and ensure you are prepared on time.</p>
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Date & Time:</span>
        <span class="info-val">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mode:</span>
        <span class="info-val" style="text-transform: capitalize;">${mode.replace('_', ' ')}</span>
      </div>
      ${link ? `
      <div class="info-row">
        <span class="info-label">Interview Link:</span>
        <span class="info-val"><a href="${link}" target="_blank" style="color: #3b82f6; text-decoration: underline;">Join Meeting</a></span>
      </div>
      ` : ''}
    </div>
    <p style="color: #dc2626; font-size: 14px; font-weight: 500;">
      ⚠️ Note: Failing to attend this interview without prior notice may result in forfeiture of your Challenge Fee.
    </p>
  `;

  const actionHtml = link ? `
    <div class="button-wrapper">
      <a href="${link}" class="button" target="_blank">Join Interview</a>
    </div>
  ` : '';

  const text = `Hi ${name}, your interview for ${jobTitle} at ${company} is scheduled on ${formattedDate} via ${mode}. Link: ${link || 'N/A'}`;
  const html = getPremiumTemplate('Interview Scheduled', name, bodyHtml, actionHtml);

  return sendMail(email, subject, html, text);
};

// 5. Shortlisted Email
const sendShortlistedEmail = async (email, name, jobTitle, company) => {
  const subject = `Shortlisted: ${jobTitle} at ${company}`;
  const bodyHtml = `
    <p>Congratulations! Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been shortlisted for the next round.</p>
    <p>A representative from the company will reach out shortly to schedule the next steps. Keep an eye on your dashboard for updates.</p>
  `;
  const text = `Hi ${name}, you have been shortlisted for the ${jobTitle} role at ${company}!`;
  const html = getPremiumTemplate('Shortlisted for Review', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// 6. Rejected Email
const sendRejectedEmail = async (email, name, jobTitle, company, feeAmount, refundId) => {
  const subject = `Application Update: ${jobTitle} at ${company}`;
  const hasRefund = Number(feeAmount) > 0 && refundId;

  const bodyHtml = `
    <p>Thank you for the time and effort you invested in applying for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
    <p>Unfortunately, the hiring team has decided to move forward with other candidates at this time. We appreciate your interest and wish you the best in your job search.</p>
    ${hasRefund ? `
    <div class="info-card" style="background-color: #ecfdf5; border-color: #a7f3d0;">
      <h3 style="color: #065f46; font-size: 15px; margin-top: 0; margin-bottom: 8px;">Challenge Fee Refund Confirmed</h3>
      <p style="color: #047857; font-size: 14px; margin: 0;">
        Your priority challenge fee of <strong>Rs.${feeAmount}</strong> has been refunded to your original payment method. 
        Refund Reference ID: <strong>${refundId}</strong>. It may take 5-7 business days to reflect in your account.
      </p>
    </div>
    ` : ''}
  `;
  const text = `Hi ${name}, your application for ${jobTitle} at ${company} was not selected. ${hasRefund ? `Your Rs.${feeAmount} fee has been refunded (ID: ${refundId}).` : ''}`;
  const html = getPremiumTemplate('Application Status Update', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// 7. Refund E-mail
const sendRefundEmail = async (email, name, amount, reason) => {
  const subject = `Refund Processed: Rs.${amount} — TrustHire`;
  const bodyHtml = `
    <p>We have processed a refund of <strong>Rs.${amount}</strong> to your account.</p>
    <div class="info-card" style="background-color: #ecfdf5; border-color: #a7f3d0;">
      <div class="info-row">
        <span class="info-label" style="color: #065f46;">Amount:</span>
        <span class="info-val" style="color: #065f46; font-weight: bold;">Rs.${amount}</span>
      </div>
      <div class="info-row">
        <span class="info-label" style="color: #065f46;">Reason:</span>
        <span class="info-val" style="color: #065f46;">${reason}</span>
      </div>
    </div>
    <p>The funds will be credited to your original payment method in 5-7 business days depending on your bank.</p>
  `;
  const text = `Hi ${name}, your refund of Rs.${amount} has been processed. Reason: ${reason}`;
  const html = getPremiumTemplate('Refund Processed', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// Wrapper for auto-refund cron job to fetch name and trigger email
const sendFeeRefunded = async (email, amount, reason) => {
  let name = 'Candidate';
  try {
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (user) {
      name = user.name;
    }
  } catch (error) {
    console.error('sendFeeRefunded lookup error:', error.message);
  }
  return sendRefundEmail(email, name, amount, reason);
};

// 8. Hired Email
const sendHiredEmail = async (email, name, jobTitle, company) => {
  const subject = `Offer Letter & Selection: ${jobTitle} at ${company}!`;
  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 48px;">🎉</span>
    </div>
    <p style="font-size: 18px; font-weight: 600; color: #059669; text-align: center;">Congratulations, you are hired!</p>
    <p>We are absolutely thrilled to inform you that you have been selected for the position of <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
    <p>The hiring team will reach out to you shortly with onboarding details, compensation breakdowns, and your formal offer letter.</p>
    <p>We are excited to see you excel in your new role!</p>
  `;
  const text = `Hi ${name}, congratulations! You have been hired for the ${jobTitle} position at ${company}!`;
  const html = getPremiumTemplate('Congratulations! Hired!', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// 9. Forfeit Email
const sendForfeitEmail = async (email, name, amount, jobTitle, company) => {
  const subject = `Challenge Fee Forfeited: ${jobTitle}`;
  const bodyHtml = `
    <p>Your Challenge Fee of <strong>Rs.${amount}</strong> for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> has been forfeited.</p>
    <div class="info-card" style="background-color: #fef2f2; border-color: #fca5a5;">
      <h3 style="color: #991b1b; font-size: 15px; margin-top: 0; margin-bottom: 8px;">Forfeiture Alert</h3>
      <p style="color: #b91c1c; font-size: 14px; margin: 0;">
        This fee was forfeited because you did not attend the scheduled interview. 
        Escrow funds are disbursed to compensate the interviewer's time in cases of unexcused no-shows.
      </p>
    </div>
    <p>If you believe this was an error, please contact the recruiter or our support portal to file an appeal.</p>
  `;
  const text = `Hi ${name}, your Challenge Fee of Rs.${amount} for ${jobTitle} has been forfeited due to interview no-show.`;
  const html = getPremiumTemplate('Challenge Fee Forfeited', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// 10. Challenge Fee Confirmed Receipt
const sendFeeConfirmed = async (email, amount) => {
  let name = 'Candidate';
  try {
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (user) {
      name = user.name;
    }
  } catch (err) {}

  const subject = `Payment Confirmed: Rs.${amount} — TrustHire`;
  const bodyHtml = `
    <p>Thank you! Your payment of <strong>Rs.${amount}</strong> for the priority Challenge Fee has been successfully confirmed.</p>
    <div class="info-card" style="background-color: #ecfdf5; border-color: #a7f3d0;">
      <p style="color: #065f46; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">Priority Review Activated</p>
      <p style="color: #047857; font-size: 14px; margin: 0;">
        Your application has been moved to the top of the recruiter's queue. Recruiters will be notified of your commitment immediately.
      </p>
    </div>
    <p>Your fee is securely held in escrow and will be refunded to you if you are hired, rejected, or if the recruiter fails to review your application within the guaranteed window.</p>
  `;
  const text = `Hi, your payment of Rs.${amount} for TrustHire Priority review has been confirmed.`;
  const html = getPremiumTemplate('Payment Received', name, bodyHtml);

  return sendMail(email, subject, html, text);
};

// Process failed emails from database queue
const processEmailQueue = async () => {
  try {
    const EmailQueue = require('../models/EmailQueue');
    // Fetch up to 10 pending emails that are scheduled for retry
    const pending = await EmailQueue.find({
      status: 'pending',
      nextAttemptAt: { $lte: new Date() }
    }).limit(10);

    if (pending.length === 0) return;

    console.log(`EMAIL_QUEUE: Processing ${pending.length} pending emails...`);

    for (const item of pending) {
      item.attempts += 1;
      item.lastAttemptAt = new Date();
      try {
        const success = await attemptSend(item.to, item.subject, item.html, item.text);
        if (success) {
          item.status = 'sent';
          item.errorMessage = '';
        } else {
          throw new Error('Returned false without throw');
        }
      } catch (err) {
        console.error(`EMAIL_QUEUE: Retry failed for ${item.to} (attempt ${item.attempts}):`, err.message);
        item.errorMessage = err.message || 'Retry failed';
        if (item.attempts >= item.maxAttempts) {
          item.status = 'failed';
        } else {
          // Retry again later (with backoff minutes)
          const backoffMins = Math.min(60, Math.pow(2, item.attempts - 3) * 5); // 5 mins, 10 mins, 20 mins, etc.
          item.nextAttemptAt = new Date(Date.now() + backoffMins * 60 * 1000);
        }
      }
      await item.save();
    }
  } catch (error) {
    console.error('EMAIL_QUEUE: Error processing queue:', error.message);
  }
};

module.exports = {
  verifyEmail,
  sendOTPEmail,
  sendResetOTPEmail,
  sendApplicationReceived,
  sendInterviewScheduledEmail,
  sendShortlistedEmail,
  sendRejectedEmail,
  sendRefundEmail,
  sendFeeRefunded, // Map the cron job reference correctly
  sendHiredEmail,
  sendForfeitEmail,
  sendFeeConfirmed,
  processEmailQueue
};
