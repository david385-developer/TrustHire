const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4,
  connectionTimeout: 30000,
  greetingTimeout: 15000,
  socketTimeout: 30000
});

const verifyEmail = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('EMAIL: EMAIL_USER or EMAIL_PASS missing');
      return false;
    }
    await transporter.verify();
    console.log('EMAIL: Transporter verified successfully');
    return true;
  } catch (error) {
    console.error('EMAIL: Transporter FAILED:', error.message);
    return false;
  }
};

const sendMail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('EMAIL: Credentials missing, skipping');
      return false;
    }
    const info = await transporter.sendMail({
      from: `"TrustHire" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`EMAIL: Sent to ${to} — ${subject} — ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`EMAIL: Failed to ${to}:`, error.message);
    return false;
  }
};

const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Welcome to TrustHire! Verify your email
          using the code below:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;
            background:#F3F4F6;padding:16px 32px;
            border-radius:8px;font-size:32px;
            font-weight:bold;letter-spacing:8px;
            font-family:monospace;color:#1B4D3E;">
            ${otp}
          </div>
        </div>
        <p style="color:#9CA3AF;font-size:14px;">
          This code expires in 5 minutes.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, 'Verify Your Email', html);
};

const sendResetOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          You requested to reset your password.
          Use the code below:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;
            background:#F3F4F6;padding:16px 32px;
            border-radius:8px;font-size:32px;
            font-weight:bold;letter-spacing:8px;
            font-family:monospace;color:#1B4D3E;">
            ${otp}
          </div>
        </div>
        <p style="color:#9CA3AF;font-size:14px;">
          This code expires in 5 minutes.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, 'Reset Your Password', html);
};

const sendApplicationReceived = async (email, name, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Your application for <strong>${jobTitle}</strong> at
          <strong>${company}</strong> has been submitted successfully.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Application Confirmed — ${jobTitle}`, html);
};

const sendInterviewScheduledEmail = async (email, name, jobTitle, interviewDate, mode, link, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Interview scheduled for <strong>${jobTitle}</strong> at
          <strong>${company}</strong>.
        </p>
        <div style="background:#F9FAFB;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:4px 0;color:#1A1A1A;"><strong>Date:</strong> ${interviewDate}</p>
          <p style="margin:4px 0;color:#1A1A1A;"><strong>Mode:</strong> ${mode}</p>
          ${link ? `<p style="margin:4px 0;color:#1A1A1A;"><strong>Link:</strong> <a href="${link}">${link}</a></p>` : ''}
        </div>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Interview Scheduled — ${jobTitle}`, html);
};

const sendShortlistedEmail = async (email, name, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Shortlisted!</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Your application for <strong>${jobTitle}</strong> at
          <strong>${company}</strong> has been shortlisted!
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Shortlisted for ${jobTitle}`, html);
};

const sendRejectedEmail = async (email, name, jobTitle, company, feeAmount, refundId) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#374151;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Application Update</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Your application for <strong>${jobTitle}</strong> at
          <strong>${company}</strong> was not selected.
        </p>
        ${feeAmount > 0 && refundId ? `
          <div style="background:#FFFBEB;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;color:#92400E;font-size:14px;">
              Rs.${feeAmount} Challenge Fee refunded.
            </p>
          </div>
        ` : ''}
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Update — ${jobTitle}`, html);
};

const sendRefundEmail = async (email, name, amount, reason) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Rs.${amount} refunded. ${reason}
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Refund — Rs.${amount}`, html);
};

const sendHiredEmail = async (email, name, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Congratulations!</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          You have been hired for <strong>${jobTitle}</strong> at
          <strong>${company}</strong>!
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Hired — ${jobTitle}`, html);
};

const sendForfeitEmail = async (email, name, amount, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#374151;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#DC2626;font-size:16px;">
          Rs.${amount} forfeited for ${jobTitle} at ${company}
          due to interview no-show.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Fee Forfeited — ${jobTitle}`, html);
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
  sendHiredEmail,
  sendForfeitEmail
};
