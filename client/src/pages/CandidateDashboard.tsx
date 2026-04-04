import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Briefcase, Clock, 
  IndianRupee, 
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
    <div className="p-4 md:p-6 h-screen flex flex-col space-y-4 overflow-hidden animate-fadeUp">
      {/* Greeting Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-gray-500">
            Track your applications and manage your job search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/jobs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E] transition-all">
            <Briefcase className="w-3.5 h-3.5" />
            Find Jobs
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm transition-all group">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Recent Applications List */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/dashboard/applications" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Tracking Board
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-white border border-gray-100 rounded-lg animate-pulse" />)
            ) : recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div key={app._id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 font-bold text-sm group-hover:bg-emerald-500 group-hover:text-white transition-all flex-shrink-0">
                        {app.job?.company?.charAt(0) || 'J'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate pr-2 group-hover:text-emerald-600 transition-colors">{app.job?.title}</h3>
                        <div className="flex items-center gap-3 mt-0.5 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.job?.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job?.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={getStatusVariant(app.status)} className="capitalize px-2 py-0.5 rounded font-bold text-[9px] tracking-wider">
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                      <Link to={`/dashboard/applications/${app._id}`} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-all">
                        <ArrowRight className="w-4 h-4" />
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
        <div className="lg:col-span-4 space-y-4 flex flex-col min-h-0">
          <div className="bg-emerald-900 text-white rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm">Profile Strength</h3>
            </div>
            
            <div className="relative pt-1 mb-4">
              <div className="flex mb-1 items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{profileCompletion}% Complete</span>
              </div>
              <div className="overflow-hidden h-1.5 flex rounded-full bg-white/10">
                <div style={{ width: `${profileCompletion}%` }} className="bg-emerald-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>

            <Link to="/dashboard/profile">
              <button className="w-full py-2 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                Update Profile <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-gray-900 text-[10px] uppercase tracking-widest">Next Career Step</h3>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              {applications.some((app) => activeStatuses.includes(app.status))
                ? 'Keep an eye on notifications for recruiter updates.'
                : 'Apply to high-fit roles and set specific job alerts.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
