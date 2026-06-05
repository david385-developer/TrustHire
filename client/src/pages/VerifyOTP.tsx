import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowLeft, Loader2, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedPage from '../components/common/AnimatedPage';

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

  const lockSecsFormat = () => {
    return `${Math.floor(lockSecsLeft / 60)}m ${lockSecsLeft % 60}s`;
  };

  const isLocked = lockSecsLeft > 0;

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300 relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 w-full shadow-lg">
            
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                <MailCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Your Email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We've sent a 6-digit code to <span className="text-slate-800 dark:text-slate-200 font-bold">{email}</span>
              </p>
            </div>

            {isLocked && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center gap-3">
                 <Lock className="w-5 h-5 text-amber-500" />
                 <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                   Too many failed attempts. Locked for {lockSecsFormat()}.
                 </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex justify-between gap-2.5">
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
                    className={`w-12 h-14 bg-white dark:bg-slate-900 border rounded-xl text-center text-xl font-bold transition-all outline-none focus:ring-2 
                      ${status === 'success' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500' : 
                        status === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 focus:ring-red-500' : 
                        digit ? 'border-indigo-600 dark:border-indigo-500 focus:ring-indigo-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'}
                      ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                  />
                ))}
              </div>

              {errorMsg && !isLocked && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 rounded-xl">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={status === 'loading' || status === 'success' || isLocked}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                ) : status === 'success' ? (
                  <><ShieldCheck className="w-4 h-4" /> Verified</>
                ) : (
                  <>Complete Verification <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Didn't receive code?</span>
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading || isLocked}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1.5"
                    >
                      {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Resend Code
                    </button>
                  )}
                </div>

                <Link 
                  to="/register" 
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold flex items-center gap-1.5 group mt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  Change email address
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default VerifyOTP;
