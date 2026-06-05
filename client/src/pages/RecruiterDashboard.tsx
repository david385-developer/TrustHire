import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, PlusCircle, Users, Eye,
  ChevronRight, BarChart3, Clock, MapPin, UserCheck, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AnimatedPage from '../components/common/AnimatedPage';

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  applicationCount: number;
  priorityCount: number;
  shortlistedCount: number;
  interviewCount: number;
  viewCount: number;
  experienceRequired: { min: number; max: number };
}

interface RecruiterApplication {
  _id: string;
  status: string;
  appliedAt: string;
  candidate?: { name?: string };
  job?: { _id: string; title: string };
  interview?: { scheduledAt?: string };
}

const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get('/jobs/my-posts'),
          api.get('/applications/recruiter/all')
        ]);
        if (mounted) {
          setJobs(Array.isArray(jobsResponse.data?.data) ? jobsResponse.data.data : []);
          setApplications(Array.isArray(applicationsResponse.data?.data) ? applicationsResponse.data.data : []);
        }
      } catch (error: any) {
        if (mounted) {
          setJobs([]);
          setApplications([]);
          toast.error(error.response?.data?.message || 'Failed to load recruiter dashboard');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const activeJobs = useMemo(() => jobs.filter(j => j.isActive).slice(0, 5), [jobs]);
  const upcomingInterviews = useMemo(
    () => applications
      .filter(a => a.status === 'interview_scheduled' && a.interview?.scheduledAt)
      .sort((a, b) => new Date(a.interview?.scheduledAt || 0).getTime() - new Date(b.interview?.scheduledAt || 0).getTime())
      .slice(0, 4),
    [applications]
  );

  const formatExperience = (exp: any) => {
    if (!exp) return '0 yrs';
    const min = exp.min ?? 0;
    const max = exp.max ?? 0;
    if (min === 0 && max === 0) return 'Fresher';
    if (min === max) return `${min} yrs`;
    return `${min}-${max} yrs`;
  };

  const stats = [
    { label: 'Active Postings', value: jobs.filter(j => j.isActive).length, icon: Briefcase, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Total Applicants', value: jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0), icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Priority Talent', value: jobs.reduce((sum, j) => sum + (j.priorityCount || 0), 0), icon: UserCheck, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Platform Reach', value: jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0), icon: Eye, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' }
  ];

  // Recharts Bar Data: compare applications vs priority
  const chartData = useMemo(() => {
    return jobs.slice(0, 5).map(job => ({
      name: job.title.length > 15 ? `${job.title.slice(0, 15)}...` : job.title,
      'Total Apps': job.applicationCount || 0,
      'Priority Apps': job.priorityCount || 0
    }));
  }, [jobs]);

  return (
    <AnimatedPage>
      <div className="space-y-6">
        
        {/* Header & Main Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recruiter Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {user?.name}. Manage your openings and candidate reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/recruiter/analytics" 
              className="btn-outline px-4 py-2.5 text-xs flex items-center gap-2 transition-all font-semibold"
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </Link>
            <Link 
              to="/recruiter/post-job"
              className="btn-primary px-4 py-2.5 text-xs flex items-center gap-2 transition-all font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Post Job
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 leading-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Recharts Analytics Panel */}
            {jobs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pipeline Summary (Top 5 Jobs)</h3>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--surface)', 
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                      <Bar dataKey="Total Apps" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
                      <Bar dataKey="Priority Apps" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Active Jobs List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Postings</h2>
                <Link to="/recruiter/applications" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  View All Pipelines
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={`job-skeleton-${i}`} className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 skeleton-shimmer" />
                  ))
                ) : activeJobs.length > 0 ? (
                  activeJobs.map((job) => (
                    <div 
                      key={job._id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              {formatExperience(job.experienceRequired)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {format(new Date(job.createdAt), 'MMM dd')}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-bold uppercase tracking-wider flex-shrink-0">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            {job.applicationCount || 0} Applicants
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                            {job.priorityCount || 0} Priority
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/recruiter/jobs/${job._id}/applications`} 
                            className="text-[11px] px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                          >
                            Pipeline
                          </Link>
                          <Link 
                            to={`/recruiter/edit-job/${job._id}`} 
                            className="text-[11px] px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No active job listings</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Post a job opening to start receiving priority verified applications.</p>
                    <Link to="/recruiter/post-job" className="btn-primary text-xs py-2 px-4 shadow-none">
                      Create Job Post
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Components */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Talent Discovery Promo */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Talent Discovery</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">Unified tracking system to search and sort candidate profiles who applied to your jobs.</p>
              <Link to="/recruiter/candidates" className="block">
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/10">
                  Browse Talent Pool <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Interviews Scheduled Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-0">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Interviews</h3>
                </div>
                <Link to="/recruiter/applications" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">All</Link>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-1">
                {loading ? (
                  [1, 2].map(i => <div key={`interview-skeleton-${i}`} className="h-16 bg-slate-50 dark:bg-slate-950 rounded-xl animate-pulse" />)
                ) : upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map(app => (
                    <Link key={app._id} to={`/recruiter/jobs/${app.job?._id}/applications`} className="block group">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all duration-300">
                        <p className="text-xs font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {app.candidate?.name || 'Anonymous Candidate'}
                        </p>
                        <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="truncate max-w-[120px]">{app.job?.title}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{format(new Date(app.interview?.scheduledAt || ''), 'MMM dd, hh:mm a')}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No pending interviews</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </AnimatedPage>
  );
};

export default RecruiterDashboard;
