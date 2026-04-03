export const staticPages: Record<string, { title: string; sections: { heading: string; paragraphs?: string[] }[] }> = {
  'how-it-works': {
    title: 'How TrustHire Works',
    sections: [
      {
        heading: 'For Job Seekers',
        paragraphs: [
          'Browse thousands of job listings from verified employers.',
          'Apply for free or boost your application with an optional Challenge Fee to signal genuine commitment.',
          'Your Challenge Fee is refundable — if you are rejected, not reviewed within the stipulated time, or hired and join the company, your fee is automatically returned.'
        ]
      },
      {
        heading: 'For Employers',
        paragraphs: [
          'Post jobs and receive applications from committed candidates.',
          'Challenge Fee applications are prioritized, so you review the most serious candidates first.',
          'Reduce no-shows and filter out mass-appliers with the trust-driven commitment signal.'
        ]
      },
      {
        heading: 'The Challenge Fee',
        paragraphs: [
          'An optional refundable deposit that candidates can pay alongside their application. It is not a payment for the job — it is a signal of genuine interest. The fee is forfeited only if a candidate schedules an interview and does not attend.'
        ]
      }
    ]
  },
  'for-employers': {
    title: 'For Employers',
    sections: [
      {
        heading: 'Why TrustHire?',
        paragraphs: [
          'In a world where AI-generated resumes make every candidate look identical, TrustHire helps you identify truly committed talent through the Challenge Fee system.'
        ]
      },
      {
        heading: 'How It Works for You',
        paragraphs: [
          'Post jobs for free. Set an optional Challenge Fee for each role.',
          'Applications with Challenge Fees appear at the top of your queue.',
          'Schedule interviews, track candidates, and make hiring decisions all from one dashboard.'
        ]
      },
      {
        heading: 'Challenge Fee Benefits',
        paragraphs: [
          'Filter committed candidates from mass applicants.',
          'Reduce interview no-shows by up to 70%.',
          'Automatic refund management — no manual processing needed.'
        ]
      }
    ]
  },
  'pricing': {
    title: 'Pricing',
    sections: [
      {
        heading: 'For Job Seekers — Always Free',
        paragraphs: [
          'Browsing jobs is free. Applying to jobs is free.',
          'The Challenge Fee is optional and fully refundable.',
          'You never pay to access job listings.'
        ]
      },
      {
        heading: 'For Employers',
        paragraphs: [
          'Free Plan: Post up to 3 jobs per month, basic dashboard.',
          'Pro Plan (coming soon): Unlimited job posts, analytics, priority support, candidate insights.',
          'Enterprise (coming soon): Custom solutions for large teams.'
        ]
      },
      {
        heading: 'No Hidden Fees',
        paragraphs: [
          'TrustHire does not charge candidates for applying.',
          'The Challenge Fee goes directly to refund management, not to the platform.'
        ]
      }
    ]
  },
  'about-us': {
    title: 'About TrustHire',
    sections: [
      {
        heading: 'Our Mission',
        paragraphs: [
          'TrustHire was built to solve a simple problem: in the age of AI, resumes look the same, and recruiters cannot tell who is genuinely interested. We created the Challenge Fee system to bring trust back into hiring.'
        ]
      },
      {
        heading: 'Our Story',
        paragraphs: [
          'Founded in 2026, TrustHire started as a response to the growing frustration among recruiters flooded with low-quality applications and candidates who could not stand out despite being qualified. Our platform bridges this gap with a commitment-based approach.'
        ]
      },
      {
        heading: 'Our Values',
        paragraphs: [
          'Transparency — Every fee, every refund, every process is clear.',
          'Trust — We build systems where both sides benefit.',
          'Simplicity — Hiring should not be complicated.'
        ]
      }
    ]
  },
  'careers': {
    title: 'Careers at TrustHire',
    sections: [
      {
        heading: 'Join Our Team',
        paragraphs: [
          'We are building the future of trust-driven hiring.',
          'If you are passionate about solving real problems in the recruitment space, we want to hear from you.'
        ]
      },
      {
        heading: 'Open Positions',
        paragraphs: [
          'Currently we are a small, focused team. Check back soon for open roles in engineering, design, and operations.'
        ]
      },
      {
        heading: 'Why Work With Us?',
        paragraphs: [
          'Remote-first culture. Meaningful work that impacts thousands of job seekers and recruiters. Competitive compensation.'
        ]
      }
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Information We Collect',
        paragraphs: [
          'Account information (name, email, password).',
          'Profile information (skills, experience, resume, DOB, qualification, company details).',
          'Payment information (processed via Razorpay, we do not store card details).',
          'Usage data (job views, applications, login timestamps).'
        ]
      },
      {
        heading: 'How We Use Your Information',
        paragraphs: [
          'To create and manage your account.',
          'To process job applications and Challenge Fee payments.',
          'To send transactional emails (application updates, OTP, refunds).',
          'To improve our platform and user experience.'
        ]
      },
      {
        heading: 'Data Security',
        paragraphs: [
          'Passwords are hashed using bcrypt.',
          'Payments are processed through Razorpay\'s secure infrastructure.',
          'We do not sell or share your personal data with third parties.'
        ]
      },
      {
        heading: 'Your Rights',
        paragraphs: [
          'You can request account deletion at any time.',
          'You can export your data by contacting support.',
          'You can opt out of non-transactional emails.'
        ]
      }
    ]
  },
  'terms-of-service': {
    title: 'Terms of Service',
    sections: [
      {
        heading: 'Acceptance of Terms',
        paragraphs: [
          'By using TrustHire, you agree to these terms.'
        ]
      },
      {
        heading: 'User Responsibilities',
        paragraphs: [
          'Provide accurate registration information.',
          'Do not create multiple accounts.',
          'Do not post misleading job listings (recruiters).',
          'Do not submit fraudulent applications (candidates).'
        ]
      },
      {
        heading: 'Challenge Fee Terms',
        paragraphs: [
          'The Challenge Fee is optional and refundable under specific conditions: rejection, timeout, or successful hire.',
          'The fee is forfeited if a candidate schedules an interview and does not attend.',
          'Refunds are processed within 5-7 business days.'
        ]
      },
      {
        heading: 'Account Termination',
        paragraphs: [
          'We reserve the right to suspend accounts that violate these terms.'
        ]
      }
    ]
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    sections: [
      {
        heading: 'What Are Cookies',
        paragraphs: [
          'Small text files stored on your device to improve your browsing experience.'
        ]
      },
      {
        heading: 'How We Use Cookies',
        paragraphs: [
          'Authentication cookies to keep you logged in.',
          'Session cookies to maintain your browsing state.',
          'We do not use third-party advertising cookies.'
        ]
      },
      {
        heading: 'Managing Cookies',
        paragraphs: [
          'You can disable cookies in your browser settings, but this may affect platform functionality.'
        ]
      }
    ]
  },
  'refund-policy': {
    title: 'Refund Policy',
    sections: [
      {
        heading: 'Challenge Fee Refund Conditions',
        paragraphs: [
          'Your Challenge Fee is automatically refunded when:',
          '- Your application is rejected by the recruiter.',
          '- Your application is not reviewed within the stipulated number of days set by the employer.',
          '- You are hired and successfully join the company.'
        ]
      },
      {
        heading: 'When the Fee Is Forfeited',
        paragraphs: [
          'Your Challenge Fee is forfeited when:',
          '- You are invited for an interview but do not attend.',
          '- You cancel an interview without valid reason (if applicable).'
        ]
      },
      {
        heading: 'Refund Processing',
        paragraphs: [
          'Refunds are processed to the original payment method.',
          'Refund timeline: 5-7 business days.',
          'Refund amount: Full fee amount, no deductions.',
          'You will receive an email confirmation when the refund is processed.'
        ]
      },
      {
        heading: 'Disputes',
        paragraphs: [
          'If you believe a refund was processed incorrectly, contact support@trusthire.in with your application ID.'
        ]
      }
    ]
  }
};
