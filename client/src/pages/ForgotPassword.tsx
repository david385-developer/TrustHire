import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedPage from '../components/common/AnimatedPage';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ─── STEP 1: SEND OTP ───
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('Reset code sent to your email.');
      setStep(2);
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── STEP 2: VERIFY OTP ───
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-reset-otp', {
        email: email.trim(),
        otp: code
      });
      toast.success('Code verified successfully.');
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── STEP 3: RESET PASSWORD ───
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        newPassword
      });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP INPUT HANDLERS ───
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  // ─── RESEND COOLDOWN ───
  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('Reset code resent successfully.');
      startCooldown();
    } catch (err) {
      toast.error('Failed to resend reset code.');
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300 relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 w-full shadow-lg">
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Logo />
            </div>

            {/* ── STEP 1: ENTER EMAIL ── */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-1">
                  Forgot Password?
                </h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
                  Enter your email address to receive a recovery code.
                </p>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      'Send Code'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 2: ENTER OTP ── */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-1">
                  Check Your Email
                </h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
                  We sent a 6-digit code to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-between gap-2.5">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-center text-xl font-bold transition-all outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading || otp.join('').length < 6}
                    className="w-full py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    {resendCooldown > 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        Resend code in {resendCooldown}s
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleResend}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {/* ── STEP 3: NEW PASSWORD ── */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-1">
                  Create New Password
                </h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
                  Your new password must be different from previous passwords.
                </p>

                <form onSubmit={handleReset} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Back to login */}
            <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
              <Link 
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ForgotPassword;
