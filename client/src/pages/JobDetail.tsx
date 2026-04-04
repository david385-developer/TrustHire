import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, ArrowLeft, 
  Shield, CheckCircle, Star, Sparkles,
  Zap, IndianRupee, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Textarea from '../components/common/Textarea';

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
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetail();
    
    // Load Razorpay script
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
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

  const handleApplyClick = () => {
    if (!isAuthenticated) { toast.error('Please login to apply'); navigate('/login'); return; }
    if (user?.role === 'recruiter') { toast.error('Recruiters cannot apply to jobs'); return; }
    if (!job) return;
    
    if (job.challengeFeeAmount > 0) {
      setShowApplyModal(true);
    } else {
      handleConfirmApply();
    }
  };

  const handleConfirmApply = async () => {
    if (!job) return;
    setApplying(true);

    try {
      // 1. Create application
      const { data } = await api.post(
        `/applications/${job._id}`,
        { coverLetter: coverLetter || '' }
      );
      const applicationId = data.data?._id || data.applicationId || data._id;

      // 2. If fee > 0, create payment order + open Razorpay
      if (job.challengeFeeAmount > 0) {
        const orderRes = await api.post(
          '/payments/create-order',
          { applicationId, amount: job.challengeFeeAmount }
        );
        const orderData = orderRes.data;

        if (!(window as any).Razorpay) {
          toast.error('Payment system loading. Try again.');
          setApplying(false);
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: 'INR',
          order_id: orderData.orderId,
          name: 'TrustHire',
          description: `Challenge Fee — ${job.title}`,
          handler: async (response: any) => {
            try {
              await api.post('/payments/verify', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                applicationId
              });
              toast.success('Payment successful!');
              setShowApplyModal(false);
              navigate('/dashboard/applications');
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          modal: {
            ondismiss: () => {
              toast('Payment cancelled');
              setApplying(false);
            }
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#1B4D3E' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          toast.error('Payment failed: ' + response.error.description);
          setApplying(false);
        });
        rzp.open();
      } else {
        // Free apply
        toast.success('Application submitted!');
        setShowApplyModal(false);
        setHasApplied(true);
        navigate('/dashboard/applications');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      if (job.challengeFeeAmount <= 0) {
        setApplying(false);
      }
    }
  };

  const formatSalary = (salary: { min: number; max: number }) => {
    const f = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
    return `₹${f(salary.min)} - ₹${f(salary.max)}`;
  };

  const formatExperience = (exp: { min: number; max: number }) => {
    if (!exp) return 'Not specified';
    const min = exp.min ?? 0;
    const max = exp.max ?? 0;
    if (min === 0 && max === 0) return 'Fresher';
    if (min === max) return `${min} yrs`;
    return `${min}-${max} yrs`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-6 h-6 animate-spin text-[#1B4D3E]" /></div>;
  if (!job) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 pt-16">
      {/* TOP BAR - FIXED */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          {!hasApplied && (
            <button 
              onClick={handleApplyClick}
              className="px-3 py-1.5 text-xs font-medium bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E]"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {/* CONTENT - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-3">
          
          {/* JOB HEADER CARD */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg font-bold text-[#1B4D3E] border border-gray-100 flex-shrink-0">
                {job.company.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-gray-900 leading-tight mb-0.5">{job.title}</h1>
                <p className="text-xs text-gray-500 mb-2">{job.company}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    <Clock className="w-3 h-3" /> {job.type}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                    <IndianRupee className="w-3 h-3" /> {formatSalary(job.salary)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CHALLENGE FEE CARD (IF APPLICABLE) */}
          {job.challengeFeeAmount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <div className="flex items-start gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-amber-900 mb-0.5">Priority Application Active</h3>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    Signals commitment with a ₹{job.challengeFeeAmount} refundable challenge fee. Includes Priority Shield Guarantee.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OVERVIEW SECTION */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wider">Job Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Experience</p>
                  <p className="text-xs text-gray-700 font-semibold uppercase tracking-tight">{formatExperience(job.experienceRequired)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Role Type</p>
                  <p className="text-xs text-gray-700 font-semibold">{job.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SKILLS SECTION */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(skill => (
                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wider">Job Description</h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* GUARANTEE SECTION */}
          <div className="bg-slate-900 rounded-lg p-3 mb-2 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> 
                TrustHire Guarantee
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  "100% Refunded if application is declined.",
                  `Refunded if not reviewed within ${job.challengeFeeDays} days.`,
                  "Full refund credited upon joining.",
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-emerald-50/80 font-medium">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-emerald-500/10 blur-2xl" />
          </div>

        </div>
      </div>

      {/* BOTTOM BAR - MOBILE ONLY */}
      {!hasApplied && (
        <div className="md:hidden flex-shrink-0 p-2 bg-white border-t border-gray-200">
          <button 
            onClick={handleApplyClick}
            className="w-full py-2 text-xs font-medium bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E]"
          >
            {job.challengeFeeAmount > 0 ? `Apply with ₹${job.challengeFeeAmount} Fee` : 'Apply Now — Free'}
          </button>
        </div>
      )}

      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Submit Application" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">Cover Letter (Optional)</label>
            <Textarea 
              placeholder="Why are you a good fit?" 
              rows={5} 
              value={coverLetter} 
              onChange={(e) => setCoverLetter(e.target.value)} 
              className="text-xs"
            />
          </div>

          {job.challengeFeeAmount > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
              <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 mb-0.5">Priority Shield Active</h4>
                <p className="text-[10px] text-amber-800 leading-tight">
                  ₹{job.challengeFeeAmount} commitment fee is 100% refundable as per policy.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button 
              onClick={() => setShowApplyModal(false)} 
              className="flex-1 py-2 bg-gray-50 text-gray-500 text-xs font-bold rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmApply} 
              disabled={applying} 
              className="flex-1 py-2 bg-[#1B4D3E] text-white text-xs font-bold rounded-md hover:bg-[#0F3D2E] flex items-center justify-center gap-2"
            >
              {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : job.challengeFeeAmount > 0 ? 'Proceed' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;
