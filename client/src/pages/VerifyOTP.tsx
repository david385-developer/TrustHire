import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MailCheck, RefreshCw, ArrowLeft, Loader2, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
    <div className="h-screen flex items-center justify-center bg-gray-50 p-4 pt-16">
      <div className="w-full max-w-[360px] bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 text-[#1B4D3E]">
            <MailCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1">Verify Your Email</h2>
          <p className="text-[11px] text-gray-500 font-medium">
            We've sent a 6-digit code to <span className="text-gray-900 font-bold">{email}</span>
          </p>
        </div>

        {isLocked && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
             <Lock className="w-4 h-4 text-amber-500" />
             <div className="text-[11px] text-amber-800 font-medium">
               Locked for {Math.floor(lockSecsLeft/60)}m {lockSecsLeft%60}s
             </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-between gap-1.5">
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
                className={`w-full h-12 bg-white border rounded-md text-center text-lg font-bold transition-all outline-none 
                  ${status === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 
                    status === 'error' ? 'border-red-500 bg-red-50 text-red-600' : 
                    digit ? 'border-[#1B4D3E] ring-1 ring-[#1B4D3E]' : 'border-gray-200 focus:border-[#1B4D3E]'}
                  ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {errorMsg && !isLocked && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-red-600">
              <RefreshCw className="w-3 h-3" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={status === 'loading' || status === 'success' || isLocked}
            className="w-full py-2 bg-[#1B4D3E] text-white rounded-md font-bold text-xs hover:bg-[#0F3D2E] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying</>
            ) : status === 'success' ? (
              <><ShieldCheck className="w-3.5 h-3.5" /> Verified</>
            ) : (
              <>Complete Verification <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>

          <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-gray-400 font-medium">No code?</span>
              {resendCooldown > 0 ? (
                <span className="text-[10px] text-gray-400 font-bold">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading || isLocked}
                  className="text-[10px] text-[#1B4D3E] font-bold hover:underline flex items-center gap-1"
                >
                  {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Resend Code
                </button>
              )}
            </div>

            <Link to="/register" className="text-[10px] text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1 group">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              Change email address
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
