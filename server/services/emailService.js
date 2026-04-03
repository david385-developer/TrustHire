const nodemailer = require('nodemailer');

// Define styles for HTML templates matching the Forest Green trusthire brand
const BRAND_COLOR = '#1B4D3E';
const BRAND_ACCENT = '#D4A843';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    // Do not fail on invalid certs - helpful for some cloud environments
    rejectUnauthorized: false 
  }
});

const generateHtmlTemplate = (title, contentLines) => `
  <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
    <div style="background-color: ${BRAND_COLOR}; padding: 24px; text-align: center;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="font-size: 24px; font-weight: bold; color: white; font-family: Georgia, serif;">
            <span style="font-weight: 700;">Trust</span><span style="font-weight: 400; color: rgba(255,255,255,0.8);">Hire</span>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding: 32px; background-color: #FAFAF7; color: #1A1A1A;">
      <h2 style="color: ${BRAND_COLOR}; font-size: 20px; margin-top: 0; border-bottom: 2px solid ${BRAND_ACCENT}; padding-bottom: 12px; display: inline-block;">${title}</h2>
      ${contentLines.map(line => `<p style="margin-bottom: 16px; line-height: 1.6;">${line}</p>`).join('')}
    </div>
    <div style="background-color: #F3F4F6; padding: 20px; text-align: center; color: #6B7280; font-size: 12px;">
      <p style="margin: 0 0 8px 0; font-weight: bold; color: ${BRAND_COLOR};">TrustHire — Your Commitment Is Your Strongest Resume</p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} TrustHire. All rights reserved.</p>
    </div>
  </div>
`;

const sendEmail = async (to, subject, title, bodyLines) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return;
  }
  
  try {
    await transporter.sendMail({
      from: `"TrustHire" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: generateHtmlTemplate(title, bodyLines)
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

/**
 * Sends the OTP verification email with branded template
 */
const sendOTPEmail = async (email, name, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[Mock OTP Email] To: ${email} | OTP: ${otp}`);
    return;
  }

  const html = `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background-color: ${BRAND_COLOR}; padding: 32px 24px; text-align: center;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="font-size: 26px; font-weight: bold; color: white; font-family: Georgia, serif;">
              <span style="font-weight: 700;">Trust</span><span style="font-weight: 400; color: rgba(255,255,255,0.8);">Hire</span>
            </td>
          </tr>
        </table>
        <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">Your Commitment Is Your Strongest Resume</p>
      </div>

      <!-- Body -->
      <div style="padding: 36px 32px; background-color: #FAFAF7; color: #1A1A1A;">
        <h2 style="color: ${BRAND_COLOR}; font-size: 20px; margin-top: 0; margin-bottom: 8px;">Verify Your Email Address</h2>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Hi <strong>${name}</strong>,<br/>
          Thank you for registering on TrustHire. Please use the verification code below to confirm your email address.
        </p>

        <!-- OTP Box -->
        <div style="text-align: center; margin: 28px 0;">
          <p style="color: #6B7280; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Your verification code</p>
          <div style="display: inline-block; background-color: #F3F4F6; border: 2px solid #E5E7EB; border-radius: 12px; padding: 20px 40px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 700; color: ${BRAND_COLOR}; letter-spacing: 12px;">${otp}</span>
          </div>
          <p style="color: #EF4444; font-size: 13px; margin-top: 14px; font-weight: 600;">
            ⏱ This code expires in 5 minutes
          </p>
        </div>

        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 8px;">
          If you did not create an account on TrustHire, you can safely ignore this email. No action is needed.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #F3F4F6; padding: 16px; text-align: center; color: #6B7280; font-size: 12px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} TrustHire. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TrustHire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'TrustHire — Verify Your Email',
      html
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
  }
};

module.exports = {
  sendOTPEmail,
  sendApplicationReceived: (email, jobTitle) => 
    sendEmail(email, `Application Confirmed — ${jobTitle}`, "Application Received", [
      `Your application for the <strong>${jobTitle}</strong> position has been successfully submitted.`,
      "The employer will review your profile shortly."
    ]),
    
  sendFeeConfirmed: (email, amount) => 
    sendEmail(email, `Challenge Fee Confirmed — ₹${amount}`, "Fee Confirmed & Application Prioritized", [
      `We have successfully received your Challenge Fee of ₹${amount}.`,
      "Your application is now marked as priority and placed at the top of the recruiter's list.",
      "<strong>Refund Policy Reminder:</strong> Your fee is automatically refunded if you are rejected, if not reviewed within the job's timeframe, or if you are hired and join. It is only forfeited if you skip a scheduled interview."
    ]),
    
  sendInterviewScheduled: (email, jobTitle, details) =>
    sendEmail(email, `Interview Scheduled — ${jobTitle}`, "Interview Scheduled", [
      `Great news! An interview has been scheduled for the <strong>${jobTitle}</strong> position.`,
      `<strong>Date:</strong> ${new Date(details.scheduledAt).toLocaleString()}`,
      `<strong>Mode:</strong> ${details.mode.toUpperCase()}`,
      details.link ? `<strong>Link:</strong> <a href="${details.link}">${details.link}</a>` : '',
      details.notes ? `<strong>Notes:</strong> ${details.notes}` : '',
      "<strong>Important:</strong> If you paid a Challenge Fee, it will be forfeited if you do not attend this interview."
    ].filter(Boolean)),
    
  sendApplicationRejected: (email, jobTitle, feeRefunded) =>
    sendEmail(email, `Update on your application — ${jobTitle}`, "Application Status Update", [
      `Thank you for applying to the <strong>${jobTitle}</strong> position.`,
      "Unfortunately, the employer has decided to move forward with other candidates at this time.",
      feeRefunded ? "<strong>Fee Refund:</strong> Since your application was rejected, your Challenge Fee is being refunded to your original payment method automatically." : ''
    ].filter(Boolean)),
    
  sendFeeRefunded: (email, amount, reason) =>
    sendEmail(email, `Challenge Fee Refunded — ₹${amount}`, "Fee Refund Processing", [
      `Your Challenge Fee of ₹${amount} is being refunded.`,
      `<strong>Reason:</strong> ${reason}`,
      "Please allow 5-7 business days for the amount to reflect in your original payment method."
    ]),
    
  sendFeeForfeited: (email, jobTitle) =>
    sendEmail(email, `Challenge Fee Forfeited — ${jobTitle}`, "Fee Forfeited", [
      `This is a notification regarding your priority application for <strong>${jobTitle}</strong>.`,
      "Because you were marked as a no-show for your scheduled interview, your Challenge Fee has been forfeited as per the platform policy."
    ]),
    
  sendApplicationHired: (email, jobTitle, feeRefunded) =>
    sendEmail(email, `Congratulations! You've been hired — ${jobTitle}`, "You're Hired!", [
      `Congratulations! You have been marked as hired for the <strong>${jobTitle}</strong> position!`,
      "The employer will contact you directly with further onboarding details.",
      feeRefunded ? "<strong>Fee Refund:</strong> Since you have successfully secured the position, your Challenge Fee is being refunded to your original payment method." : ''
    ].filter(Boolean)),

  sendInterviewReminder: (email, jobTitle, interviewDate) =>
    sendEmail(email, `Reminder: Interview Tomorrow — ${jobTitle}`, "Interview Reminder", [
      `This is a friendly reminder for your interview for <strong>${jobTitle}</strong>.`,
      `<strong>When:</strong> ${new Date(interviewDate).toLocaleString()}`,
      "Please be on time. No-shows forfeit the Challenge Fee for priority applications."
    ]),

  sendPriorityApplicationReceived: (email, candidateName, jobTitle, amount) =>
    sendEmail(email, `Priority Application — ${jobTitle}`, "Priority Application Received", [
      `${candidateName} applied for <strong>${jobTitle}</strong> with a Challenge Fee of ₹${amount}.`,
      "Please review this application promptly to honor the prioritization."
    ])
};
