import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowLeft, Loader2, ShieldCheck, Lock, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/common/Logo';

const VerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = (location.state as any)?.email || '';

  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [lockSecsLeft, setLockSecsLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (!lockoutTime) return;
    const tick = () => {
      const secs = Math.ceil((lockoutTime.getTime() - Date.now()) / 1000);
      if (secs <= 0) { setLockoutTime(null); setLockSecsLeft(0); return; }
      setLockSecsLeft(secs);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockoutTime]);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(30);
    const iv = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setErrorMsg('');
    if (status === 'error') setStatus('idle');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerify();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = digits[i] || '';
    setOtp(next);
    setErrorMsg('');
    if (status === 'error') setStatus('idle');
    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setErrorMsg('Please enter all 6 digits.'); setStatus('error'); return; }
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setErrorMsg('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: code });
      setStatus('success');
      toast.success('Email verified successfully!');
      login(data.token, data.user);
      setTimeout(() => {
        navigate(data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard', { replace: true });
      }, 600);
    } catch (err: any) {
      const errData = err.response?.data;
      setStatus('error');
      if (errData?.errorCode === 'OTP_LOCKED') {
        setErrorMsg(errData.message);
        if (errData.lockedUntil) setLockoutTime(new Date(errData.lockedUntil));
      } else {
        setErrorMsg(errData?.message || 'Something went wrong. Try again.');
      }
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New code sent to your email!');
      startResendCooldown();
      setStatus('idle');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const isLocked = lockSecsLeft > 0;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Section (consistent with auth) */}
      <div className="hidden lg:flex flex-col justify-between p-16 hero-gradient relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <Logo variant="light" className="mb-16 scale-125 origin-left" />
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold heading-font text-white mb-6 leading-tight">
              Secure Your <br /><span className="text-emerald-400">Account Access</span>
            </h1>
            <p className="text-xl text-emerald-50/80 body-font mb-12">
              We've enabled Two-Factor Verification to ensure your professional data remains protected by the TrustHire Shield.
            </p>
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck className="w-5 h-5" />, text: "Priority Shield integration" },
                { icon: <Lock className="w-5 h-5" />, text: "Point-to-point encryption" },
                { icon: <Zap className="w-5 h-5" />, text: "Instant role activation" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-emerald-100/90 font-medium animate-fadeUp" style={{ animationDelay: `${(i+1)*200}ms` }}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="relative z-10 text-emerald-50/40 text-sm font-medium">© {new Date().getFullYear()} TrustHire. Precision & Trust.</p>
      </div>

      {/* Right Section: OTP Form */}
      <div className="flex items-center justify-center p-8 md:p-16 bg-white overflow-hidden">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="lg:hidden mb-12">
            <Logo variant="dark" className="scale-110 origin-left" />
          </div>

          <div className="mb-10">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
              <MailCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 heading-font mb-2">Check Your Inbox</h2>
            <p className="text-slate-500 font-medium">
              We've sent a code to <span className="text-slate-900 font-bold underline decoration-emerald-200 underline-offset-4">{email}</span>. Please enter it below.
            </p>
          </div>

          {isLocked && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4 animate-scaleIn">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-amber-900 font-bold text-sm leading-none mb-1">Security Lockout</p>
                <p className="text-amber-700 text-xs font-medium">Please wait {Math.floor(lockSecsLeft/60)}m {lockSecsLeft%60}s before retrying.</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex justify-between gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={status === 'loading' || status === 'success' || isLocked}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className={`w-full h-16 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-bold transition-all outline-none 
                    ${status === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]' : 
                      status === 'error' ? 'border-red-500 bg-red-50 text-red-600' : 
                      digit ? 'border-emerald-500 bg-white shadow-lg' : 'border-slate-100 hover:border-emerald-200 focus:border-emerald-500 focus:bg-white'}
                    ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              ))}
            </div>

            {errorMsg && !isLocked && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-900 font-bold text-sm">{errorMsg}</p>
              </div>
            )}

            <button
              id="verify-otp-btn"
              onClick={handleVerify}
              disabled={status === 'loading' || status === 'success' || isLocked}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying Identity...
                </>
              ) : status === 'success' ? (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Verified Successfully
                </>
              ) : (
                <>
                  Complete Verification
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex flex-col items-center gap-6 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium text-sm">Didn't receive the code?</span>
                {resendCooldown > 0 ? (
                  <span className="text-emerald-600 font-bold text-sm">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resendLoading || isLocked}
                    className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1.5"
                  >
                    {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Resend Code
                  </button>
                )}
              </div>

              <Link to="/register" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Re-enter email address
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple AlertCircle fallback for this file if lucide-react doesn't expose it or if I missed it
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default VerifyOTP;
