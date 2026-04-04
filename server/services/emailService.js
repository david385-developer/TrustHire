const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ---- CORE SEND FUNCTION ----

const sendMail = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('EMAIL: RESEND_API_KEY missing. Skipping send.');
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'TrustHire <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    if (error) {
      console.error(`EMAIL: Failed to ${to}:`, error.message);
      return false;
    }

    console.log(`EMAIL: Sent to ${to} — ${subject} — ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`EMAIL: Exception sending to ${to}:`, error.message);
    return false;
  }
};

// ---- VERIFY ON STARTUP ----

const verifyEmail = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('EMAIL: RESEND_API_KEY not set');
      return false;
    }
    console.log('EMAIL: Resend configured (API key present)');
    return true;
  } catch (error) {
    console.error('EMAIL: Verification failed:', error.message);
    return false;
  }
};

// ---- OTP EMAIL ----

const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">
          TrustHire
        </h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Thank you for registering on TrustHire.
          Use the code below to verify your email:
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

// ---- RESET PASSWORD OTP ----

const sendResetOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">
          TrustHire
        </h1>
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

// ---- APPLICATION RECEIVED ----

const sendApplicationReceived = async (email, name, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been submitted successfully.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard/applications"
            style="display:inline-block;background:#1B4D3E;color:#fff;
            padding:12px 32px;border-radius:999px;text-decoration:none;
            font-weight:600;">
            View Application
          </a>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Application Confirmed — ${jobTitle}`, html);
};

// ---- INTERVIEW SCHEDULED ----

const sendInterviewScheduledEmail = async (email, name, jobTitle, interviewDate, mode, link, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          An interview has been scheduled for <strong>${jobTitle}</strong> at <strong>${company}</strong>.
        </p>
        <div style="background:#F9FAFB;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:4px 0;color:#1A1A1A;"><strong>Date:</strong> ${interviewDate}</p>
          <p style="margin:4px 0;color:#1A1A1A;"><strong>Mode:</strong> ${mode}</p>
          ${link ? `<p style="margin:4px 0;color:#1A1A1A;"><strong>Link:</strong> <a href="${link}">${link}</a></p>` : ''}
        </div>
        <div style="background:#FEF2F2;padding:12px;border-radius:8px;border-left:4px solid #DC2626;margin:16px 0;">
          <p style="margin:0;color:#DC2626;font-size:14px;">If you fail to attend, your Challenge Fee will be forfeited.</p>
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

// ---- SHORTLISTED ----

const sendShortlistedEmail = async (email, name, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">✅</div>
        <h1 style="color:#fff;margin:0;font-size:24px;">You've Been Shortlisted!</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Congratulations! Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been shortlisted.
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

// ---- REJECTED ----

const sendRejectedEmail = async (email, name, jobTitle, company, feeAmount, refundId) => {
  const refundSection = feeAmount > 0 ? `
    <div style="background:#FFFBEB;padding:16px;border-radius:8px;border-left:4px solid #D4A843;margin:16px 0;">
      <p style="margin:0;color:#92400E;font-size:14px;">
        Your Rs.${feeAmount} Challenge Fee has been refunded (ID: ${refundId}). It will reflect in 5-7 business days.
      </p>
    </div>
  ` : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#374151;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Application Update</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${company}</strong>. The recruiter has decided to move forward with other candidates.
        </p>
        ${refundSection}
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Update on Your Application — ${jobTitle}`, html);
};

// ---- REFUND ----

const sendRefundEmail = async (email, name, amount, reason) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <div style="background:#ECFDF5;padding:16px;border-radius:8px;text-align:center;margin:16px 0;">
          <p style="font-size:24px;font-weight:bold;color:#059669;margin:0;">Rs.${amount} Refunded</p>
          <p style="color:#4B5563;font-size:14px;margin:8px 0 0;">${reason}</p>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Challenge Fee Refunded — Rs.${amount}`, html);
};

// ---- HIRED ----

const sendHiredEmail = async (email, name, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">You've Been Hired!</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          You have been hired for <strong>${jobTitle}</strong> at <strong>${company}</strong>!
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Congratulations! Hired — ${jobTitle}`, html);
};

// ---- FORFEIT ----

const sendForfeitEmail = async (email, name, amount, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#374151;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <div style="background:#FEF2F2;padding:16px;border-radius:8px;border-left:4px solid #DC2626;margin:16px 0;">
          <p style="margin:0;color:#DC2626;font-size:16px;">
            Your Rs.${amount} Challenge Fee for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been forfeited due to interview no-show.
          </p>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Challenge Fee Forfeited — ${jobTitle}`, html);
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
