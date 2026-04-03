import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, Sparkles, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
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

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = field === 'email' ? validateEmail(email) : validatePassword(password);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const showError = (field: keyof FieldErrors) => touched[field] ? fieldErrors[field] : undefined;

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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Section: Branding & Decorative */}
      <div className="hidden lg:flex flex-col justify-between p-16 hero-gradient relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-white/5 blur-[100px] rounded-full"></div>
        
        {/* Dotted lines pattern overlay using inline SVG */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative z-10">
          <Logo variant="light" className="mb-16 scale-125 origin-left" />
          
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold heading-font text-white mb-6 leading-tight">
              Welcome to <span className="text-emerald-400">TrustHire</span>
            </h1>
            <p className="text-xl text-emerald-50/80 body-font mb-12">
              Your commitment is your strongest resume. Join the world's first trust-driven hiring ecosystem.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck className="w-5 h-5" />, text: "Verified commitment signals" },
                { icon: <Sparkles className="w-5 h-5" />, text: "AI-free genuine matches" },
                { icon: <ShieldCheck className="w-5 h-5" />, text: "Priority review guarantee" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-emerald-100/90 font-medium animate-fadeUp" style={{ animationDelay: `${(i+1)*200}ms` }}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="relative z-10 text-emerald-50/40 text-sm font-medium tracking-wide">
          &copy; {new Date().getFullYear()} TrustHire Inc. Protected by Priority Shield.
        </p>
      </div>

      {/* Right Section: Login Form */}
      <div className="flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="lg:hidden mb-12">
            <Logo variant="dark" className="scale-110 origin-left" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 heading-font mb-2">Sign In</h2>
            <p className="text-slate-500 font-medium">Access your professional dashboard and search results.</p>
          </div>

          {/* Global Errors */}
          {globalError?.type === 'not_found' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-scaleIn">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-900 font-bold text-sm">{globalError.message}</p>
                <Link to="/register" state={{ email: globalError.email }} className="text-red-600 font-bold text-sm hover:underline flex items-center gap-1 mt-1">
                  Create new account <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {globalError?.type === 'server' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-scaleIn">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-900 font-bold text-sm">{globalError.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Mail className="w-4 h-4 text-emerald-500" /> Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                disabled={isLoading}
                onChange={e => {setEmail(e.target.value); setGlobalError(null);}}
                onBlur={() => handleBlur('email')}
                className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all font-medium placeholder:text-slate-400
                  ${showError('email') ? 'border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5'}`}
              />
              {showError('email') && (
                <p className="text-red-500 text-xs font-bold flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3" /> {showError('email')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Lock className="w-4 h-4 text-emerald-500" /> Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  disabled={isLoading}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all font-medium pr-12
                    ${showError('password') ? 'border-red-500 bg-red-50/30' : 'border-slate-100 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {showError('password') && (
                <p className="text-red-500 text-xs font-bold flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3" /> {showError('password')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 font-medium">
              New to the platform?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                Create Free Account
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
