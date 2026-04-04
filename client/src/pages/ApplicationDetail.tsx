import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  IndianRupee,
  Video,
  ChevronRight,
  Shield
} from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

interface Application {
  _id: string;
  job?: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: { min: number; max: number };
    experienceRequired?: { min: number; max: number };
  };
  coverLetter?: string;
  feePaid?: boolean;
  feeAmount?: number;
  status: string;
  interview?: {
    scheduledAt?: string;
    date?: string;
    mode?: string;
    link?: string;
    notes?: string;
  };
  refundReason?: string;
  refundProcessedAt?: string;
  createdAt?: string;
  appliedAt?: string;
  resume?: string;
  refundId?: string;
}

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchApplication = async () => {
      try {
        const { data } = await api.get(`/applications/${id}`);
        if (mounted) {
          setApplication(data.data || data.application || data);
        }
      } catch (err: any) {
        if (mounted) {
          const msg = err.response?.status === 404
            ? 'Application not found'
            : err.response?.data?.message || 'Failed to load application';
          setError(msg);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) fetchApplication();
    return () => { mounted = false; };
  }, [id]);

  const safeFormatDate = (dateStr?: string) => {
    try {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return format(d, 'dd MMM, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const safeFormatSalary = (salary?: { min: number; max: number }) => {
    try {
      if (!salary || typeof salary !== 'object') {
        return 'Not disclosed';
      }
      const min = salary.min
        ? `Rs.${(salary.min / 100000).toFixed(0)}L`
        : '';
      const max = salary.max
        ? `Rs.${(salary.max / 100000).toFixed(0)}L`
        : '';
      if (min && max) return `${min} - ${max}`;
      if (min) return `${min}+`;
      return 'Not disclosed';
    } catch {
      return 'Not disclosed';
    }
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'under_review': 'bg-blue-50 text-blue-700 border-blue-200',
      'reviewed': 'bg-blue-50 text-blue-700 border-blue-200',
      'shortlisted': 'bg-green-50 text-green-700 border-green-200',
      'interview_scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
      'rejected': 'bg-red-50 text-red-700 border-red-200',
      'hired': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'Pending Review',
      'under_review': 'Under Review',
      'reviewed': 'Reviewed',
      'shortlisted': 'Shortlisted',
      'interview_scheduled': 'Interview Scheduled',
      'rejected': 'Not Selected',
      'hired': 'Hired'
    };
    return map[status] || status || 'Unknown';
  };

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getCompanyColor = (name?: string) => {
    const colors: Record<string, string> = {
      'Infosys': '#007CC3',
      'TCS': '#1A1A6C',
      'Wipro': '#341F66',
      'HCL Technologies': '#00B140',
      'Tech Mahindra': '#E31837',
      'Zoho': '#D4371A',
      'Swiggy': '#FC8019',
      'Razorpay': '#072654',
      'Flipkart': '#2874F0',
      'Cognizant': '#003366',
      'Freshworks': '#25C16F',
      'Mindtree': '#00AEEF'
    };
    return colors[name || ''] || '#1B4D3E';
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B4D3E]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 pt-16">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-gray-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <button onClick={() => navigate('/dashboard/applications')} className="text-xs text-[#1B4D3E] hover:underline">
              View All Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Application not found</p>
      </div>
    );
  }

  const job = application.job || { title: 'Job Title', company: 'Company', location: 'N/A', type: 'N/A' };
  const status = application.status || 'pending';
  const companyName = job.company || 'Company';
  const initials = getInitials(companyName);
  const bgColor = getCompanyColor(companyName);

  return (
    <div className="h-screen flex flex-col bg-gray-50 pt-16">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusStyle(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-3">

          {/* Job info */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: bgColor, color: '#fff' }}
              >
                <span className="text-[10px] font-bold">{initials}</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">{job.title}</h1>
                <p className="text-xs text-gray-500">{companyName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.location && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
              )}
              {job.type && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  <Briefcase className="w-3 h-3" /> {job.type}
                </span>
              )}
              {job.salary && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  <IndianRupee className="w-3 h-3" /> {safeFormatSalary(job.salary)}
                </span>
              )}
              {job.experienceRequired && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  <Clock className="w-3 h-3" /> {job.experienceRequired.min || 0}-{job.experienceRequired.max || 0} yrs
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Application Timeline</h3>
            <div className="space-y-2">
              {/* Applied */}
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-900 font-medium">Applied</p>
                  <p className="text-[10px] text-gray-500">{safeFormatDate(application.createdAt || application.appliedAt)}</p>
                </div>
              </div>

              {/* Reviewed */}
              {status !== 'pending' && status !== 'rejected' && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-900 font-medium">Reviewed</p>
                    <p className="text-[10px] text-gray-500">Recruiter viewed your application</p>
                  </div>
                </div>
              )}

              {/* Shortlisted */}
              {(status === 'shortlisted' || status === 'interview_scheduled' || status === 'hired') && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-900 font-medium">Shortlisted</p>
                    <p className="text-[10px] text-gray-500">Recruiter shortlisted you</p>
                  </div>
                </div>
              )}

              {/* Interview */}
              {status === 'interview_scheduled' && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-900 font-medium">Interview Scheduled</p>
                    <p className="text-[10px] text-gray-500">Check details below</p>
                  </div>
                </div>
              )}

              {/* Rejected */}
              {status === 'rejected' && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-900 font-medium">Not Selected</p>
                    <p className="text-[10px] text-gray-500">Recruiter moved forward with others</p>
                  </div>
                </div>
              )}

              {/* Hired */}
              {status === 'hired' && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-900 font-medium">Hired!</p>
                    <p className="text-[10px] text-gray-500">Congratulations!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interview details */}
          {application.interview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-blue-800 mb-1.5 uppercase tracking-wider font-bold">Interview Details</h3>
              <div className="space-y-1 text-[11px] text-blue-700">
                {(application.interview.date || application.interview.scheduledAt) && (
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {safeFormatDate(application.interview.date || application.interview.scheduledAt)}
                  </p>
                )}
                {application.interview.mode && (
                  <p className="flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    {application.interview.mode}
                  </p>
                )}
                {application.interview.link && (
                  <a href={application.interview.link} target="_blank" rel="noopener noreferrer" className="text-[#1B4D3E] font-bold hover:underline flex items-center gap-1 mt-1">
                    Join Interview <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Fee */}
          {application.feePaid && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Challenge Fee Status
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-700">Rs.{application.feeAmount || 0} paid</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-bold uppercase tracking-wider">
                  {application.refundId ? 'Refunded' : status === 'hired' ? 'Refunding' : 'Paid'}
                </span>
              </div>
            </div>
          )}

          {/* Cover letter */}
          {application.coverLetter && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-900 mb-1.5">Your Cover Letter / Pitch</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line italic">
                "{application.coverLetter}"
              </p>
            </div>
          )}

          {/* Resume */}
          {application.resume && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Attached Resume</h3>
              <a href={application.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-[#1B4D3E] font-bold hover:underline transition-all ring-1 ring-[#1B4D3E]/10 p-2 rounded-md bg-gray-50 w-full group">
                <FileText className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                View Submitted Resume <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const ExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

export default ApplicationDetail;
