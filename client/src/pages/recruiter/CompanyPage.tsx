import React, { useMemo, useState } from 'react';
import { Building, ExternalLink, Globe, Mail, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CompanyPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: user?.companyName || user?.company || '',
    companyDescription: user?.companyDescription || '',
    companyWebsite: user?.companyWebsite || '',
    companyLocation: user?.companyLocation || '',
    industry: user?.industry || '',
    companySize: user?.companySize || '',
    foundedIn: user?.foundedIn || '',
    companyEmail: user?.companyEmail || '',
    companyPhone: user?.companyPhone || ''
  });

  const activeFieldsCount = useMemo(
    () => Object.values(companyData).filter((value) => String(value || '').trim()).length,
    [companyData]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCompanyData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', companyData);
      updateUser(response.data.user);
      toast.success('Company profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Company Profile</h1>
          <p className="text-slate-500 text-sm">Manage the recruiter-facing company information used across your job posts.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={loading} onClick={handleSave} icon={<Save className="w-4 h-4" />}>
                Save Profile
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-8">
            <div className="w-24 h-24 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-3xl font-bold border border-blue-100 shadow-sm mx-auto mb-6 overflow-hidden">
              {(companyData.companyName || 'T').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{companyData.companyName || 'Add your company name'}</h2>
            <p className="text-sm text-slate-500 mb-6 uppercase tracking-wider font-semibold">{companyData.industry || 'Industry not set'}</p>

            <div className="flex items-center justify-center gap-6 border-t border-slate-100 pt-6">
              <div>
                <p className="text-lg font-bold text-blue-600">{activeFieldsCount}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Fields Set</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div>
                <p className="text-lg font-bold text-blue-600">{user?.profileCompleted ? 'Yes' : 'No'}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Quick Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Globe className="w-4 h-4 text-slate-400" />
                {companyData.companyWebsite ? (
                  <a href={companyData.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                    {companyData.companyWebsite.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>Website not added</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{companyData.companyEmail || 'Company email not added'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{companyData.companyPhone || 'Company phone not added'}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">About Company</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Company Name" name="companyName" value={companyData.companyName} onChange={handleInputChange} />
                  <Input label="Industry" name="industry" value={companyData.industry} onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Company Description</label>
                  <textarea
                    name="companyDescription"
                    value={companyData.companyDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 min-h-[120px] text-slate-600"
                    placeholder="Describe your company..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Location" name="companyLocation" value={companyData.companyLocation} onChange={handleInputChange} />
                  <Input label="Website" name="companyWebsite" value={companyData.companyWebsite} onChange={handleInputChange} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-slate-600 leading-relaxed font-medium">
                  {companyData.companyDescription || 'Add a company description so candidates understand your hiring brand and culture.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Founded</p>
                    <p className="text-sm font-bold text-slate-900">{companyData.foundedIn || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Company Size</p>
                    <p className="text-sm font-bold text-slate-900">{companyData.companySize || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Headquarters</p>
                    <p className="text-sm font-bold text-slate-900">{companyData.companyLocation || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Industry</p>
                    <p className="text-sm font-bold text-slate-900">{companyData.industry || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Contact & Brand Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Company Email" name="companyEmail" value={companyData.companyEmail} onChange={handleInputChange} disabled={!isEditing} />
              <Input label="Company Phone" name="companyPhone" value={companyData.companyPhone} onChange={handleInputChange} disabled={!isEditing} />
              <Input label="Company Size" name="companySize" value={companyData.companySize} onChange={handleInputChange} disabled={!isEditing} />
              <Input label="Founded In" name="foundedIn" value={companyData.foundedIn} onChange={handleInputChange} disabled={!isEditing} />
            </div>
          </Card>

          <Card className="bg-slate-50/70 border border-dashed border-slate-200">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">How this profile is used</h3>
                <p className="text-sm text-slate-600">
                  Your company details help populate recruiter identity, improve job post credibility, and make candidate-facing job pages consistent.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
