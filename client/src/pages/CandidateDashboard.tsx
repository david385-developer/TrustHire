import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Clock, 
  IndianRupee, 
  Zap, MapPin, ExternalLink, Calendar,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import AnimatedPage from '../components/common/AnimatedPage';

interface Application {
  _id: string;
  job?: {
    _id: string;
    title: string;
    company: string;
    location: string;
    isActive?: boolean;
  };
  status: string;
  appliedAt: string;
  feePaid: boolean;
  feeAmount: number;
}

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await api.get('/applications/my');
        setApplications(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error: any) {
        setApplications([]);
        toast.error(error.response?.data?.message || 'Failed to load candidate dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const activeStatuses = ['applied', 'under_review', 'interview_scheduled', 'interview_completed', 'shortlisted'];
  
  const recentApplications = useMemo(
    () => [...applications]
      .filter((app) => app.job)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5),
    [applications]
  );

  const profileChecks = [
    Boolean(user?.phone), 
    Boolean(user?.resume), 
    Boolean(user?.skills?.length), 
    Boolean(user?.summary || user?.bio)
  ];
  const profileCompletion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100);

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: Briefcase, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'In Progress', value: applications.filter(a => activeStatuses.includes(a.status)).length, icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Fees Refundable / Paid', value: `₹${applications.reduce((sum, a) => sum + (a.feeAmount || 0), 0).toLocaleString()}`, icon: IndianRupee, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'applied': case 'interview_scheduled': return 'warning';
      case 'under_review': case 'shortlisted': return 'info';
      case 'hired': case 'joined': case 'fee_refunded': return 'success';
      case 'rejected': case 'fee_forfeited': case 'interview_no_show': return 'danger';
      default: return 'default';
    }
  };

  // Generate monthly chart data
  const chartData = useMemo(() => {
    const data: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      data[`${months[m.getMonth()]} ${m.getFullYear().toString().slice(-2)}`] = 0;
    }

    applications.forEach(app => {
      const date = new Date(app.appliedAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      if (key in data) {
        data[key]++;
      }
    });

    return Object.keys(data).map(key => ({
      name: key,
      applications: data[key]
    }));
  }, [applications]);

  return (
    <AnimatedPage>
      <div className="space-y-6">
        
        {/* Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here's what is happening with your job applications today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/jobs"
              className="btn-primary shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Briefcase className="w-4 h-4" /> Find Jobs
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 leading-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dash Board Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Visuals/Applications Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Recharts Analytics Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Application Trend</h3>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--surface)', 
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Applications List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Applications</h2>
                <Link to="/dashboard/applications" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  View All Tracking Board
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 skeleton-shimmer" />
                  ))
                ) : recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <div 
                      key={app._id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-base group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
                            {app.job?.company?.charAt(0) || 'J'}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {app.job?.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{app.job?.company}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.job?.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <Badge variant={getStatusVariant(app.status)} className="capitalize px-3 py-1 rounded-lg font-semibold text-xs tracking-wide">
                            {app.status.replace(/_/g, ' ')}
                          </Badge>
                          <button
                            onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState 
                    title="No applications yet" 
                    description="Start your job search journey by applying to premium jobs." 
                    action={<Link to="/jobs"><Button variant="primary">Start Browsing</Button></Link>} 
                    compact 
                  />
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Strength Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-800/40">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-base">Profile Strength</h3>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{profileCompletion}% Complete</span>
                </div>
                <div className="overflow-hidden h-2 flex rounded-full bg-white/10">
                  <div style={{ width: `${profileCompletion}%` }} className="bg-indigo-500 rounded-full transition-all duration-1000"></div>
                </div>
              </div>

              <Link to="/dashboard/profile" className="block">
                <button className="w-full py-3 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                  Update Profile <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Next Career Step Hint */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Calendar className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Next Career Step</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {applications.some((app) => activeStatuses.includes(app.status))
                  ? 'Recruiters are currently reviewing your qualifications. Keep your notifications active for interview requests.'
                  : 'Get noticed faster. Apply to jobs with a refundable Challenge Fee to prioritize your application and guarantee recruiter response within days.'}
              </p>
            </div>

          </div>

        </div>

      </div>
    </AnimatedPage>
  );
};

export default CandidateDashboard;
