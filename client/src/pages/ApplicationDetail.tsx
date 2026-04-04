import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Clock, 
  Calendar, Shield, IndianRupee, ChevronRight, 
  Video, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: { min: number; max: number };
  };
  coverLetter: string;
  feePaid: boolean;
  feeAmount: number;
  status: string;
  interview?: {
    scheduledAt: string;
    mode: string;
    link?: string;
    notes?: string;
  };
  refundReason?: string;
  refundProcessedAt?: string;
  appliedAt: string;
}

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const safeFormatDate = (value?: string | Date, dateString: string = 'MMM dd, yyyy') => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '—';
      return format(d, dateString);
    } catch {
      return '—';
    }
  };

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`);
      setApplication(response.data.data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-6 h-6 border-b-2 border-[#1B4D3E] rounded-full animate-spin"></div></div>;
  if (!application || !application.job) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
        <h2 className="text-sm font-bold text-gray-900">Application Unavailable</h2>
        <Link to="/dashboard" className="mt-4 text-xs text-[#1B4D3E] font-medium hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const s = application.status;
  const statusColor = s === 'hired' ? 'bg-emerald-50 text-emerald-700' : s === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';

  return (
    <div className="h-screen flex flex-col bg-gray-50 pt-16">
      {/* TOP BAR - FIXED */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-xs text-gray-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusColor}`}>
            {s.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* CONTENT - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-3">
          
          {/* JOB INFO CARD */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
                {application.job.company.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 truncate">{application.job.title}</h1>
                <p className="text-xs text-gray-500 truncate">{application.job.company}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {application.job.location}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {application.job.type}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 inline-flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> {application.job.salary.min}-{application.job.salary.max}
              </span>
            </div>
          </div>

          {/* APPLICATION STATUS CARD */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Application Status</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${s === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              <span className="text-xs text-gray-700 font-medium capitalize">{s.replace('_', ' ')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-gray-500">Applied On</p>
                <p className="text-xs text-gray-900">{safeFormatDate(application.appliedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Last Update</p>
                <p className="text-xs text-gray-900">Recently</p>
              </div>
            </div>
          </div>

          {/* INTERVIEW CARD */}
          {application.interview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-blue-800 mb-1.5 font-bold uppercase tracking-wider">Interview Details</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-blue-700">
                  <Calendar className="w-3 h-3" />
                  <span>{safeFormatDate(application.interview.scheduledAt, "MMM dd, h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-blue-700">
                  <Video className="w-3 h-3" />
                  <span>{application.interview.mode}</span>
                </div>
                {application.interview.link && (
                  <a href={application.interview.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:underline">
                    Join Meeting Link <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* FEE CARD */}
          {application.feePaid && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Challenge Fee Status
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-700 font-medium">₹{application.feeAmount.toLocaleString()} Paid</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-bold">PRIORITY</span>
              </div>
            </div>
          )}

          {/* COVER LETTER CARD */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1.5">Cover Letter / Pitch</h3>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "{application.coverLetter || "No pitch provided."}"
            </p>
          </div>

          {/* DECISION CARD (IF REJECTED) */}
          {s === 'rejected' && application.refundReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-semibold text-red-800 mb-1">Refund Update</h3>
              <p className="text-[11px] text-red-700 leading-tight">
                Your application fee was refunded. Reason: {application.refundReason}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
