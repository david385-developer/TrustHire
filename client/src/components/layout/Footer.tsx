import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Twitter, Linkedin, Github, Mail, 
  ChevronRight, ExternalLink, Shield,
  Globe, Phone, MapPin, Heart
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
    <footer className="bg-[#0F172A] text-slate-400 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Logo & About Column */}
          <div className="lg:col-span-4">
            <Logo variant="light" className="mb-6" />
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
              TrustHire is the world's first commitment-driven job platform. We bridge the trust gap between genuine talent and top-tier recruiters using our unique Challenge Fee system.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-emerald-500 hover:text-white transition-all text-slate-300"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Product
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-bold text-white mb-6 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Get in Touch
            </h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500/50 flex-shrink-0 mt-1" />
                <span className="text-sm">123 Innovation Drive, Silicon Valley, CA 94025, United States</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500/50 flex-shrink-0" />
                <span className="text-sm">hello@trusthire.com</span>
              </li>
            </ul>
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">Priority Support</p>
              <p className="text-sm text-slate-300">Our team is available 24/7 for recruiters and priority candidates.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} TrustHire.</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in innovation.
            </span>
          </div>

          <ul className="flex flex-wrap justify-center gap-6">
            {footerLinks.legal.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
