import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, Clock, Loader2,
  CheckCircle, XCircle, AlertCircle, Calendar
} from 'lucide-react';
import api from '../../services/api';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchApp = async () => {
      try {
        const { data } = await api.get(`/applications/${id}`);
        if (mounted) {
          setApplication(data.data || data.application || data);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.response?.status === 404
            ? 'Application not found'
            : err.response?.data?.message || 'Failed to load application');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchApp();
    return () => { mounted = false; };
  }, [id]);

  const fmtDate = (d: any) => {
    try {
      if (!d) return 'N/A';
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? 'N/A' :
        dt.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return 'N/A'; }
  };

  const fmtSalary = (s: any) => {
    try {
      if (!s || typeof s !== 'object') return 'N/A';
      const min = s.min ? `Rs.${(s.min/100000).toFixed(0)}L` : '';
      const max = s.max ? `Rs.${(s.max/100000).toFixed(0)}L` : '';
      if (min && max) return `${min} - ${max}`;
      if (min) return `${min}+`;
      return 'N/A';
    } catch { return 'N/A'; }
  };

  const statusStyle: Record<string, string> = {
    'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'reviewed': 'bg-blue-50 text-blue-700 border-blue-200',
    'shortlisted': 'bg-green-50 text-green-700 border-green-200',
    'interview_scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
    'rejected': 'bg-red-50 text-red-700 border-red-200',
    'hired': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const statusLabel: Record<string, string> = {
    'pending': 'Pending Review',
    'reviewed': 'Reviewed',
    'shortlisted': 'Shortlisted',
    'interview_scheduled': 'Interview Scheduled',
    'rejected': 'Not Selected',
    'hired': 'Hired'
  };

  const getInitials = (name: any) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const getBgColor = (name: any) => {
    const c: Record<string, string> = {
      'Infosys':'#007CC3','TCS':'#1A1A6C','Wipro':'#341F66',
      'HCL Technologies':'#00B140','Tech Mahindra':'#E31837',
      'Zoho':'#D4371A','Swiggy':'#FC8019','Razorpay':'#072654',
      'Flipkart':'#2874F0','Cognizant':'#003366',
      'Freshworks':'#25C16F','Mindtree':'#00AEEF'
    };
    return c[name] || '#1B4D3E';
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-6 h-6 animate-spin text-[#1B4D3E]" />
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
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

  if (!application) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Application not found</p>
    </div>
  );

  const job = application.job || {};
  const status = application.status || 'pending';
  const company = job.company || 'Company';

  const formatExperience = (exp: any) => {
    if (!exp) return '0 yrs';
    const min = exp.min ?? 0;
    const max = exp.max ?? 0;
    if (min === 0 && max === 0) return 'Fresher';
    if (min === max) return `${min} yrs`;
    return `${min}-${max} yrs`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusStyle[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {statusLabel[status] || status}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-3">
          {/* Job info */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: getBgColor(company), color: '#fff' }}>
                <span className="text-[10px] font-bold">{getInitials(company)}</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">{job.title || 'Job Title'}</h1>
                <p className="text-xs text-gray-500">{company}</p>
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
                  {fmtSalary(job.salary)}
                </span>
              )}
              {job.experienceRequired && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <Clock className="w-3 h-3" /> {formatExperience(job.experienceRequired)}
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Application Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-900 font-medium">Applied</p>
                  <p className="text-[10px] text-gray-500">{fmtDate(application.createdAt)}</p>
                </div>
              </div>
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

          {/* Interview */}
          {application.interview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-blue-800 mb-1.5">Interview Details</h3>
              <div className="space-y-1 text-[11px] text-blue-700">
                {application.interview.date && (
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {fmtDate(application.interview.date)}
                  </p>
                )}
                {application.interview.mode && (
                  <p className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {application.interview.mode}
                  </p>
                )}
                {application.interview.link && (
                  <a href={application.interview.link} target="_blank" rel="noopener noreferrer" className="text-[#1B4D3E] underline block mt-1">
                    Join Interview
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Fee */}
          {application.feePaid && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-amber-800 mb-1.5">Challenge Fee</h3>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-700">Rs.{application.feeAmount || 0} paid</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  {application.refundId ? 'Refunded' : status === 'hired' ? 'Refunding' : 'Paid'}
                </span>
              </div>
            </div>
          )}

          {/* Cover letter */}
          {application.coverLetter && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-900 mb-1.5">Cover Letter</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {application.coverLetter}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
