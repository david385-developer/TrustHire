import React, { useEffect, useMemo, useState } from 'react';
import { Download, Mail, Save, Upload, X, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { buildAssetUrl } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

type GraduationStatus = 'Currently Studying' | 'Graduated' | 'Graduating in 2026' | 'Graduating in 2027' | 'Graduating in 2028';
const qualificationOptions = ['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Other'];
const graduationOptions: GraduationStatus[] = ['Currently Studying', 'Graduated', 'Graduating in 2026', 'Graduating in 2027', 'Graduating in 2028'];
interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  qualification: string;
  stream: string;
  graduationStatus: GraduationStatus | string;
  passedOutYear: string | number;
  experience: number | string;
  skills: string[];
  summary: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const initialData: ProfileForm = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
    qualification: user?.qualification || '',
    stream: user?.stream || '',
    graduationStatus: user?.graduationStatus || 'Currently Studying',
    passedOutYear: user?.passedOutYear || '',
    experience: typeof user?.experience === 'number' ? user.experience : 0,
    skills: user?.skills || [] as string[],
    summary: user?.summary || user?.bio || ''
  };
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [user]);

  const age = useMemo(() => {
    if (!user?.dateOfBirth) return '-';
    const dob = new Date(user.dateOfBirth);
    const today = new Date();
    let value = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) value--;
    return value >= 0 ? String(value) : '-';
  }, [user?.dateOfBirth]);

  const validateField = (name: string, value: any) => {
    if (name === 'name' && !String(value || '').trim()) return 'Full Name is required';
    if (name === 'dateOfBirth') {
      if (!value) return 'Date of Birth is required';
      const dob = new Date(value);
      const minAdultDate = new Date();
      minAdultDate.setFullYear(minAdultDate.getFullYear() - 18);
      if (dob > minAdultDate) return 'Must be 18+';
    }
    if (name === 'summary' && String(value || '').length > 500) return 'Summary max is 500 chars';
    return '';
  };

  const onBlurField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSaveProfile = async () => {
    const formErrors = {
      name: validateField('name', formData.name),
      dateOfBirth: validateField('dateOfBirth', formData.dateOfBirth),
      summary: validateField('summary', formData.summary)
    };
    setErrors(formErrors);
    if (Object.values(formErrors).some(Boolean)) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'skills') {
          payload.append('skills', JSON.stringify(value));
        } else {
          payload.append(key, String(value ?? ''));
        }
      });
      if (file) payload.append('resume', file);
      const response = await api.put('/auth/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(response.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fadeIn">
      <Card className="xl:col-span-2">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-24 h-24 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold text-3xl flex items-center justify-center">
            {user?.name?.slice(0, 1).toUpperCase()}
          </div>
          <h1 className="text-2xl font-semibold">{user?.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-4 h-4" />{user?.email}</p>
          <span className="px-3 py-1 rounded-full text-sm bg-[#1B4D3E]/10 text-[#1B4D3E] capitalize">{user?.role}</span>
          <p className="text-xs text-gray-500">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
          <Button className="mt-3 w-full min-h-[44px]" onClick={() => {
            setIsEditing(true);
            setFormData(initialData);
          }}>Edit Profile</Button>
        </div>
      </Card>
      <div className="xl:col-span-3 space-y-4">
        {isEditing ? (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['name', 'Full Name*', 'text'], ['email', 'Email', 'text'], ['dateOfBirth', 'Date of Birth*', 'date'],
                ['phone', 'Phone', 'text'], ['stream', 'Stream', 'text'], ['experience', 'Experience (years)', 'number']
              ].map(([name, label, type]) => (
                <div key={name} className={name === 'email' ? 'md:col-span-2' : ''}>
                  <label className="text-sm font-medium">{label}</label>
                  <input name={name} type={type} disabled={name === 'email'} value={formData[name as keyof ProfileForm] as string | number} onBlur={onBlurField}
                    onChange={(e) => setFormData((p) => ({ ...p, [name]: e.target.value } as ProfileForm))}
                    className="mt-1 w-full px-3 py-2 border rounded-lg min-h-[44px]" />
                  {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
                </div>
              ))}
              <div>
                <label className="text-sm font-medium">Qualification</label>
                <select name="qualification" value={formData.qualification} onBlur={onBlurField}
                  onChange={(e) => setFormData((p) => ({ ...p, qualification: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border rounded-lg min-h-[44px]">
                  <option value="">Select</option>
                  {qualificationOptions.map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Graduation Status</label>
                <select name="graduationStatus" value={formData.graduationStatus} onBlur={onBlurField}
                  onChange={(e) => setFormData((p) => ({ ...p, graduationStatus: e.target.value as GraduationStatus }))}
                  className="mt-1 w-full px-3 py-2 border rounded-lg min-h-[44px]">
                  {graduationOptions.map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
              {formData.graduationStatus === 'Graduated' && (
                <div>
                  <label className="text-sm font-medium">Passed Out Year</label>
                  <input name="passedOutYear" type="number" value={formData.passedOutYear}
                    onChange={(e) => setFormData((p) => ({ ...p, passedOutYear: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border rounded-lg min-h-[44px]" />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="mt-1 flex flex-wrap gap-2 p-2 border rounded-lg">
                  {formData.skills.map((s) => (
                    <span key={s} className="px-2 py-1 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] text-xs flex items-center gap-1">{s}
                      <button onClick={() => setFormData((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Type skill and press Enter"
                    onKeyDown={(e) => { if (e.key === 'Enter' && newSkill.trim()) { e.preventDefault(); setFormData((p) => ({ ...p, skills: [...p.skills, newSkill.trim()] })); setNewSkill(''); } }}
                    className="flex-1 min-w-[180px] outline-none" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Summary (max 500)</label>
                <textarea name="summary" value={formData.summary} maxLength={500} onBlur={onBlurField}
                  onChange={(e) => setFormData((p) => ({ ...p, summary: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border rounded-lg min-h-[120px]" />
                <p className="text-xs text-gray-500 text-right">{formData.summary.length}/500</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Resume (PDF only, max 5MB)</label>
                <label className="mt-1 border-2 border-dashed rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-600 truncate">{file?.name || 'Drag and drop or click to upload PDF'}</span>
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (!selected) return;
                    if (selected.type !== 'application/pdf') return toast.error('Only PDF allowed');
                    if (selected.size > 5 * 1024 * 1024) return toast.error('Max size 5MB');
                    setFile(selected);
                  }} />
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData(initialData); setFile(null); }}>Cancel</Button>
              <Button loading={loading} onClick={handleSaveProfile} icon={<Save className="w-4 h-4" />}>Save</Button>
            </div>
          </Card>
        ) : (
          <>
            <Card><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><strong>Personal Information</strong></p><span />
              <p>Full Name: {user?.name || '-'}</p><p>Email: {user?.email || '-'}</p>
              <p>DOB: {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}</p><p>Age: {age}</p>
              <p className="md:col-span-2">Phone: {user?.phone || '-'}</p>
            </div></Card>
            <Card><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><strong>Education</strong></p><span />
              <p>Qualification: {user?.qualification || '-'}</p><p>Stream: {user?.stream || '-'}</p>
              <p>Graduation Status: {user?.graduationStatus || '-'}</p><p>Passed Out Year: {user?.passedOutYear || '-'}</p>
            </div></Card>
            <Card><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><strong>Professional</strong></p><span />
              <p>Experience: {typeof user?.experience === 'number' ? `${user.experience} years` : '-'}</p>
              <div className="md:col-span-2 flex flex-wrap gap-2">{(user?.skills || []).map((s) => <span key={s} className="px-2 py-1 text-xs rounded-full bg-gray-100">{s}</span>)}</div>
            </div></Card>
            <Card><p className="text-sm"><strong>Summary</strong></p><p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{user?.summary || user?.bio || '-'}</p></Card>
            <Card className="overflow-hidden border-slate-100">
              <p className="text-sm font-bold mb-4">Resume</p>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-red-200">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user?.resume ? user.resume.split(/[\\/]/).pop() : 'No resume uploaded'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">PDF DOCUMENT</p>
                    <div className="flex items-center gap-2 mt-4">
                      {user?.resume && (
                        <a 
                          href={buildAssetUrl(user.resume)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      )}
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1B4D3E] border border-[#1B4D3E]/20 bg-white rounded-lg hover:bg-[#1B4D3E]/5 transition-all cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        Replace
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const sel = e.target.files?.[0];
                            if (sel) {
                              if (sel.type !== 'application/pdf') return toast.error('Only PDF allowed');
                              setFile(sel);
                              setIsEditing(true);
                              toast('Selected new resume. Review and Save.', { icon: '📝' });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
