import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Building2, Eye, EyeOff, Mail, Lock, UserPlus, 
  Briefcase, GraduationCap, Calendar, Zap, CheckCircle, 
  ShieldCheck, Sparkles, Loader2
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
};
type Touched = {
  name?: boolean; email?: boolean; password?: boolean;
  confirmPassword?: boolean; terms?: boolean;
  company?: boolean; dateOfBirth?: boolean; qualification?: boolean;
  stream?: boolean; graduationStatus?: boolean; passedOutYear?: boolean;
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
function getStrength(pwd: string): { score: 0|1|2|3; label: string } {
  if (!pwd || pwd.length < 6) return { score: 0, label: 'Weak' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score >= 3) return { score: 3, label: 'Strong' };
  if (score >= 2) return { score: 2, label: 'Medium' };
  return { score: 1, label: 'Weak' };
}

const Register: React.FC = () => {
  const location = useLocation();
  const preEmail = (location.state as any)?.email || '';
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState(preEmail);
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [showPassword, setShowPwd]    = useState(false);
  const [selectedRole, setRole]       = useState<Role>('candidate');
  const [terms, setTerms]             = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [company, setCompany]         = useState('');
  const [dateOfBirth, setDob]         = useState('');
  const [qualification, setQual]      = useState('');
  const [stream, setStream]           = useState('');
  const [graduationStatus, setGrad]   = useState('');
  const [passedOutYear, setYear]      = useState('');
  const [touched, setTouched]         = useState<Touched>({ email: !!preEmail });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const navigate   = useNavigate();
  const strength   = getStrength(password);

  const validate = (): FieldErrors => ({
    name:            validateName(name),
    email:           validateEmail(email),
    password:        validatePassword(password),
    confirmPassword: validateConfirm(confirmPassword, password),
    company:         validateCompany(company, selectedRole),
    dateOfBirth:     validateDOB(dateOfBirth, selectedRole),
    qualification:   validateSelect(qualification, selectedRole, 'Qualification'),
    stream:          validateSelect(stream, selectedRole, 'Stream'),
    graduationStatus: validateSelect(graduationStatus, selectedRole, 'Graduation Status'),
    passedOutYear:   validateYear(passedOutYear, selectedRole, graduationStatus),
    terms:           terms ? undefined : 'You must accept the terms',
  });

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validate();
    setFieldErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const showError = (field: keyof FieldErrors) => touched[field] ? fieldErrors[field] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Touched = { name: true, email: true, password: true, confirmPassword: true, terms: true, company: true, dateOfBirth: true, qualification: true, stream: true, graduationStatus: true, passedOutYear: true };
    setTouched(allTouched);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setIsLoading(true);
    try {
      await api.post('/auth/register', { 
        name, email, password, role: selectedRole,
        company, dateOfBirth, qualification, stream, graduationStatus, passedOutYear
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

  const barColors = ['bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col justify-between p-16 hero-gradient relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-white/5 blur-[100px] rounded-full"></div>
        
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="reg-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#reg-dots)" />
          </svg>
        </div>

        <div className="relative z-10">
          <Logo variant="light" className="mb-16 scale-125 origin-left" />
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold heading-font text-white mb-6 leading-tight">
              Join <span className="text-emerald-400">TrustHire</span> Today
            </h1>
            <p className="text-xl text-emerald-50/80 body-font mb-12">
              The world's most trusted job portal. Experience the future of hiring with our commitment-first approach.
            </p>
            <div className="space-y-6">
              {[
                { icon: <Briefcase className="w-5 h-5" />, text: "Access premium job listings" },
                { icon: <ShieldCheck className="w-5 h-5" />, text: "Stand out with Challenge Fees" },
                { icon: <Sparkles className="w-5 h-5" />, text: "Get prioritized by top recruiters" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-emerald-100/90 font-medium animate-fadeUp" style={{ animationDelay: `${(i+1)*200}ms` }}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="relative z-10 text-emerald-50/40 text-sm font-medium">© {new Date().getFullYear()} TrustHire. Built for progress.</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center p-8 md:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-lg animate-fadeUp py-12">
          <div className="lg:hidden mb-12"><Logo variant="dark" /></div>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 heading-font mb-2">Create Account</h2>
            <p className="text-slate-500 font-medium">Join thousands of professionals already on TrustHire.</p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              {(['candidate', 'recruiter'] as Role[]).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRole(role)}
                  className={`p-4 rounded-[24px] border-2 transition-all flex flex-col items-center text-center ${
                    selectedRole === role ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${selectedRole === role ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {role === 'candidate' ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <p className={`font-bold capitalize ${selectedRole === role ? 'text-emerald-900' : 'text-slate-600'}`}>
                    {role === 'candidate' ? 'Job Seeker' : 'Recruiter'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="grid gap-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><User className="w-4 h-4 text-emerald-500" /> Full Name</label>
                <input
                  type="text" placeholder="John Doe" value={name} disabled={isLoading}
                  onChange={e => setName(e.target.value)} onBlur={() => handleBlur('name')}
                  className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${showError('name') ? 'border-red-500 bg-red-50/20' : 'border-slate-100 focus:border-emerald-500 focus:bg-white'}`}
                />
                {showError('name') && <p className="text-red-500 text-xs font-bold animate-fadeIn">{showError('name')}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><Mail className="w-4 h-4 text-emerald-500" /> Email</label>
                <input
                  type="email" placeholder="you@example.com" value={email} disabled={isLoading}
                  onChange={e => setEmail(e.target.value)} onBlur={() => handleBlur('email')}
                  className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${showError('email') ? 'border-red-500 bg-red-50/20' : 'border-slate-100 focus:border-emerald-500 focus:bg-white'}`}
                />
                {showError('email') && <p className="text-red-500 text-xs font-bold animate-fadeIn">{showError('email')}</p>}
              </div>
            </div>

            {selectedRole === 'recruiter' ? (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><Building2 className="w-4 h-4 text-emerald-500" /> Company Name</label>
                <input
                  type="text" placeholder="Acme Corp" value={company} disabled={isLoading}
                  onChange={e => setCompany(e.target.value)} onBlur={() => handleBlur('company')}
                  className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${showError('company') ? 'border-red-500 bg-red-50/20' : 'border-slate-100 focus:border-emerald-500'}`}
                />
                {showError('company') && <p className="text-red-500 text-xs font-bold">{showError('company')}</p>}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><Calendar className="w-4 h-4 text-emerald-500" /> Date of Birth</label>
                    <input
                      type="date" value={dateOfBirth} disabled={isLoading}
                      onChange={e => setDob(e.target.value)} onBlur={() => handleBlur('dateOfBirth')}
                      className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${showError('dateOfBirth') ? 'border-red-500 bg-red-50/20' : 'border-slate-100 focus:border-emerald-500'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><GraduationCap className="w-4 h-4 text-emerald-500" /> Qualification</label>
                    <select
                      value={qualification} disabled={isLoading}
                      onChange={e => setQual(e.target.value)} onBlur={() => handleBlur('qualification')}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
                    >
                      <option value="">Select</option>
                      {["Diploma", "Bachelor's", "Master's", "PhD"].map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><Zap className="w-4 h-4 text-emerald-500" /> Stream</label>
                    <input
                      type="text" placeholder="e.g. Computer Science" value={stream} disabled={isLoading}
                      onChange={e => setStream(e.target.value)} onBlur={() => handleBlur('stream')}
                      className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${showError('stream') ? 'border-red-500' : 'border-slate-100 focus:border-emerald-500'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle className="w-4 h-4 text-emerald-500" /> Status</label>
                    <select
                      value={graduationStatus} disabled={isLoading}
                      onChange={e => setGrad(e.target.value)} onBlur={() => handleBlur('graduationStatus')}
                      className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all appearance-none ${showError('graduationStatus') ? 'border-red-500' : 'border-slate-100 focus:border-emerald-500'}`}
                    >
                      <option value="">Select</option>
                      {["Graduated", "Currently Studying"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><Calendar className="w-4 h-4 text-emerald-500" /> Passing Year / Expected Graduation</label>
                  <input
                    type="number" placeholder="e.g. 2024" value={passedOutYear} disabled={isLoading}
                    onChange={e => setYear(e.target.value)} onBlur={() => handleBlur('passedOutYear')}
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all ${showError('passedOutYear') ? 'border-red-500' : 'border-slate-100 focus:border-emerald-500'}`}
                  />
                  {showError('passedOutYear') && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{showError('passedOutYear')}</p>}
                </div>
              </>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><Lock className="w-4 h-4 text-emerald-500" /> Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} disabled={isLoading}
                    onChange={e => setPassword(e.target.value)} onBlur={() => handleBlur('password')}
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all pr-12 focus:border-emerald-500`}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${strength.score > i ? barColors[Math.min(strength.score-1,2)] : 'bg-slate-100'}`} />)}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><Lock className="w-4 h-4 text-emerald-500" /> Confirm</label>
                <input
                  type={showPassword ? 'text' : 'password'} value={confirmPassword} disabled={isLoading}
                  onChange={e => setConfirm(e.target.value)} onBlur={() => handleBlur('confirmPassword')}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1 accent-emerald-600 h-4 w-4" />
              <label className="text-xs text-slate-500 leading-relaxed font-medium">
                I agree to the <Link to="/terms" className="text-emerald-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-600 font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /> Create Free Account</>}
            </button>
          </form>

          <footer className="mt-10 pt-8 border-t border-slate-50 text-center font-medium">
            <p className="text-slate-500">Already a member? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Sign In Instead</Link></p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;
