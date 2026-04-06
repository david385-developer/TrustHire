import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, LogOut, LayoutDashboard, PlusCircle, 
  Briefcase, HelpCircle, Building, Bell,
  ChevronDown, Settings, LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Journal', path: '/blog', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'How It Works', path: '/#how-it-works', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'For Employers', path: '/#for-employers', icon: <Building className="w-4 h-4" /> }
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 flex items-center ${
          isScrolled ? 'bg-white shadow-sm border-b' : 'bg-white/95 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo variant="dark" className="scale-90 sm:scale-100" />

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-hover)] rounded-full transition-all font-medium text-sm"
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <button className="flex items-center gap-2 px-5 py-2 text-sm font-semibold border-2 border-[var(--primary)] text-[var(--primary)] rounded-full hover:bg-[var(--primary)] hover:text-white transition-all">
                      <LogIn className="w-4 h-4" />
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] shadow-lg shadow-emerald-900/10 transition-all">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <button className="relative p-2 text-slate-500 hover:text-[var(--primary)] hover:bg-slate-100 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-[var(--primary)] hover:bg-slate-50 transition-all"
                    >
                      <div className="w-8 h-8 bg-emerald-100 text-[var(--primary)] rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-emerald-50">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-slate-100 animate-scaleIn origin-top-right overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                          <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--text-primary)] truncate text-sm">{user?.name}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                          </div>
                        </div>
                        
                        <div className="p-1">
                          <Link
                            to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          {user?.role === 'recruiter' && (
                            <Link
                              to="/recruiter/post-job"
                              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Post a Job
                            </Link>
                          )}
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors text-sm font-medium"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                        </div>

                        <div className="p-1 border-t border-slate-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors text-sm font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Moved outside nav to avoid clipping) */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
          isMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Drawer Panel */}
        <div 
          className={`absolute top-0 left-0 bottom-0 w-[280px] bg-[#0F3D2E] text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Logo variant="light" className="scale-90" />
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Navigation</p>
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
            
            <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full">
                    <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all font-bold">
                      <LogIn className="w-5 h-5" />
                      Login
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full">
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-lg shadow-emerald-500/20">
                      <UserPlus className="w-5 h-5" />
                      Sign Up
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="px-4 pb-4">
                    <p className="font-bold text-lg text-emerald-400 truncate">{user?.name}</p>
                    <p className="text-xs text-white/50 truncate">{user?.email}</p>
                  </div>
                  
                  <Link
                    to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>

                  {user?.role === 'recruiter' && (
                    <Link
                      to="/recruiter/post-job"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium text-emerald-400"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Post a Job
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
