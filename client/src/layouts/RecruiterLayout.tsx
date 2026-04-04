import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Building, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';
import Logo from '../components/common/Logo';

// ─── LogoIcon for Tablet/Collapsed View ───────────────────────────────────────
const LogoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M16 2L4 8v8c0 7.2 5.1 13.9 12 16 6.9-2.1 12-8.8 12-16V8L16 2z" 
      stroke="white" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M12 16l3 3 5-6" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const RecruiterLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsCollapsed(width >= 768 && width < 1024);
      if (width >= 1024) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: 'Overview', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Post a Job', path: '/recruiter/post-job', icon: Plus },
    { label: 'All Applications', path: '/recruiter/applications', icon: FileText },
    { label: 'Candidates', path: '/recruiter/candidates', icon: Users },
    { label: 'Company Profile', path: '/recruiter/company', icon: Building },
    { label: 'Analytics', path: '/recruiter/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/recruiter/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* ─── MOBILE SIDEBAR (Drawer) ────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-screen w-60 bg-[#0F172A] flex flex-col z-50 transform transition-transform duration-300 md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* TOP: Logo + User Info */}
        <div className="flex-shrink-0 p-3 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Logo variant="light" className="scale-75 origin-left" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white uppercase">
                {(user?.company || user?.name || 'R').charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.company || user?.name}
              </p>
              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 mt-0.5 uppercase tracking-wider">
                Recruiter
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE: Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition
                ${isActive(item.path)
                  ? 'border-l-[3px] border-[#3B82F6] bg-white/5 text-white font-medium'
                  : 'border-l-[3px] border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* BOTTOM: Logout */}
        <div className="flex-shrink-0 p-2 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* ─── DESKTOP/TABLET SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-screen flex-col z-30 transition-all duration-300
        ${isCollapsed ? 'w-14' : 'w-60'} bg-[#0F172A]`}>
        
        {isCollapsed ? (
          /* TABLET: Icons only */
          <>
            <div className="flex-shrink-0 p-2 border-b border-white/10 flex justify-center h-[57px] items-center">
              <LogoIcon className="w-6 h-6" />
            </div>
            <nav className="flex-1 py-1.5 px-1 overflow-y-auto">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center justify-center w-10 h-10 mx-auto rounded-md mb-0.5 transition
                    ${isActive(item.path)
                      ? 'bg-white/15 text-white border-l-2 border-[#3B82F6]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                </Link>
              ))}
            </nav>
            <div className="flex-shrink-0 p-2 border-t border-white/10 flex justify-center">
              <button onClick={handleLogout} title="Logout"
                className="w-10 h-10 rounded-md text-white/70 hover:bg-white/10 hover:text-white flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* DESKTOP: Full Sidebar */
          <>
            <div className="flex-shrink-0 p-3 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Logo variant="light" className="scale-75 origin-left" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white uppercase">
                    {(user?.company || user?.name || 'R').charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.company || user?.name}
                  </p>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 mt-0.5 uppercase tracking-wider">
                    Recruiter
                  </span>
                </div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition
                    ${isActive(item.path)
                      ? 'border-l-[3px] border-[#3B82F6] bg-white/5 text-white font-medium'
                      : 'border-l-[3px] border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex-shrink-0 p-2 border-t border-white/10">
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
      <div className={`flex flex-col min-h-screen transition-all duration-300
        ${isCollapsed ? 'md:ml-14' : 'md:ml-60'} ml-0`}>
        
        {/* Header / Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-md" onClick={() => setIsOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 text-slate-400 hover:text-[#3B82F6] transition-colors">
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span className="text-slate-300">/</span>
                <span>{navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</span>
              </div>
            </div>
            <h1 className="md:hidden text-sm font-semibold text-slate-800 tracking-tight">TrustHire</h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-8 w-px bg-slate-100 mx-1" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 tracking-wide uppercase">Recruiter</p>
              </div>
              <div className="relative group">
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:border-[#3B82F6] transition-colors">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap');
        
        :root {
          --font-body: 'DM Sans', sans-serif;
        }

        body {
          font-family: var(--font-body);
        }

        h1, h2, h3, .heading-font {
          font-family: var(--font-body);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default RecruiterLayout;