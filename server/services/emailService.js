const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const verifyEmail = async () => {
  try {
    await transporter.verify();
    console.log('EMAIL: Transporter verified successfully');
    return true;
  } catch (error) {
    console.error('EMAIL: Transporter FAILED:', error.message);
    console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'MISSING');
    console.error('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
    return false;
  }
};

const sendMail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('EMAIL: Credentials missing, skipping send');
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
    console.error(`EMAIL: Failed to ${to} — ${error.message}`);
    return false;
  }
};

// ---- EMAIL TEMPLATES ----

const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Thank you for registering on TrustHire.
          Please verify your email using the code below:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;background:#F3F4F6;
            padding:16px 32px;border-radius:8px;
            font-size:32px;font-weight:bold;letter-spacing:8px;
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
  return sendMail(email, 'TrustHire — Verify Your Email', html);
};

const sendApplicationReceived = async (email, name, jobTitle) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Your application for <strong>${jobTitle}</strong>
          has been submitted successfully.
        </p>
        <p style="color:#4B5563;font-size:16px;">
          You will be notified of any updates.
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

const sendInterviewScheduledEmail = async (email, name,
  jobTitle, interviewDate, mode, link, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          An interview has been scheduled for
          <strong>${jobTitle}</strong> at <strong>${company}</strong>.
        </p>
        <div style="background:#F9FAFB;padding:16px;border-radius:8px;
          margin:16px 0;">
          <p style="margin:4px 0;color:#1A1A1A;">
            📅 <strong>Date:</strong> ${interviewDate}
          </p>
          <p style="margin:4px 0;color:#1A1A1A;">
            💻 <strong>Mode:</strong> ${mode}
          </p>
          ${link ? `<p style="margin:4px 0;color:#1A1A1A;">
            🔗 <strong>Link:</strong> <a href="${link}">${link}</a>
          </p>` : ''}
        </div>
        <div style="background:#FEF2F2;padding:12px;border-radius:8px;
          border-left:4px solid #DC2626;margin:16px 0;">
          <p style="margin:0;color:#DC2626;font-size:14px;">
            ⚠️ If you fail to attend, your Challenge Fee
            will be forfeited.
          </p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard/applications"
            style="display:inline-block;background:#1B4D3E;color:#fff;
            padding:12px 32px;border-radius:999px;text-decoration:none;
            font-weight:600;">
            View Details
          </a>
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

const sendShortlistedEmail = async (email, name, jobTitle,
  company, dashboardLink) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">✅</div>
        <h1 style="color:#fff;margin:0;font-size:24px;">
          You've Been Shortlisted!
        </h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Congratulations! Your application for
          <strong>${jobTitle}</strong> at
          <strong>${company}</strong> has been shortlisted.
        </p>
        <div style="background:#ECFDF5;padding:16px;border-radius:8px;
          border-left:4px solid #059669;margin:16px 0;">
          <p style="margin:0;color:#059669;font-size:14px;">
            The recruiter was impressed with your profile.
            You may be contacted soon for an interview.
          </p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${dashboardLink}"
            style="display:inline-block;background:#1B4D3E;color:#fff;
            padding:12px 32px;border-radius:999px;text-decoration:none;
            font-weight:600;">
            View Application Status
          </a>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email,
    `Great News, ${name}! You've Been Shortlisted for ${jobTitle}`,
    html);
};

const sendRejectedEmail = async (email, name, jobTitle,
  company, feeAmount, refundId, jobsLink) => {
  const refundSection = feeAmount > 0 && refundId ? `
    <div style="background:#FFFBEB;padding:16px;border-radius:8px;
      border-left:4px solid #D4A843;margin:16px 0;">
      <p style="margin:0;color:#92400E;font-size:14px;">
        💰 Your ₹${feeAmount} Challenge Fee has been refunded.
        It will reflect in 5-7 business days.
      </p>
    </div>
  ` : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#374151;padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">📋</div>
        <h1 style="color:#fff;margin:0;font-size:24px;">
          Application Update
        </h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          Thank you for your interest in
          <strong>${jobTitle}</strong> at
          <strong>${company}</strong>. After careful
          consideration, the recruiter has decided to
          move forward with other candidates.
        </p>
        <p style="color:#4B5563;font-size:16px;">
          This does not reflect on your abilities —
          it is often a matter of specific fit.
        </p>
        ${refundSection}
        <div style="background:#EFF6FF;padding:16px;border-radius:8px;
          border-left:4px solid #3B82F6;margin:16px 0;">
          <p style="margin:0;color:#1E40AF;font-size:14px;">
            📌 Thousands of new jobs are posted every week.
            Keep going — your next opportunity is waiting.
          </p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${jobsLink}"
            style="display:inline-block;background:#1B4D3E;color:#fff;
            padding:12px 32px;border-radius:999px;text-decoration:none;
            font-weight:600;">
            Browse More Jobs
          </a>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email,
    `Update on Your Application for ${jobTitle} at ${company}`,
    html);
};

const sendRefundEmail = async (email, name, amount, reason) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <div style="background:#ECFDF5;padding:16px;border-radius:8px;
          text-align:center;margin:16px 0;">
          <p style="font-size:32px;margin:0 0 8px;">💰</p>
          <p style="font-size:24px;font-weight:bold;color:#059669;margin:0;">
            ₹${amount} Refunded
          </p>
          <p style="color:#4B5563;font-size:14px;margin:8px 0 0;">
            ${reason}
          </p>
        </div>
        <p style="color:#4B5563;font-size:16px;">
          The amount will reflect in your account within
          5-7 business days.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email, `Challenge Fee Refunded — ₹${amount}`, html);
};

const sendHiredEmail = async (email, name, jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1B4D3E;padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🎉</div>
        <h1 style="color:#fff;margin:0;font-size:24px;">
          Congratulations!
        </h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <p style="color:#4B5563;font-size:16px;">
          You have been hired for <strong>${jobTitle}</strong>
          at <strong>${company}</strong>!
        </p>
        <div style="background:#ECFDF5;padding:16px;border-radius:8px;
          margin:16px 0;">
          <p style="margin:0;color:#059669;font-size:14px;">
            💰 Your Challenge Fee will be refunded automatically.
            Best of luck in your new role!
          </p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard/applications"
            style="display:inline-block;background:#1B4D3E;color:#fff;
            padding:12px 32px;border-radius:999px;text-decoration:none;
            font-weight:600;">
            View Details
          </a>
        </div>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email,
    `Congratulations! You've Been Hired — ${jobTitle}`, html);
};

const sendForfeitEmail = async (email, name, amount,
  jobTitle, company) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#374151;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TrustHire</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1A1A1A;">Hi ${name},</h2>
        <div style="background:#FEF2F2;padding:16px;border-radius:8px;
          border-left:4px solid #DC2626;margin:16px 0;">
          <p style="margin:0;color:#DC2626;font-size:16px;">
            Your ₹${amount} Challenge Fee for
            <strong>${jobTitle}</strong> at
            <strong>${company}</strong> has been forfeited
            due to interview no-show.
          </p>
        </div>
        <p style="color:#4B5563;font-size:14px;">
          Please ensure you attend scheduled interviews
          to avoid fee forfeiture in the future.
        </p>
      </div>
      <div style="background:#F9FAFB;padding:16px 24px;
        text-align:center;font-size:12px;color:#9CA3AF;">
        TrustHire — Your Commitment Is Your Strongest Resume
      </div>
    </div>
  `;
  return sendMail(email,
    `Challenge Fee Forfeited — ${jobTitle}`, html);
};

module.exports = {
  verifyEmail,
  sendOTPEmail,
  sendApplicationReceived,
  sendInterviewScheduledEmail,
  sendShortlistedEmail,
  sendRejectedEmail,
  sendRefundEmail,
  sendHiredEmail,
  sendForfeitEmail
};
