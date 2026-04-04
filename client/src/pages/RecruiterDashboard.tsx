import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, PlusCircle, Users, Eye,
  ChevronRight, BarChart3, Clock, MapPin, UserCheck
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

  const stats = [
    { label: 'Active Postings', value: jobs.filter(j => j.isActive).length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Applicants', value: jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Priority Talent', value: jobs.reduce((sum, j) => sum + (j.priorityCount || 0), 0), icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Platform Reach', value: jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="p-4 md:p-6 h-screen flex flex-col space-y-4 overflow-hidden">
      {/* Header & Main Actions */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Recruiter Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/recruiter/analytics" className="hidden md:block px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </Link>
          <Link to="/recruiter/post-job"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#2563EB] text-white rounded-md hover:bg-blue-700 transition-all">
            <PlusCircle className="w-3.5 h-3.5" />
            Post Job
          </Link>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm transition-all group">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
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
        {/* Active Jobs List */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">Active Postings</h2>
            <Link to="/recruiter/applications" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View All Pipeline
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {loading ? (
              [1, 2, 3].map(i => <div key={`job-skeleton-${i}`} className="h-20 bg-white border border-gray-100 rounded-lg animate-pulse" />)
            ) : activeJobs.length > 0 ? (
              activeJobs.map((job) => (
                <div key={job._id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 mr-2">
                      {job.title}
                    </h3>
                    <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(job.createdAt), 'MMM dd')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        {job.applicationCount || 0} Apps
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-amber-500" />
                        {job.priorityCount || 0} Priority
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link to={`/recruiter/jobs/${job._id}/applications`} className="text-[10px] px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        View
                      </Link>
                      <Link to={`/recruiter/jobs/${job._id}/edit`} className="text-[10px] px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-900 mb-1">No active job listings</h3>
                <Link to="/recruiter/post-job" className="inline-block text-xs px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all">
                  Create Job Post
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Components */}
        <div className="lg:col-span-4 space-y-4 flex flex-col min-h-0">
          <div className="bg-slate-900 text-white rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm">Talent Discovery</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">Identify top candidates across all your live roles in one unified view.</p>
            <Link to="/recruiter/candidates" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              Browse Talent <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Interviews</h3>
              </div>
              <Link to="/recruiter/applications" className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">All</Link>
            </div>
            
            <div className="space-y-2 overflow-y-auto pr-1">
              {loading ? (
                [1, 2].map(i => <div key={`interview-skeleton-${i}`} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)
              ) : upcomingInterviews.length > 0 ? (
                upcomingInterviews.map(app => (
                  <Link key={app._id} to={`/recruiter/jobs/${app.job?._id}/applications`} className="block">
                    <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                      <p className="text-xs font-bold text-gray-900 mb-1 truncate group-hover:text-emerald-900">{app.candidate?.name || 'Anonymous'}</p>
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className="truncate max-w-[100px]">{app.job?.title}</span>
                        <span className="text-blue-500 flex-shrink-0">{format(new Date(app.interview?.scheduledAt || ''), 'MMM dd')}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No pending interviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
