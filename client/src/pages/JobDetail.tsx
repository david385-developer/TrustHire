import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Clock, ArrowLeft, 
  Shield, CheckCircle, Star, Sparkles, Building, 
  Zap, ExternalLink, Users, FileText, ChevronRight,
  IndianRupee, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Textarea from '../components/common/Textarea';
import loadRazorpay from '../utils/loadRazorpay.js';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  salary: { min: number; max: number; currency: string };
  skills: string[];
  experienceRequired: { min: number; max: number };
  challengeFeeAmount: number;
  challengeFeeDays: number;
  postedBy: { _id: string; name: string; company: string };
  createdAt: string;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyWithFee, setApplyWithFee] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.data);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      toast.error('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (withFee: boolean) => {
    if (!isAuthenticated) { toast.error('Please login to apply'); navigate('/login'); return; }
    if (user?.role === 'recruiter') { toast.error('Recruiters cannot apply to jobs'); return; }
    setApplyWithFee(withFee);
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!job) return;
    setApplying(true);
    try {
      let response;
      try {
        response = await api.post(`/applications/${job._id}`, { coverLetter, feeAmount: applyWithFee ? job.challengeFeeAmount : 0 });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
        setApplying(false);
        return;
      }

      const { data } = response;
      if (applyWithFee && data.orderId) {
        try {
          const razorpayLoaded = await loadRazorpay();
          if (!razorpayLoaded) { toast.error('Payment system failed to load. Please try again.'); setApplying(false); return; }

          const options = {
            key: data.keyId,
            amount: job.challengeFeeAmount * 100,
            currency: 'INR',
            name: 'TrustHire',
            description: `Challenge Fee for ${job.title}`,
            order_id: data.orderId,
            handler: async (paymentResponse: any) => {
              try {
                const verifyRes = await api.post('/payments/verify', {
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  applicationId: data.data._id
                });
                if (verifyRes.data.success) {
                  toast.success('Payment successful! Application prioritized.');
                  setShowApplyModal(false);
                  setHasApplied(true);
                  navigate('/dashboard');
                } else {
                  toast.error('Payment verification failed. Contact support.');
                }
              } catch (error) {
                toast.error('Payment verification failed. Contact support.');
              } finally {
                setApplying(false);
              }
            },
            modal: { ondismiss: () => { toast('Payment cancelled.'); setApplying(false); } },
            prefill: { name: user?.name, email: user?.email },
            theme: { color: '#1B4D3E' }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', () => { toast.error('Payment failed.'); setApplying(false); });
          rzp.open();
        } catch (error) { toast.error('Something went wrong. Please try again.'); setApplying(false); }
      } else {
        toast.success('Application submitted successfully!');
        setShowApplyModal(false);
        setHasApplied(true);
        navigate('/dashboard');
      }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Something went wrong.'); setApplying(false); }
  };

  const formatSalary = (salary: { min: number; max: number }) => {
    const f = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
    return `₹${f(salary.min)} - ₹${f(salary.max)}`;
  };

  if (loading) return <div className="min-h-screen pt-32 pb-12"><div className="max-w-7xl mx-auto px-4"><div className="h-96 bg-white rounded-3xl animate-pulse"></div></div></div>;
  if (!job) return null;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pt-28 pb-20 animate-fadeUp">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-emerald-600 hover:gap-3 transition-all font-bold mb-8 group">
          <ArrowLeft className="w-5 h-5" /> Back to Job Search
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 mb-10 shadow-2xl shadow-emerald-900/5 border border-slate-100 border-b-[8px] border-b-emerald-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start md:items-center gap-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center text-3xl font-bold text-emerald-600 shadow-inner group-hover:rotate-6 transition-transform">
                {job.company.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold heading-font text-slate-900 mb-3 leading-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Building className="w-4 h-4 text-emerald-500" />{job.company}</span>
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" />{job.location}</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" />{job.type}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-8 py-6 rounded-[32px] text-center border border-slate-100 h-full flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Offered Salary</p>
              <h2 className="text-2xl font-bold text-emerald-600 leading-none">{formatSalary(job.salary)}</h2>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Core Details */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold heading-font text-slate-900 mb-8 flex items-center gap-3">
                <FileText className="w-7 h-7 text-emerald-500" /> Job Overview
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-8 mb-12">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Users className="w-6 h-6 text-emerald-600" /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Size</h4>
                    <p className="font-bold text-slate-700">Enterprise Growth</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Zap className="w-6 h-6 text-amber-500" /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</h4>
                    <p className="font-bold text-slate-700">{job.experienceRequired.min} - {job.experienceRequired.max} Years</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-xl font-bold heading-font text-slate-900 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-500" /> Required Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill) => (
                    <span key={skill} className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-xs uppercase tracking-wider border border-emerald-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-bold heading-font text-slate-900 mb-6 font-serif">Comprehensive Description</h3>
                <div className="text-slate-600 leading-loose text-lg whitespace-pre-line bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Refund Policy / Trust Banner */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold heading-font">TrustHire Refund Guarantee</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {[
                    "100% Refunded if application is declined.",
                    `Refunded if not reviewed within ${job.challengeFeeDays} days.`,
                    "Full refund credited upon joining the company.",
                    "Only forfeited for no-show interviews."
                  ].map((rule, i) => (
                    <div key={i} className="flex items-start gap-4 text-emerald-50/70 font-medium">
                      <div className="p-1 bg-emerald-500/20 rounded-full mt-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /></div>
                      <span className="text-lg">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/5 blur-[120px]" />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {hasApplied ? (
                <div className="bg-emerald-50 p-8 rounded-[40px] border-2 border-emerald-200 text-center shadow-xl">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-emerald-900 mb-2">Application Active</h3>
                  <p className="text-emerald-700 font-medium mb-8">You've successfully applied to this role. Track your status in the dashboard.</p>
                  <Link to="/dashboard">
                    <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20">Go to Dashboard</button>
                  </Link>
                </div>
              ) : user?.role === 'recruiter' ? (
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Recruiter Management</h3>
                  <Link to={`/recruiter/edit-job/${job._id}`} className="block mb-4">
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">Edit Post Details</button>
                  </Link>
                  <Link to={`/recruiter/jobs/${job._id}/applications`}>
                    <button className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">Review Pipeline</button>
                  </Link>
                </div>
              ) : (
                <>
                  {job.challengeFeeAmount > 0 && (
                    <div className="bg-white p-8 rounded-[40px] border-2 border-amber-500/30 shadow-2xl shadow-amber-900/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-amber-500 text-white px-6 py-2 rounded-bl-3xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 z-10">
                        <Star className="w-4 h-4 fill-white" /> Priority Status
                      </div>
                      <div className="mb-10 mt-6 px-2">
                        <h3 className="text-3xl font-bold text-slate-900 mb-4 heading-font">Stand Out Instantly</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-6">Signal your genuine commitment to the hiring team and skip the standard review queue.</p>
                        <div className="flex items-center gap-4 py-4 px-6 bg-amber-50 rounded-2xl text-amber-900 font-bold text-xl mb-8 border border-amber-100">
                          <IndianRupee className="w-6 h-6" /> {job.challengeFeeAmount.toLocaleString()} <span className="text-xs uppercase font-medium text-amber-600">Refundable Fee</span>
                        </div>
                        <ul className="space-y-4 mb-10">
                          <li className="flex items-center gap-3 text-sm font-bold text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500" /> Direct review priority</li>
                          <li className="flex items-center gap-3 text-sm font-bold text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500" /> High-conversion signal</li>
                          <li className="flex items-center gap-3 text-sm font-bold text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500" /> Shield Refund Guarantee</li>
                        </ul>
                      </div>
                      <button onClick={() => handleApply(true)} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3">
                        Apply with Fee <ChevronRight className="w-5 h-5 opacity-50" />
                      </button>
                    </div>
                  )}

                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Standard Path</h3>
                    <p className="text-slate-500 font-medium text-sm mb-6 pr-4">Apply for free and join the standard review queue.</p>
                    <button onClick={() => handleApply(false)} className="w-full py-4.5 border-2 border-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                      Standard Application <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    </button>
                  </div>
                </>
              )}
              
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 border-l-[6px] border-l-blue-500">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Priority Verification
                </p>
                <p className="text-xs text-blue-900/70 font-medium leading-relaxed">Applications with Challenge Fees are verified using Priority Shield protocol to ensure recruiter attention.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title={applyWithFee ? 'Apply with Priority Status' : 'Standard Job Application'} size="md">
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><Sparkles className="w-4 h-4 text-emerald-500" /> Pitch Your Profile (Optional)</label>
            <Textarea placeholder="Briefly highlight why you're a perfect match for this role..." rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} showCount maxCount={500} maxLength={500} />
          </div>

          {applyWithFee && (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500 h-fit"><Shield className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm mb-1 leading-none">Priority Shield Active</h4>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">You'll be directed to our secure payment gateway to verify your ₹{job.challengeFeeAmount} commitment. This is 100% refundable as per policy.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button onClick={() => setShowApplyModal(false)} className="flex-1 py-4.5 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
            <button onClick={submitApplication} disabled={applying} className="flex-1 py-4.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
              {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : applyWithFee ? 'Proceed to Payment' : 'Confirm Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;
