import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/common/Logo';

// ─── Types ───────────────────────────────────────────────────────────────────
type FieldErrors = { email?: string; password?: string };
type Touched     = { email?: boolean; password?: boolean };
type GlobalError = { type: 'not_found' | 'server' | 'validation'; message: string; email?: string };

// ─── Validators ──────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(val: string): string | undefined {
  if (!val.trim()) return 'Email is required';
  if (!EMAIL_RE.test(val)) return 'Please enter a valid email address';
}

function validatePassword(val: string): string | undefined {
  if (!val) return 'Password is required';
  if (val.length < 6) return 'Password must be at least 6 characters';
}

// ─── Component ───────────────────────────────────────────────────────────────
const Login: React.FC = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched]       = useState<Touched>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);
  const [isLoading, setIsLoading]   = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const clearErrors = () => {
    setFieldErrors({});
    setGlobalError(null);
  };

  const validateEmailField = () => {
    const err = validateEmail(email);
    setFieldErrors(prev => ({ ...prev, email: err }));
    setTouched(prev => ({ ...prev, email: true }));
  };

  const validatePasswordField = () => {
    const err = validatePassword(password);
    setFieldErrors(prev => ({ ...prev, password: err }));
    setTouched(prev => ({ ...prev, password: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setTouched({ email: true, password: true });
    setFieldErrors({ email: emailErr, password: passwordErr });
    setGlobalError(null);

    if (emailErr || passwordErr) return;

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.token;
      const user  = data.user;
      login(token, user);
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errorCode === 'EMAIL_NOT_VERIFIED') {
        toast('Please verify your email. Redirecting...', { icon: '📧' });
        navigate('/verify-otp', { state: { email, name: errData.name } });
        return;
      } else if (errData?.errorCode === 'USER_NOT_FOUND') {
        setGlobalError({ type: 'not_found', message: errData.message, email });
      } else if (errData?.errorCode === 'INVALID_PASSWORD') {
        setFieldErrors({ password: errData.message });
        setTouched(prev => ({ ...prev, password: true }));
        setPassword('');
        setTimeout(() => passwordRef.current?.focus(), 0);
      } else if (errData?.errorCode === 'DB_UNAVAILABLE' || err.code === 'ERR_NETWORK') {
        setGlobalError({ type: 'server', message: 'Service unavailable. Please check your connection or try again later.' });
      } else {
        setGlobalError({ type: 'server', message: errData?.message || 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 w-full">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <Logo className="scale-90" />
          </div>

          <h2 className="text-lg font-bold text-center text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-xs text-center text-gray-500 mb-4">
            Sign in to your account
          </p>

          {/* Global Errors */}
          {globalError?.type === 'not_found' && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-900 font-bold text-xs">{globalError.message}</p>
                <Link to="/register" state={{ email: globalError.email }} className="text-red-600 font-bold text-xs hover:underline flex items-center gap-1 mt-0.5">
                  Create new account <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {globalError?.type === 'server' && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-900 font-bold text-xs">{globalError.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                  onBlur={validateEmailField}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  placeholder="you@example.com"
                />
              </div>
              {touched.email && fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                  onBlur={validatePasswordField}
                  className="w-full pl-9 pr-9 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  placeholder="••••••••"
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ?
                    <EyeOff className="w-3.5 h-3.5" /> :
                    <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end mb-4">
              <Link to="/forgot-password"
                className="text-xs text-[#1B4D3E] hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 text-sm font-medium bg-[#1B4D3E] text-white rounded-md hover:bg-[#0F3D2E] disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider + register link */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1B4D3E] font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
