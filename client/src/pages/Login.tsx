import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedPage from '../components/common/AnimatedPage';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type GlobalError = { type: 'not_found' | 'server' | 'validation'; message: string; email?: string };

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setGlobalError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      const token = data.token;
      const user = data.user;
      login(token, user);
      toast.success('Logged in successfully!');
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errorCode === 'EMAIL_NOT_VERIFIED') {
        toast('Please verify your email. Redirecting...', { icon: '📧' });
        navigate('/verify-otp', { state: { email: values.email, name: errData.name } });
        return;
      } else if (errData?.errorCode === 'USER_NOT_FOUND') {
        setGlobalError({ type: 'not_found', message: errData.message, email: values.email });
      } else if (errData?.errorCode === 'INVALID_PASSWORD') {
        setError('password', { type: 'manual', message: errData.message });
        setValue('password', '');
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
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300 relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 w-full shadow-lg">
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Logo className="scale-100" />
            </div>

            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
              Sign in to your recruitment dashboard
            </p>

            {/* Global Errors */}
            {globalError?.type === 'not_found' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-900 dark:text-red-200 font-semibold text-sm">{globalError.message}</p>
                  <Link 
                    to="/register" 
                    state={{ email: globalError.email }} 
                    className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline inline-flex items-center gap-1 mt-1.5"
                  >
                    Create new account <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {globalError?.type === 'server' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-900 dark:text-red-200 font-semibold text-sm">{globalError.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled={isLoading}
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border ${
                      errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl outline-none focus:ring-2 text-slate-900 dark:text-white transition-all`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading}
                    {...register('password')}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border ${
                      errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl outline-none focus:ring-2 text-slate-900 dark:text-white transition-all`}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Login;
