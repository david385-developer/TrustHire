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
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';
import Logo from '../components/common/Logo';

const RecruiterLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      if (width >= 1024) setIsSidebarOpen(true);
      else if (width >= 768) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
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

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]" style={{
      '--dashboard-accent': '#2563EB',
      '--dashboard-bg': '#F8FAFC',
      '--dashboard-bg-hover': 'rgba(37, 99, 235, 0.05)',
      '--dashboard-card-radius': '8px',
      '--dashboard-badge-radius': '6px',
      '--dashboard-button-radius': '6px',
      '--dashboard-input-radius': '6px',
      '--dashboard-card-shadow': 'none',
      '--dashboard-card-border': '1px solid #E2E8F0',
      '--dashboard-card-hover': '#F1F5F9',
      '--dashboard-secondary-border': '#E2E8F0',
      '--dashboard-secondary-text': '#475569'
    } as React.CSSProperties}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 ${
          isTablet ? 'w-20' : 'w-64'
        } bg-[#0F172A] text-slate-400 transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col shadow-2xl overflow-hidden`}
      >
        <div className={`p-6 h-16 flex items-center border-b border-slate-800 ${isTablet ? 'justify-center px-0' : ''}`}>
          <Logo variant="light" className={isTablet ? 'scale-75' : ''} />
        </div>

        <div className="p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isTablet ? item.label : ''}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group relative ${
                    isActive 
                      ? 'text-white bg-slate-800/50 font-medium border-l-2 border-[#3B82F6]' 
                      : 'hover:text-white hover:bg-slate-800/30'
                  } ${isTablet ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#2563EB]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {!isTablet && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800 space-y-4">
          <button
            onClick={handleLogout}
            title={isTablet ? 'Logout' : ''}
            className={`flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:text-white transition-colors group rounded hover:bg-slate-800/30 ${isTablet ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
            {!isTablet && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 text-sm text-slate-500 font-medium">
              <span className="text-slate-300">/</span>
              <span>{navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
              <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold group-hover:border-[#2563EB] transition-colors">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        
        :root {
          --font-heading: 'DM Sans', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        body {
          font-family: var(--font-body);
        }

        h1, h2, h3, .heading-font {
          font-family: var(--font-heading);
          font-weight: 700;
        }

        .text-3xl {
          font-weight: 700;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
};

export default RecruiterLayout;