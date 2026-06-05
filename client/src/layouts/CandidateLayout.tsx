import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Bookmark, 
  Settings, 
  LogOut, 
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';

const LogoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M16 2L4 8v8c0 7.2 5.1 13.9 12 16 6.9-2.1 12-8.8 12-16V8L16 2z" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M12 16l3 3 5-6" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CandidateLayout: React.FC = () => {
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
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/profile', label: 'My Profile', icon: User },
    { path: '/dashboard/applications', label: 'Applications', icon: Briefcase },
    { path: '/dashboard/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium select-none">
        <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">Dashboard</Link>
        {paths.map((p, i) => {
          if (p === 'dashboard') return null;
          const isLast = i === paths.length - 1;
          const display = p.replace(/-/g, ' ');
          return (
            <React.Fragment key={i}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {isLast ? (
                <span className="capitalize text-slate-800 dark:text-slate-200 font-semibold">{display}</span>
              ) : (
                <Link to={`/dashboard/${p}`} className="capitalize hover:text-indigo-600 dark:hover:text-indigo-400">{display}</Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body transition-colors duration-300">
      
      {/* MOBILE SIDEBAR (Drawer) */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-950 dark:bg-slate-900 border-r border-slate-900 flex flex-col z-50 transform transition-transform duration-300 md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* TOP: Logo + User Info */}
        <div className="flex-shrink-0 p-4 border-b border-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Logo variant="light" className="scale-90 origin-left" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name}
              </p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                Candidate
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE: Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all
                ${isActive(item.path)
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* BOTTOM: Logout */}
        <div className="flex-shrink-0 p-3 border-t border-slate-900">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-900 hover:text-white transition-all font-semibold"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* DESKTOP/TABLET SIDEBAR */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-screen flex-col z-30 transition-all duration-300 border-r border-slate-200 dark:border-slate-800
        ${isCollapsed ? 'w-16' : 'w-64'} bg-slate-950 dark:bg-slate-900`}>
        
        {isCollapsed ? (
          /* TABLET: Icons only */
          <>
            <div className="flex-shrink-0 p-2 border-b border-slate-900 flex justify-center h-16 items-center">
              <LogoIcon className="w-6 h-6 text-indigo-500" />
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all
                    ${isActive(item.path)
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              ))}
            </nav>
            <div className="flex-shrink-0 p-2 border-t border-slate-900 flex justify-center">
              <button onClick={handleLogout} title="Logout"
                className="w-12 h-12 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* DESKTOP: Full Sidebar */
          <>
            <div className="flex-shrink-0 p-4 border-b border-slate-900 h-16 flex items-center">
              <Logo variant="light" className="scale-90 origin-left" />
            </div>
            <div className="p-4 border-b border-slate-900/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                  Job Seeker
                </span>
              </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all
                    ${isActive(item.path)
                      ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex-shrink-0 p-3 border-t border-slate-900">
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-900 hover:text-white transition-all font-semibold"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex flex-col min-h-screen transition-all duration-300
        ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} ml-0`}>
        
        {/* Header / Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" onClick={() => setIsOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              {getBreadcrumbs()}
            </div>
            <div className="md:hidden">
              <Logo />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1" />
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Candidate</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
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

    </div>
  );
};

export default CandidateLayout;