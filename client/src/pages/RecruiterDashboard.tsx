import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, Eye, FileText, PlusCircle, 
  TrendingUp, UserCheck, Users, SearchCheck, 
  ChevronRight, ArrowUpRight, BarChart3, Clock,
  MapPin, ShieldCheck, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get('/jobs/my-posts'),
          api.get('/applications/recruiter/all')
        ]);
        setJobs(Array.isArray(jobsResponse.data?.data) ? jobsResponse.data.data : []);
        setApplications(Array.isArray(applicationsResponse.data?.data) ? applicationsResponse.data.data : []);
      } catch (error: any) {
        setJobs([]);
        setApplications([]);
        toast.error(error.response?.data?.message || 'Failed to load recruiter dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const activeJobs = useMemo(() => jobs.filter(j => j.isActive).slice(0, 5), [jobs]);
  const upcomingInterviews = useMemo(
    () => applications
      .filter(a => a.status === 'interview_scheduled' && a.interview?.scheduledAt)
      .sort((a, b) => new Date(a.interview?.scheduledAt || 0).getTime() - new Date(b.interview?.scheduledAt || 0).getTime())
      .slice(0, 4),
    [applications]
  );

  const stats = [
    { label: 'Active Postings', value: jobs.filter(j => j.isActive).length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Applicants', value: jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Priority Talent', value: jobs.reduce((sum, j) => sum + (j.priorityCount || 0), 0), icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Platform Reach', value: jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="space-y-10 animate-fadeUp">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold mb-4 uppercase tracking-widest border border-emerald-100">
            <Zap className="w-3 h-3" />
            Recruiter Insights
          </div>
          <h1 className="text-4xl font-bold text-slate-900 heading-font mb-2 leading-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 font-medium text-lg">You have <span className="text-emerald-600 font-bold">{jobs.filter(j => j.isActive).length} active roles</span> live. Your pipeline is looking healthy.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/recruiter/analytics">
            <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <BarChart3 className="w-5 h-5" /> Analytics
            </button>
          </Link>
          <Link to="/recruiter/post-job">
            <button className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95">
              <PlusCircle className="w-5 h-5" /> Post New Job
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-fadeUp" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3 shadow-sm`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" /> Live
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Active Jobs List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-bold heading-font text-slate-900">Active Postings</h2>
            <Link to="/recruiter/applications" className="group text-emerald-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Comprehensive Pipeline <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-slate-100 rounded-3xl animate-pulse" />)
            ) : activeJobs.length > 0 ? (
              activeJobs.map((job, idx) => (
                <div key={job._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group animate-fadeUp" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex flex-1 items-start gap-6 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-6 flex-shrink-0">
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-500" />{job.location}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" />{job.type}</span>
                          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-500" />Priority Search</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 xl:gap-14 text-center border-t xl:border-t-0 pt-8 xl:pt-0 border-slate-50">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{job.applicationCount || 0}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-500">{job.priorityCount || 0}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Priority</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">{job.shortlistedCount || 0}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shorlisted</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <Link to={`/recruiter/jobs/${job._id}/applications`} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm">
                          <ArrowUpRight className="w-6 h-6" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No active job listings</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start recruiting by posting your first role with the optional Priority Challenge Fee.</p>
                <Link to="/recruiter/post-job">
                  <button className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all">Create Job Post</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Components */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 text-white rounded-[40px] p-10 relative overflow-hidden group shadow-2xl shadow-slate-900/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-sm"><Users className="w-6 h-6 text-blue-500" /></div>
                <h3 className="font-bold text-xl">Talent Discovery</h3>
              </div>
              <p className="text-slate-400 text-base leading-relaxed mb-10 font-medium">Identify top candidates across all your live roles in one unified view. Priority candidates are automatically surfaced first.</p>
              
              <div className="space-y-4 mb-12">
                {[
                  { icon: <UserCheck className="w-4 h-4" />, label: "Shortlisted Tracking" },
                  { icon: <FileText className="w-4 h-4" />, label: "Resume Analysis" },
                  { icon: <SearchCheck className="w-4 h-4" />, text: "Direct Outreach" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/recruiter/candidates">
                <button className="w-full py-4.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-900/20">
                  Browse Candidates <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">Interviews</h3>
              </div>
              <Link to="/recruiter/applications" className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">View All</Link>
            </div>
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl mb-3 animate-pulse" />)
            ) : upcomingInterviews.length > 0 ? (
              <div className="space-y-4">
                {upcomingInterviews.map(app => (
                  <Link key={app._id} to={`/recruiter/jobs/${app.job?._id}/applications`}>
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-[28px] hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                      <p className="text-sm font-bold text-slate-900 mb-2 truncate group-hover:text-emerald-900">{app.candidate?.name || 'Anonymous'}</p>
                      <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="truncate max-w-[80px]">{app.job?.title}</span>
                        <span className="text-blue-500">{format(new Date(app.interview?.scheduledAt || ''), 'MMM dd · HH:mm')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">No pending interviews</p>
                <p className="text-[10px] text-slate-400 leading-tight">Shortlist candidates to start scheduling sessions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
