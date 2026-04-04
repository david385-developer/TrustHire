import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
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
      setError('Please enter your email');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success('Code sent to your email');
      setStep(2);
      startCooldown();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── STEP 2: VERIFY OTP ───

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-reset-otp', {
        email: email.trim(),
        otp: code
      });
      toast.success('Code verified');
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── STEP 3: RESET PASSWORD ───

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        newPassword
      });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP INPUT HANDLER ───

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
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
      toast.success('Code resent');
      startCooldown();
    } catch (err) {
      toast.error('Failed to resend');
    }
  };

  // ─── RENDER ───

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-200 p-5">

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <h1 className="text-xl font-bold text-[#1B4D3E]">
            TrustHire
          </h1>
        </div>

        {/* ── STEP 1: ENTER EMAIL ── */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold text-center text-gray-900 mb-1">
              Forgot Password?
            </h2>
            <p className="text-xs text-center text-gray-500 mb-4">
              Enter your email and we will send you a code to reset your password.
            </p>

            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                </div>
              )}

              <button type="submit"
                disabled={isLoading}
                className="w-full py-2 text-sm font-medium bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E] disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending...
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
            <h2 className="text-lg font-bold text-center text-gray-900 mb-1">
              Check Your Email
            </h2>
            <p className="text-xs text-center text-gray-500 mb-4">
              We sent a 6-digit code to
              <br />
              <span className="font-medium text-gray-700">
                {email}
              </span>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className="flex justify-center gap-2 mb-4">
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
                    className="w-10 h-11 text-center text-lg font-bold border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  />
                ))}
              </div>

              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                </div>
              )}

              <button type="submit"
                disabled={isLoading || otp.join('').length < 6}
                className="w-full py-2 text-sm font-medium bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E] disabled:opacity-50 flex items-center justify-center gap-2 mb-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-gray-500">
                    Resend code in {resendCooldown}s
                  </p>
                ) : (
                  <button type="button"
                    onClick={handleResend}
                    className="text-xs text-[#1B4D3E] hover:underline">
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
            <h2 className="text-lg font-bold text-center text-gray-900 mb-1">
              Create New Password
            </h2>
            <p className="text-xs text-center text-gray-500 mb-4">
              Your new password must be different from your previous password.
            </p>

            <form onSubmit={handleReset}>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-9 pr-9 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                    placeholder="••••••••"
                  />
                  <button type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm New Password
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-9 pr-9 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                    placeholder="••••••••"
                  />
                  <button type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                </div>
              )}

              <button type="submit"
                disabled={isLoading}
                className="w-full py-2 text-sm font-medium bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E] disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}

        {/* Back to login */}
        <div className="mt-3 text-center">
          <Link to="/login"
            className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium">
            <ArrowLeft className="w-3 h-3" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
