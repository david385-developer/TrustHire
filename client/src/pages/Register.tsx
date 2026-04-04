import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Role
  const [role, setRole] = useState('');

  // Shared fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Candidate-only fields
  const [dob, setDob] = useState('');
  const [qualification, setQualification] = useState('');
  const [stream, setStream] = useState('');
  const [gradStatus, setGradStatus] = useState('');
  const [passedOutYear, setPassedOutYear] = useState('');

  // Recruiter-only fields
  const [company, setCompany] = useState('');

  // Common
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // ─── VALIDATION ───

  const validate = () => {
    const errs: any = {};

    if (!role) {
      errs.role = 'Please select a role';
    }

    if (!name.trim()) {
      errs.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    // Candidate-specific validation
    if (role === 'candidate') {
      if (!dob) {
        errs.dob = 'Date of birth is required';
      }
      if (!qualification) {
        errs.qualification = 'Qualification is required';
      }
    }

    // Recruiter-specific validation
    if (role === 'recruiter') {
      if (!company.trim()) {
        errs.company = 'Company name is required';
      }
    }

    if (!agreedTerms) {
      errs.terms = 'You must agree to the terms';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── SUBMIT ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        password,
        role
      };

      // Add role-specific fields
      if (role === 'candidate') {
        payload.dob = dob;
        payload.qualification = qualification;
        payload.stream = stream;
        payload.graduationStatus = gradStatus;
        if (gradStatus === 'Graduated') {
          payload.passedOutYear = parseInt(passedOutYear) || null;
        }
      }

      if (role === 'recruiter') {
        payload.company = company.trim();
      }

      await api.post('/auth/register', payload);

      toast.success('Account created! Check your email.');

      // Navigate to OTP verification
      navigate('/verify-otp', {
        state: { email: email.trim() }
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);

      if (err.response?.data?.field) {
        setErrors({
          [err.response.data.field]: msg
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── CLEAR ROLE-SPECIFIC ERRORS ON SWITCH ───

  const handleRoleSwitch = (newRole: string) => {
    setRole(newRole);
    // Clear role-specific errors
    setErrors((prev: any) => {
      const next = { ...prev };
      delete next.role;
      delete next.dob;
      delete next.qualification;
      delete next.company;
      return next;
    });
  };

  // ─── RENDER ───

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-5">

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <h1 className="text-xl font-bold text-[#1B4D3E]">
            TrustHire
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-lg font-bold text-center text-gray-900 mb-1">
          Create your account
        </h2>
        <p className="text-xs text-center text-gray-500 mb-3">
          Join TrustHire and find your next opportunity
        </p>

        {/* ─── ROLE SELECTOR ─── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleRoleSwitch('candidate')}
            className={`p-2.5 rounded-md border text-center transition
              ${role === 'candidate'
                ? 'border-[#1B4D3E] bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <span className="text-xl block mb-0.5">👤</span>
            <p className="text-xs font-medium text-gray-900">
              Job Seeker
            </p>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('recruiter')}
            className={`p-2.5 rounded-md border text-center transition
              ${role === 'recruiter'
                ? 'border-[#2563EB] bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <span className="text-xl block mb-0.5">🏢</span>
            <p className="text-xs font-medium text-gray-900">
              Recruiter
            </p>
          </button>
        </div>

        {errors.role && (
          <p className="text-red-500 text-xs mb-2 text-center">
            {errors.role}
          </p>
        )}

        {/* ─── FORM ─── */}
        <form onSubmit={handleSubmit}>

          {/* ── SHARED FIELDS ── */}

          {/* Full Name */}
          <div className="mb-2.5">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
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
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
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
                className="w-full px-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                placeholder="••••••••"
              />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword
                  ? <EyeOff className="w-3.5 h-3.5" />
                  : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
            {/* Strength indicator */}
            {password && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3].map(i => (
                  <div key={i}
                    className={`h-0.5 flex-1 rounded-full
                      ${password.length >= 8
                        ? 'bg-green-400'
                        : password.length >= 6
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                      }`} />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-2.5">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confirm Password
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                placeholder="••••••••"
              />
              <button type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm
                  ? <EyeOff className="w-3.5 h-3.5" />
                  : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* ── CANDIDATE-ONLY FIELDS ── */}
          {role === 'candidate' && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Candidate Details
              </p>

              {/* DOB + Qualification */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date of Birth
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.dob}</p>
                  )}
                </div>

                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Qualification
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900 bg-white"
                  >
                    <option value="">Select</option>
                    <option>High School</option>
                    <option>Diploma</option>
                    <option>Bachelor's</option>
                    <option>Master's</option>
                    <option>PhD</option>
                    <option>Other</option>
                  </select>
                  {errors.qualification && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.qualification}</p>
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
                    Graduation Status
                  </label>
                  <select
                    value={gradStatus}
                    onChange={(e) => setGradStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900 bg-white"
                  >
                    <option value="">Select</option>
                    <option>Currently Studying</option>
                    <option>Graduated</option>
                    <option>Graduating in 2026</option>
                    <option>Graduating in 2027</option>
                    <option>Graduating in 2028</option>
                  </select>
                </div>

                {gradStatus === 'Graduated' && (
                  <div className="mb-2.5 col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Passed Out Year
                    </label>
                    <input
                      type="number"
                      value={passedOutYear}
                      onChange={(e) => setPassedOutYear(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                      placeholder="2023"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RECRUITER-ONLY FIELDS ── */}
          {role === 'recruiter' && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recruiter Details
              </p>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Company Name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] text-gray-900"
                  placeholder="Your company name"
                />
                {errors.company && (
                  <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.company}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── TERMS ── */}
          <div className="flex items-start gap-2 mt-3 mb-3">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]"
            />
            <p className="text-xs text-gray-500">
              I agree to the{' '}
              <Link to="/terms-of-service" className="text-[#1B4D3E] hover:underline">
                Terms
              </Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="text-[#1B4D3E] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs mb-2">
              {errors.terms}
            </p>
          )}

          {/* ── SUBMIT ── */}
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

          {/* Login link */}
          <div className="mt-2.5 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1B4D3E] font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;
