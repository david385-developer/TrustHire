import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Twitter, Linkedin, Github, Mail
} from 'lucide-react';
import Logo from '../common/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Browse Jobs', path: '/jobs' },
      { label: 'How It Works', path: '/#how-it-works' },
      { label: 'Candidate Features', path: '/features/candidates' },
      { label: 'Employer Solutions', path: '/features/employers' }
    ],
    company: [
      { label: 'About Our Mission', path: '/about-us' },
      { label: 'Team & Careers', path: '/careers' },
      { label: 'Latest Updates', path: '/blog' },
      { label: 'Contact Support', path: '/contact' }
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Terms of Service', path: '/terms-of-service' },
      { label: 'Cookie Settings', path: '/cookie-policy' },
      { label: 'Refund Policy', path: '/refund-policy' }
    ]
  };

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
    { icon: <Mail className="w-5 h-5" />, href: '#', label: 'Email' }
  ];

  return (
    <footer className="bg-[#0F172A] py-8 md:py-10 border-t border-slate-800 font-sans text-gray-400">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Logo & About Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="scale-90 origin-left mb-4">
              <Logo variant="light" />
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              Trust-driven hiring platform bridging the gap between talent and recruiters.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-xs hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-xs hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-xs hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px]">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} TrustHire.</span>
            <span className="opacity-50">✦ Commitment-Driven Hiring</span>
          </div>

          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="hover:text-emerald-400 transition-colors"
              >
                {React.cloneElement(link.icon as React.ReactElement, { className: 'w-4 h-4' })}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
