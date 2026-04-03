import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Briefcase, CheckCircle2, Clock, 
  IndianRupee, TrendingUp, ChevronRight,
  Zap, MapPin, ExternalLink, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

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

  const profileChecks = [Boolean(user?.phone), Boolean(user?.resume), Boolean(user?.skills?.length), Boolean(user?.summary || user?.bio)];
  const profileCompletion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100);

  const stats = [
    { label: 'Applications', value: applications.length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'In Progress', value: applications.filter(a => activeStatuses.includes(a.status)).length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Fees Paid', value: `₹${applications.reduce((sum, a) => sum + (a.feeAmount || 0), 0).toLocaleString()}`, icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50' }
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

  return (
    <div className="space-y-10 animate-fadeUp">
      {/* Greeting Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 heading-font">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Track your applications and manage your job search
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/jobs" 
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-[#1B4D3E] text-white rounded-xl hover:bg-[#0F3D2E] transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            Find Jobs
          </Link>
          <Link 
            to="/dashboard/applications" 
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all active:scale-95"
          >
            My Applications
          </Link>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-fadeUp" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" />
                Live Tracking
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Applications List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-bold heading-font text-slate-900">Recent Applications</h2>
            <Link to="/dashboard/applications" className="group text-emerald-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              View Tracking Board <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white border border-slate-100 rounded-3xl animate-pulse" />)
            ) : recentApplications.length > 0 ? (
              recentApplications.map((app, idx) => (
                <div key={app._id} className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group group animate-fadeUp" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-6 flex-shrink-0">
                        {app.job?.company?.charAt(0) || 'J'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate pr-4 group-hover:text-emerald-600 transition-colors">{app.job?.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{app.job?.company}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.job?.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Badge variant={getStatusVariant(app.status)} className="capitalize hidden md:inline-flex px-4 py-1.5 rounded-xl font-bold text-[10px] tracking-wider">
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                      <Link to={`/dashboard/applications/${app._id}`} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No applications yet" description="Start your journey by applying to premium jobs." action={<Link to="/jobs"><Button variant="primary">Start Browsing</Button></Link>} compact />
            )}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-emerald-900 text-white rounded-[40px] p-8 relative overflow-hidden group shadow-2xl shadow-emerald-900/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10"><Zap className="w-5 h-5 text-emerald-400" /></div>
                <h3 className="font-bold text-lg">Profile Completion</h3>
              </div>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">A stronger profile improves recruiter response rates and unlocks premium visibility features.</p>
              
              <div className="relative pt-1 mb-8">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-bold inline-block text-emerald-400 uppercase tracking-widest">{profileCompletion}% Strength</span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/10">
                  <div style={{ width: `${profileCompletion}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 rounded-full transition-all duration-1000"></div>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {[
                  { check: user?.phone, label: "Phone Verified" },
                  { check: user?.resume, label: "Resume Uploaded" },
                  { check: user?.skills?.length, label: "Skills Identified" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${item.check ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className={item.check ? 'text-white' : 'text-white/40'}>{item.label}</span>
                  </div>
                ))}
              </div>

              <Link to="/dashboard/profile">
                <button className="w-full py-4 bg-white text-emerald-900 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                  Update Profile <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Next Career Step</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {applications.some((app) => activeStatuses.includes(app.status))
                ? 'Keep an eye on notifications for recruiter updates and live interview requests.'
                : 'Apply to a few high-fit roles and set specific job alerts to catch new opportunities early.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
