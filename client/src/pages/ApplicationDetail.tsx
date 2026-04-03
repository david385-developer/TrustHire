import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, CheckCircle2, XCircle, Clock, 
  Calendar, Shield, IndianRupee, FileText, ChevronRight, 
  Video, Coffee, MessageSquare, AlertCircle, TrendingUp, Sparkles, Star
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

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><div className="h-96 bg-white rounded-[40px] animate-pulse"></div></div>;
  if (!application || !application.job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Unavailable</h2>
        <p className="text-slate-500 mb-8">This posting might have been removed or you lack permission to view it.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const s = application.status;
  const isUnderReview = ['under_review', 'interview_scheduled', 'interview_completed', 'shortlisted', 'hired', 'joined', 'rejected'].includes(s);
  const isInterview = ['interview_scheduled', 'interview_completed', 'shortlisted', 'hired', 'joined'].includes(s);
  const isFinal = ['hired', 'rejected', 'joined'].includes(s);

  return (
    <div className="min-h-screen bg-[#F8FAF9] pt-28 pb-20 animate-fadeUp">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard/applications" className="inline-flex items-center gap-2 text-emerald-600 hover:gap-3 transition-all font-bold mb-8 group">
          <ArrowLeft className="w-5 h-5" /> Review Your Applications
        </Link>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-emerald-900/5 border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full -mr-16 -mt-16"></div>
              
              <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-slate-900/10">
                    {application.job.company.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold heading-font text-slate-900 mb-2 truncate max-w-sm">{application.job.title}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg">{application.job.company}</span>
                      <span className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-widest"><MapPin className="w-3.5 h-3.5" />{application.job.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className={`px-5 py-2 rounded-2xl font-bold text-sm uppercase tracking-widest border ${
                    s === 'hired' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                    s === 'rejected' ? 'bg-red-50 border-red-200 text-red-600' : 
                    'bg-amber-50 border-amber-200 text-amber-600'
                  }`}>
                    {s.replace('_', ' ')}
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Applied {safeFormatDate(application.appliedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Hiring Pipeline (Visualized) */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold heading-font text-slate-900 mb-10 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" /> Application Journey
              </h3>
              
              <div className="relative space-y-12 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {/* Step 1 */}
                <div className="relative pl-12">
                  <div className="absolute left-0 top-0 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center z-10 shadow-lg shadow-emerald-500/20 border-4 border-white transform transition-transform hover:scale-110">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-lg mb-1 leading-none">Application Submitted</h4>
                    <p className="text-sm text-slate-500 font-medium">Your profile was successfully delivered to the hiring team.</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 tracking-widest">{safeFormatDate(application.appliedAt)}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`relative pl-12 ${isUnderReview ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 shadow-lg border-4 border-white transition-all
                    ${isUnderReview ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-300 shadow-none'}`}>
                    {isUnderReview ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-lg mb-1 leading-none">Under Review</h4>
                    <p className="text-sm text-slate-500 font-medium">Recruiter is currently assessing your fit for this specific position.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`relative pl-12 ${isInterview ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 shadow-lg border-4 border-white transition-all
                    ${isInterview ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-300 shadow-none'}`}>
                    {isInterview ? <Coffee className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div className={`p-6 rounded-3xl border transition-all ${isInterview ? 'bg-white border-emerald-100 shadow-xl shadow-emerald-900/5' : 'bg-slate-50 border-slate-100'}`}>
                    <h4 className="font-bold text-slate-900 text-lg mb-1 leading-none">Interviews</h4>
                    {application.interview ? (
                      <div className="mt-4 space-y-4">
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm text-slate-700">
                            <Video className="w-4 h-4 text-blue-500" /> {application.interview.mode}
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm text-slate-700">
                            <Calendar className="w-4 h-4 text-purple-500" /> {safeFormatDate(application.interview.scheduledAt, "MMM dd, h:mm a")}
                          </div>
                        </div>
                        {application.interview.link && (
                          <a href={application.interview.link} target="_blank" rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/20">
                            Join Meeting Now <ChevronRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 font-medium">{isInterview ? "Preparing your interview schedule..." : "Candidates whose profiles match will be invited to discuss the role."}</p>
                    )}
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`relative pl-12 ${isFinal ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 shadow-lg border-4 border-white transition-all
                    ${isFinal ? (s === 'rejected' ? 'bg-red-500' : 'bg-emerald-500') + ' text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-300 shadow-none'}`}>
                    {s === 'hired' ? <Star className="w-5 h-5 fill-white" /> : s === 'rejected' ? <XCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className={`p-6 rounded-3xl border transition-all ${isFinal ? (s === 'rejected' ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50 border-emerald-100') : 'bg-slate-50 border-slate-100'}`}>
                    <h4 className="font-bold text-slate-900 text-lg mb-1 leading-none">Decision</h4>
                    <p className={`text-sm font-bold mt-2 ${s === 'hired' ? 'text-emerald-700' : s === 'rejected' ? 'text-red-700' : 'text-slate-500 font-medium'}`}>
                      {s === 'hired' ? "🎉 Congratulations! You have been selected for the role." : s === 'rejected' ? "The recruiter has decided to move forward with other candidates." : "Pending final feedback."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 sticky top-28">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Priority Status
              </h3>
              
              <div className={`p-6 rounded-3xl border transition-all mb-8 ${application.feePaid ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${application.feePaid ? 'bg-white text-amber-500' : 'bg-white text-slate-300'}`}>
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Challenge Fee</h4>
                    <p className={`text-xl font-black ${application.feePaid ? 'text-琥珀-900' : 'text-slate-400'}`}>₹{application.feeAmount.toLocaleString()}</p>
                  </div>
                </div>
                {application.feePaid && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-white/60 py-2 px-3 rounded-xl border border-emerald-100 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SECURELY PAID
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> Cover Pitch
                </h4>
                <div className="text-slate-500 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl italic border border-slate-100 max-h-48 overflow-y-auto">
                  "{application.coverLetter || "No custom pitch provided."}"
                </div>
              </div>

              <hr className="my-8 border-slate-50" />
              
              <Link to={`/jobs/${application.job._id}`}>
                <button className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group">
                  View Original Post <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            
            <div className="bg-emerald-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-widest mb-4">Shield Guarantee</h4>
                 <p className="text-sm text-emerald-50/70 font-medium leading-relaxed">Your application fee is protected by TrustHire's Refund Protocol. It's only released when you join the company.</p>
               </div>
               <Shield className="absolute -bottom-8 -right-8 w-24 h-24 text-white opacity-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// No manual fallbacks needed as all icons are imported from lucide-react
export default ApplicationDetail;
