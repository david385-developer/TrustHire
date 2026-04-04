import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Building, Eye, EyeOff, Mail, Lock, UserPlus, 
  Briefcase, GraduationCap, Calendar, Zap, CheckCircle, 
  ShieldCheck, Sparkles, Loader2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Logo from '../components/common/Logo';

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = 'candidate' | 'recruiter';
type FieldErrors = {
  name?: string; email?: string; password?: string;
  confirmPassword?: string; terms?: string;
  company?: string; dateOfBirth?: string; qualification?: string;
  stream?: string; graduationStatus?: string; passedOutYear?: string;
  gender?: string;
};
type Touched = {
  name?: boolean; email?: boolean; password?: boolean;
  confirmPassword?: boolean; terms?: boolean;
  company?: boolean; dateOfBirth?: boolean; qualification?: boolean;
  stream?: boolean; graduationStatus?: boolean; passedOutYear?: boolean;
  gender?: boolean;
};

// ─── Validators ──────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateName(v: string)     { if (!v.trim()) return 'Full name is required'; if (v.trim().length < 2) return 'Name must be at least 2 characters'; }
function validateEmail(v: string)    { if (!v.trim()) return 'Email is required'; if (!EMAIL_RE.test(v)) return 'Please enter a valid email address'; }
function validatePassword(v: string) { if (!v) return 'Password is required'; if (v.length < 6) return 'Password must be at least 6 characters'; }
function validateConfirm(v: string, pwd: string) { if (!v) return 'Please confirm your password'; if (v !== pwd) return 'Passwords do not match'; }
function validateCompany(v: string, role: Role) { if (role === 'recruiter' && !v.trim()) return 'Company name is required'; }
function validateDOB(v: string, role: Role) { 
  if (role !== 'candidate') return;
  if (!v) return 'Date of Birth is required';
  const age = (Date.now() - new Date(v).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 18) return 'You must be at least 18 years old';
}
function validateSelect(v: string, role: Role, fieldName: string) { if (role === 'candidate' && !v) return `${fieldName} is required`; }
function validateYear(v: string, role: Role, status: string) { 
  if (role === 'candidate' && status === 'Graduated' && (!v || isNaN(Number(v)))) return 'Passed out year is required for graduates'; 
}

// ─── Password strength ───────────────────────────────────────────────────────
function getStrength(pwd: string): { level: 'weak' | 'medium' | 'strong'; score: number } {
  if (!pwd || pwd.length < 6) return { level: 'weak', score: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  
  if (score >= 3) return { level: 'strong', score: 3 };
  if (score >= 2) return { level: 'medium', score: 2 };
  return { level: 'weak', score: 1 };
}

const Register: React.FC = () => {
  const location = useLocation();
  const preEmail = (location.state as any)?.email || '';
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState(preEmail);
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [role, setRole]                 = useState<Role>('candidate');
  const [agreedTerms, setAgreedTerms]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [company, setCompany]           = useState('');
  const [dob, setDob]                   = useState('');
  const [gender, setGender]             = useState('');
  const [qualification, setQualification] = useState('');
  const [stream, setStream]             = useState('');
  const [gradStatus, setGradStatus]     = useState('');
  const [passedOutYear, setPassedOutYear] = useState('');
  const [touched, setTouched]           = useState<Touched>({ email: !!preEmail });
  const [fieldErrors, setFieldErrors]   = useState<FieldErrors>({});

  const navigate   = useNavigate();
  const strength   = getStrength(password);

  const validateAll = (): FieldErrors => ({
    name:            validateName(name),
    email:           validateEmail(email),
    password:        validatePassword(password),
    confirmPassword: validateConfirm(confirmPassword, password),
    company:         validateCompany(company, role),
    dateOfBirth:     validateDOB(dob, role),
    gender:          role === 'candidate' && !gender ? 'Gender is required' : undefined,
    qualification:   validateSelect(qualification, role, 'Qualification'),
    stream:          validateSelect(stream, role, 'Stream'),
    graduationStatus: validateSelect(gradStatus, role, 'Graduation Status'),
    passedOutYear:   validateYear(passedOutYear, role, gradStatus),
    terms:           agreedTerms ? undefined : 'You must accept the terms',
  });

  const clearErrors = () => {
    setFieldErrors({});
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validateAll();
    setFieldErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Touched = { name: true, email: true, password: true, confirmPassword: true, terms: true, company: true, dateOfBirth: true, qualification: true, stream: true, graduationStatus: true, passedOutYear: true, gender: true };
    setTouched(allTouched);
    const errs = validateAll();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setIsLoading(true);
    try {
      await api.post('/auth/register', { 
        name, email, password, role,
        company, dateOfBirth: dob, gender, qualification, stream, graduationStatus: gradStatus, passedOutYear
      });
      toast.success('Account created! Check your email for a verification code.');
      navigate('/verify-otp', { state: { email, name } });
    } catch (error: any) {
      const errData = error.response?.data;
      toast.error(errData?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-md animate-fadeUp">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5 w-full max-h-[95vh] overflow-y-auto">
          {/* Logo + Heading */}
          <div className="flex justify-center mb-2">
            <Logo className="scale-90" />
          </div>
          <h2 className="text-lg font-bold text-center text-gray-900 mb-1">
            Create your account
          </h2>
          <p className="text-xs text-center text-gray-500 mb-3">
            Join TrustHire and find your next opportunity
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button type="button"
              onClick={() => setRole('candidate')}
              className={`p-2.5 rounded-md border text-center transition
                ${role === 'candidate'
                  ? 'border-[#1B4D3E] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'}`}>
              <User className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <p className="text-xs font-medium text-gray-900">Job Seeker</p>
            </button>
            <button type="button"
              onClick={() => setRole('recruiter')}
              className={`p-2.5 rounded-md border text-center transition
                ${role === 'recruiter'
                  ? 'border-[#2563EB] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'}`}>
              <Building className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <p className="text-xs font-medium text-gray-900">Recruiter</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Basic Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-0">
              {/* Full Name */}
              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  placeholder="John Doe"
                />
                {touched.name && fieldErrors.name && (
                  <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  placeholder="you@example.com"
                />
                {touched.email && fieldErrors.email && (
                  <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className="w-full px-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                    placeholder="••••••••"
                  />
                  <button type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ?
                      <EyeOff className="w-3.5 h-3.5" /> :
                      <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.password}</p>
                )}
                {/* Password strength — compact */}
                {password && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-0.5 flex-1 rounded-full
                        ${strength.level === 'weak' && i <= 1 ? 'bg-red-400' :
                          strength.level === 'medium' && i <= 2 ? 'bg-yellow-400' :
                          strength.level === 'strong' && i <= 3 ? 'bg-green-400' :
                          'bg-gray-200'}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className="w-full px-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                    placeholder="••••••••"
                  />
                  <button type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ?
                      <EyeOff className="w-3.5 h-3.5" /> :
                      <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'candidate' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-0">
                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    onBlur={() => handleBlur('dateOfBirth')}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  />
                  {touched.dateOfBirth && fieldErrors.dateOfBirth && (
                    <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.dateOfBirth}</p>
                  )}
                </div>

                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3 py-1.5 px-3 border border-gray-300 rounded-md bg-white">
                    {['Male', 'Female'].map(g => (
                      <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={gender === g}
                          onChange={() => setGender(g)}
                          className="w-3 h-3 text-[#1B4D3E]"
                        />
                        <span className="text-xs text-gray-700">{g}</span>
                      </label>
                    ))}
                  </div>
                  {touched.gender && fieldErrors.gender && (
                    <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.gender}</p>
                  )}
                </div>

                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    onBlur={() => handleBlur('qualification')}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900 bg-white"
                  >
                    <option value="">Select</option>
                    <option>Diploma</option>
                    <option>Bachelor's</option>
                    <option>Master's</option>
                    <option>PhD</option>
                    <option>Other</option>
                  </select>
                  {touched.qualification && fieldErrors.qualification && (
                    <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.qualification}</p>
                  )}
                </div>

                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stream / Field
                  </label>
                  <input
                    type="text"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                    placeholder="Computer Science"
                  />
                </div>

                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={gradStatus}
                    onChange={(e) => setGradStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900 bg-white"
                  >
                    <option value="">Select</option>
                    <option>Currently Studying</option>
                    <option>Graduated</option>
                  </select>
                </div>

                {gradStatus === 'Graduated' && (
                  <div className="mb-2.5">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Passing Year
                    </label>
                    <input
                      type="number"
                      value={passedOutYear}
                      onChange={(e) => setPassedOutYear(e.target.value)}
                      onBlur={() => handleBlur('passedOutYear')}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                      placeholder="2023"
                    />
                    {touched.passedOutYear && fieldErrors.passedOutYear && (
                      <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.passedOutYear}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onBlur={() => handleBlur('company')}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  placeholder="Your company name"
                />
                {touched.company && fieldErrors.company && (
                  <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.company}</p>
                )}
              </div>
            )}

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 mb-3 mt-1">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]"
              />
              <div className="flex flex-col">
                <p className="text-xs text-gray-500">
                  I agree to the{' '}
                  <Link to="/terms-of-service" className="text-[#1B4D3E] hover:underline font-medium">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-[#1B4D3E] hover:underline font-medium">Privacy Policy</Link>
                </p>
                {touched.terms && fieldErrors.terms && (
                  <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.terms}</p>
                )}
              </div>
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-2.5 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1B4D3E] font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
