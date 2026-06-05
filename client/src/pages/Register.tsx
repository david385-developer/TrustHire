import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, User, Building, Mail, Lock, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedPage from '../components/common/AnimatedPage';

const registerSchema = z.object({
  role: z.string().min(1, 'Please select a role'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  gender: z.string().optional(),
  dob: z.string().optional(),
  qualification: z.string().optional(),
  stream: z.string().optional(),
  gradStatus: z.string().optional(),
  passedOutYear: z.string().optional(),
  company: z.string().optional(),
  agreedTerms: z.boolean().refine(v => v === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'candidate') {
    return !!data.dob;
  }
  return true;
}, {
  message: "Date of birth is required",
  path: ["dob"],
}).refine((data) => {
  if (data.role === 'candidate') {
    return !!data.qualification;
  }
  return true;
}, {
  message: "Qualification is required",
  path: ["qualification"],
}).refine((data) => {
  if (data.role === 'recruiter') {
    return !!data.company && data.company.trim().length > 0;
  }
  return true;
}, {
  message: "Company name is required",
  path: ["company"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'Male',
      dob: '',
      qualification: '',
      stream: '',
      gradStatus: '',
      passedOutYear: '',
      company: '',
      agreedTerms: false,
    },
  });

  const selectedRole = watch('role');
  const watchedGradStatus = watch('gradStatus');
  const watchedPassword = watch('password');

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      };

      if (values.role === 'candidate') {
        payload.dob = values.dob;
        payload.qualification = values.qualification;
        payload.stream = values.stream;
        payload.graduationStatus = values.gradStatus;
        payload.gender = values.gender;
        if (values.gradStatus === 'Graduated' && values.passedOutYear) {
          payload.passedOutYear = parseInt(values.passedOutYear) || null;
        }
      }

      if (values.role === 'recruiter') {
        payload.company = values.company?.trim();
      }

      await api.post('/auth/register', payload);
      toast.success('Account created! Check your email.');
      navigate('/verify-otp', { state: { email: values.email.trim() } });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (roleName: string) => {
    setValue('role', roleName);
    clearErrors('role');
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300 relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-lg">
          <div className="glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 w-full shadow-lg">
            
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <Logo />
            </div>

            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-1">
              Create your account
            </h2>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              Join TrustHire and start priority recruitment
            </p>

            {/* Role selection buttons */}
            <div className="space-y-1.5 mb-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('candidate')}
                  className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedRole === 'candidate'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <User className="w-6 h-6" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Job Seeker</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Apply for jobs</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('recruiter')}
                  className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedRole === 'recruiter'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Building className="w-6 h-6" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Recruiter</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Post & hire talent</p>
                  </div>
                </button>
              </div>
              {errors.role && (
                <p className="text-red-500 dark:text-red-400 text-xs text-center mt-1.5 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Stepper Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    disabled={isLoading}
                    {...register('name')}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
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
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}

                {/* Password strength */}
                {watchedPassword && (
                  <div className="flex gap-1.5 pt-1.5">
                    {[1, 2, 3].map(i => (
                      <div 
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          watchedPassword.length >= 8
                            ? 'bg-emerald-500'
                            : watchedPassword.length >= 6
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    disabled={isLoading}
                    {...register('confirmPassword')}
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
                {errors.confirmPassword && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* CANDIDATE SPECIFIC FIELDS */}
              {selectedRole === 'candidate' && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Candidate Profile Details
                  </p>

                  {/* Gender Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Gender
                    </label>
                    <div className="flex gap-4">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <label 
                          key={g}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60"
                        >
                          <input 
                            type="radio" 
                            value={g} 
                            {...register('gender')} 
                            className="text-indigo-600 focus:ring-indigo-500 border-slate-300" 
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        {...register('dob')}
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                      {errors.dob && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.dob.message}</p>
                      )}
                    </div>

                    {/* Qualification */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Qualification <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('qualification')}
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      >
                        <option value="">Select Qualification</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Master's">Master's</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.qualification && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.qualification.message}</p>
                      )}
                    </div>

                    {/* Stream / Field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Stream / Field
                      </label>
                      <input
                        type="text"
                        {...register('stream')}
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    {/* Graduation Status */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Graduation Status
                      </label>
                      <select
                        {...register('gradStatus')}
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      >
                        <option value="">Select Status</option>
                        <option value="Currently Studying">Currently Studying</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Graduating in 2026">Graduating in 2026</option>
                        <option value="Graduating in 2027">Graduating in 2027</option>
                        <option value="Graduating in 2028">Graduating in 2028</option>
                      </select>
                    </div>

                    {/* Passed out year (if graduated) */}
                    {watchedGradStatus === 'Graduated' && (
                      <div className="space-y-1.5 col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Passed Out Year
                        </label>
                        <input
                          type="number"
                          {...register('passedOutYear')}
                          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                          placeholder="e.g. 2024"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RECRUITER SPECIFIC FIELDS */}
              {selectedRole === 'recruiter' && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Recruiter Details
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={isLoading}
                      {...register('company')}
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      placeholder="Your company name"
                    />
                    {errors.company && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.company.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms of Service Checkbox */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    {...register('agreedTerms')}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    I agree to the{' '}
                    <Link to="/terms-of-service" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                      Privacy Policy
                    </Link>
                  </span>
                </div>
                {errors.agreedTerms && (
                  <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.agreedTerms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Register;
