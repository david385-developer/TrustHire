import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  Bookmark 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';
import Logo from '../components/common/Logo';

const CandidateLayout: React.FC = () => {
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
      else if (width >= 768) setIsSidebarOpen(true); // Tablet also shows sidebar but icon-only
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
    { label: 'Applications', path: '/dashboard/applications', icon: Briefcase },
    { label: 'Saved Jobs', path: '/dashboard/saved-jobs', icon: Bookmark },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF7]" style={{
      '--dashboard-accent': '#1B4D3E',
      '--dashboard-bg': '#FAFAF7',
      '--dashboard-bg-hover': 'rgba(27, 77, 62, 0.05)',
      '--dashboard-card-radius': '12px',
      '--dashboard-badge-radius': '9999px',
      '--dashboard-button-radius': '8px',
      '--dashboard-input-radius': '8px',
      '--dashboard-card-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      '--dashboard-card-hover': '#F5F5F0',
      '--dashboard-secondary-border': '#1B4D3E',
      '--dashboard-secondary-text': '#1B4D3E'
    } as React.CSSProperties}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 ${
          isTablet ? 'w-20' : 'w-64'
        } bg-[#1B4D3E] text-white transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col shadow-xl overflow-hidden`}
      >
        <div className={`p-8 ${isTablet ? 'px-0 flex flex-col items-center' : ''}`}>
          <Logo variant="light" className={isTablet ? 'scale-75' : ''} />
          
          <div className={`mt-10 flex items-center gap-4 ${isTablet ? 'flex-col' : ''}`}>
            <div className={`${isTablet ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-white/20 flex items-center justify-center text-xl font-medium overflow-hidden border-2 border-white/30`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            {!isTablet && (
              <div>
                <p className="text-sm text-white/60">Candidate</p>
                <p className="font-medium text-lg truncate w-32">{user?.name}</p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 px-4 space-y-2 mt-4 ${isTablet ? 'px-2' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isTablet ? item.label : ''}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white text-[#1B4D3E] font-semibold' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                } ${isTablet ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#1B4D3E]' : 'text-white/60 group-hover:text-white'}`} />
                {!isTablet && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="h-px bg-white/10 mb-4 mx-4" />
          <button
            onClick={handleLogout}
            title={isTablet ? 'Logout' : ''}
            className={`flex items-center gap-3 px-8 py-4 w-full text-white/80 hover:text-white transition-colors group ${isTablet ? 'px-0 justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 text-white/60 group-hover:text-white" />
            {!isTablet && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-sm md:text-base font-semibold text-gray-800">Candidate Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display:ital@0;1&display=swap');
        
        :root {
          --font-heading: 'DM Serif Display', serif;
          --font-body: 'DM Sans', sans-serif;
        }

        body {
          font-family: var(--font-body);
        }

        h1, h2, h3, .heading-font {
          font-family: var(--font-heading);
        }
      `}</style>
    </div>
  );
};

export default CandidateLayout;