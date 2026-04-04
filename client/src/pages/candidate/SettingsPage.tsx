import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Lock, 
  Eye, 
  Globe, 
  Mail, 
  AlertTriangle,
  Monitor,
  XCircle,
  EyeOff,
  CheckCircle,
  Download,
  Languages,
  MapPin,
  IndianRupee,
  DollarSign,
  Euro,
  Loader2,
  Check,
  User as UserIcon,
  Phone as PhoneIcon,
  FileText
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { subscribeToPush, unsubscribeFromPush, getNotificationPermission } from '../../utils/pushNotifications';
import Modal from '../../components/common/Modal';

interface CandidateUser {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  timezone?: string;
  notificationPreferences?: {
    applicationUpdates: boolean;
    interviewReminders: boolean;
    feeRefundAlerts: boolean;
    marketingEmails: boolean;
    pushNotifications: boolean;
  };
  privacySettings?: {
    profileVisibility: string;
    showOnlineStatus: boolean;
    showSalaryExpectation: boolean;
  };
  preferences?: {
    language: string;
    region: string;
    dateFormat: string;
    currency: string;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const getStrength = (pwd: string): { level: 'weak' | 'medium' | 'strong'; score: number } => {
  if (!pwd || pwd.length < 6) return { level: 'weak', score: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  
  if (score >= 3) return { level: 'strong', score: 3 };
  if (score >= 2) return { level: 'medium', score: 2 };
  return { level: 'weak', score: 1 };
};

// ─── Components ────────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const cUser = user as CandidateUser;
  const [isLoading, setIsLoading] = useState(true);
  
  // General State
  const [name, setName] = useState(cUser?.name || '');
  const [phone, setPhone] = useState(cUser?.phone || '');
  const [bio, setBio] = useState(cUser?.bio || '');
  const [timezone, setTimezone] = useState(cUser?.timezone || 'Asia/Kolkata (GMT+5:30)');
  const [isGeneralSaving, setIsGeneralSaving] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState({
    applicationUpdates: cUser?.notificationPreferences?.applicationUpdates ?? true,
    interviewReminders: cUser?.notificationPreferences?.interviewReminders ?? true,
    feeRefundAlerts: cUser?.notificationPreferences?.feeRefundAlerts ?? true,
    marketingEmails: cUser?.notificationPreferences?.marketingEmails ?? false,
    pushNotifications: cUser?.notificationPreferences?.pushNotifications ?? true
  });
  const [permission, setPermission] = useState(getNotificationPermission());
  const [isNoteSaving, setIsNoteSaving] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPassSaving, setIsPassSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Privacy State
  const [privacy, setPrivacy] = useState({
    profileVisibility: cUser?.privacySettings?.profileVisibility ?? 'limited',
    showOnlineStatus: cUser?.privacySettings?.showOnlineStatus ?? true,
    showSalaryExpectation: cUser?.privacySettings?.showSalaryExpectation ?? true
  });
  const [isPrivacySaving, setIsPrivacySaving] = useState(false);

  // Preferences State
  const [prefs, setPrefs] = useState({
    language: cUser?.preferences?.language ?? 'English (India)',
    region: cUser?.preferences?.region ?? 'India',
    dateFormat: cUser?.preferences?.dateFormat ?? 'DD/MM/YYYY',
    currency: cUser?.preferences?.currency ?? 'INR'
  });
  const [isPrefsSaving, setIsPrefsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (mounted && data.success) {
          const u = data.user as CandidateUser;
          setName(u.name || '');
          setPhone(u.phone || '');
          setBio(u.bio || '');
          setTimezone(u.timezone || 'Asia/Kolkata (GMT+5:30)');
          if (u.notificationPreferences) setNotifications(u.notificationPreferences);
          if (u.privacySettings) setPrivacy(u.privacySettings);
          if (u.preferences) setPrefs(u.preferences);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load settings:', err);
          toast.error('Failed to load settings');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    fetchProfile();

    const interval = setInterval(() => {
      if (mounted) {
        setPermission(getNotificationPermission());
      }
    }, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleGeneralSave = async () => {
    setIsGeneralSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { name, phone, bio, timezone });
      if (data.success && data.user) {
        updateUser(data.user);
      }
      toast.success('General settings saved');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsGeneralSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setIsNoteSaving(true);
    try {
      const { data } = await api.put('/auth/notification-preferences', { notificationPreferences: notifications });
      if (data.success && data.user) {
        updateUser(data.user);
      }
      toast.success('Notification preferences saved');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setIsNoteSaving(false);
    }
  };

  const handleTogglePush = async () => {
    try {
      if (permission === 'granted') {
        const success = await unsubscribeFromPush();
        if (success) toast.success('Browser notifications disabled');
      } else {
        const success = await subscribeToPush();
        if (success) toast.success('Browser notifications enabled!');
        else toast.error('Check browser permission settings');
      }
      setPermission(getNotificationPermission());
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All fields are required');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setIsPassSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPassSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted successfully');
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handlePrivacySave = async () => {
    setIsPrivacySaving(true);
    try {
      const { data } = await api.put('/auth/privacy-settings', { privacySettings: privacy });
      if (data.success && data.user) {
        updateUser(data.user);
      }
      toast.success('Privacy settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsPrivacySaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await api.get('/auth/export-data', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'trusthire-my-data.json';
      link.click();
      toast.success('Data export started');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const handlePrefsSave = async () => {
    setIsPrefsSaving(true);
    try {
      const { data } = await api.put('/auth/preferences', { preferences: prefs });
      if (data.success && data.user) {
        updateUser(data.user);
      }
      toast.success('Preferences saved');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setIsPrefsSaving(false);
    }
  };

  const strength = getStrength(newPassword);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-xl font-bold text-gray-900 mb-4 heading-font">Settings</h1>

      {/* ─── SECTION 1: GENERAL ─── */}
      <Card className="p-4 border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 underline underline-offset-4 decoration-[#1B4D3E]/30">
          <Settings className="w-4 h-4 text-[#1B4D3E]" /> General
        </h2>
        <div className="space-y-4">
          <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          <Input label="Email" value={cUser?.email || ''} disabled icon={<Mail className="w-4 h-4" />} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" icon={<PhoneIcon className="w-4 h-4" />} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gray-400" /> Bio
            </label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={3} placeholder="Passionate developer..." className="text-sm" />
            <p className="text-[10px] text-gray-500 mt-1 text-right">{bio.length}/500 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-400" /> Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] bg-white transition"
            >
              {[
                "Asia/Kolkata (GMT+5:30)",
                "Asia/Dubai (GMT+4:00)",
                "Asia/Singapore (GMT+8:00)",
                "Europe/London (GMT+0:00)",
                "America/New_York (GMT-5:00)",
                "America/Los_Angeles (GMT-8:00)"
              ].map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <Button onClick={handleGeneralSave} disabled={isGeneralSaving} size="sm" className="px-6">
            {isGeneralSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* ─── SECTION 2: NOTIFICATIONS ─── */}
      <Card className="p-4 border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 underline underline-offset-4 decoration-[#1B4D3E]/30">
          <Bell className="w-4 h-4 text-[#1B4D3E]" /> Notifications
        </h2>
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Mail className="w-3 h-3" /> Email Notifications
          </p>
          {[
            { id: 'applicationUpdates', title: 'Application updates', desc: 'Get notified when your application status changes' },
            { id: 'interviewReminders', title: 'Interview reminders', desc: 'Receive reminder emails before scheduled interviews' },
            { id: 'feeRefundAlerts', title: 'Fee & refund alerts', desc: 'Get notified about Challenge Fee payments and refunds' },
            { id: 'marketingEmails', title: 'Marketing emails', desc: 'Tips, new features, and platform updates' }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!(notifications as any)[item.id]}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1B4D3E]"></div>
              </label>
            </div>
          ))}

          <div className="mt-6 pt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Monitor className="w-3 h-3" /> Browser Notifications
            </p>
            <div className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-500 text-xs mr-2 uppercase font-bold tracking-tighter">Status:</span>
                  {permission === 'granted' ? (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Enabled</span>
                  ) : permission === 'denied' ? (
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> Blocked</span>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">Not configured</span>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleTogglePush} 
                size="sm" 
                variant={permission === 'granted' ? 'secondary' : 'primary'}
                className="h-8 text-[10px] px-3 font-bold"
              >
                {permission === 'granted' ? 'Disable' : 'Enable'}
              </Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Real-time alerts</p>
                <p className="text-[11px] text-gray-500">Push notifications for interviews and status updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1B4D3E]"></div>
              </label>
            </div>
          </div>

          <Button onClick={handleNotificationSave} disabled={isNoteSaving} size="sm" className="mt-2 w-full sm:w-auto">
            {isNoteSaving ? 'Saving...' : 'Save Notification Preferences'}
          </Button>
        </div>
      </Card>

      {/* ─── SECTION 3: SECURITY & PASSWORD ─── */}
      <Card className="p-4 border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 underline underline-offset-4 decoration-[#1B4D3E]/30">
          <Lock className="w-4 h-4 text-[#1B4D3E]" /> Security & Password
        </h2>
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Update Security</p>
          <div className="space-y-3">
            <div className="relative">
              <Input 
                type={showCurrent ? 'text' : 'password'} label="Current Password" 
                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
              />
              <button 
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition p-1"
                onClick={() => setShowCurrent(!showCurrent)}
                type="button"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="relative">
              <Input 
                type={showNew ? 'text' : 'password'} label="New Password" 
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
              />
              <button 
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition p-1"
                onClick={() => setShowNew(!showNew)}
                type="button"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              {newPassword && (
                <div className="flex gap-1 mt-2 h-1 px-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-colors ${
                      strength.score >= i ? (strength.level === 'weak' ? 'bg-red-400' : strength.level === 'medium' ? 'bg-yellow-400' : 'bg-green-400') : 'bg-gray-100'
                    }`} />
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Input 
                type={showConfirm ? 'text' : 'password'} label="Confirm New Password" 
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
              />
              <button 
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition p-1"
                onClick={() => setShowConfirm(!showConfirm)}
                type="button"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <Button onClick={handlePasswordUpdate} disabled={isPassSaving} size="sm" variant="secondary" className="w-full font-bold uppercase tracking-widest text-[10px]">
              {isPassSaving ? 'Updating...' : 'Verify & Update Password'}
            </Button>
          </div>

          <div className="pt-4">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-red-50 pb-1">Danger Zone</p>
            <div className="py-3 px-4 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-red-900 leading-none mb-1">Delete Account</p>
                <p className="text-[10px] text-red-700/70 font-medium">Permanently remove all your profile data and application history.</p>
              </div>
              <Button 
                onClick={() => setIsDeleteModalOpen(true)} 
                size="sm" 
                variant="danger" 
                className="h-8 text-[10px] px-4 font-bold border-red-200 bg-white text-red-600 hover:bg-red-50 shadow-sm"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── SECTION 4: PRIVACY ─── */}
      <Card className="p-4 border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 underline underline-offset-4 decoration-[#1B4D3E]/30">
          <Eye className="w-4 h-4 text-[#1B4D3E]" /> Privacy
        </h2>
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Profile Visibility</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'public', title: 'Public profile', desc: 'Any recruiter can find and view your details' },
              { id: 'limited', title: 'Limited access', desc: 'Only recruiters whose jobs you apply to' },
              { id: 'private', title: 'Completely private', desc: 'Hidden from all search and recruiter tools' }
            ].map(opt => (
              <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                privacy.profileVisibility === opt.id ? 'border-[#1B4D3E] bg-green-50/30' : 'border-gray-100 hover:border-gray-200'
              }`}>
                <input 
                  type="radio" name="visibility" checked={privacy.profileVisibility === opt.id}
                  onChange={() => setPrivacy(prev => ({ ...prev, profileVisibility: opt.id }))}
                  className="mt-1 w-3.5 h-3.5 text-[#1B4D3E] border-gray-300 focus:ring-[#1B4D3E]"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.title}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-50 pt-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Data Transfer</p>
              <p className="text-[11px] text-gray-500 font-medium">Export all your personal data in JSON format</p>
            </div>
            <Button onClick={handleExportData} size="sm" variant="secondary" className="h-8 text-[10px] px-3 font-bold flex items-center gap-1.5">
              <Download className="w-3 h-3" /> Export
            </Button>
          </div>

          <Button onClick={handlePrivacySave} disabled={isPrivacySaving} size="sm" className="w-full">
            {isPrivacySaving ? 'Saving...' : 'Confirm Privacy Settings'}
          </Button>
        </div>
      </Card>

      {/* ─── SECTION 5: PREFERENCES ─── */}
      <Card className="p-4 border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 underline underline-offset-4 decoration-[#1B4D3E]/30">
          <Globe className="w-4 h-4 text-[#1B4D3E]" /> Preferences
        </h2>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Language</label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select
                  value={prefs.language}
                  onChange={(e) => {
                    if (e.target.value !== 'English (India)') {
                      toast('Coming soon!', { icon: '⏳' });
                      return;
                    }
                    setPrefs(prev => ({ ...prev, language: e.target.value }));
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-[#1B4D3E]"
                >
                  {["English (India)", "English (US)", "English (UK)", "Hindi", "Tamil"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Region</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select
                  value={prefs.region}
                  onChange={(e) => setPrefs(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-[#1B4D3E]"
                >
                  {["India", "United States", "United Kingdom", "UAE", "Singapore"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Currency Display</label>
             <div className="flex flex-wrap gap-2">
               {[
                 { id: 'INR', label: 'INR (₹)', icon: IndianRupee },
                 { id: 'USD', label: 'USD ($)', icon: DollarSign },
                 { id: 'EUR', label: 'EUR (€)', icon: Euro }
               ].map(opt => (
                 <label key={opt.id} className={`flex-1 min-w-[80px] flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                   prefs.currency === opt.id ? 'border-[#1B4D3E] bg-green-50 text-[#1B4D3E]' : 'border-gray-100 text-gray-400'
                 }`}>
                   <input type="radio" name="currency" checked={prefs.currency === opt.id} onChange={() => setPrefs(prev => ({ ...prev, currency: opt.id }))} className="sr-only" />
                   <opt.icon className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                 </label>
               ))}
             </div>
          </div>

          <Button onClick={handlePrefsSave} disabled={isPrefsSaving} size="sm" className="w-full">
            {isPrefsSaving ? 'Saving...' : 'Save All Preferences'}
          </Button>
        </div>
      </Card>

      {/* ─── MODALS ─── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeleteInput(''); }} title="Delete Account Permanently">
        <div className="p-1">
          <div className="flex items-start gap-4 mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
            <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900 mb-1">Destructive Action Warning</p>
              <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                This will wipe your Entire account history, including job applications, interview history, and profile data. <strong>This action is irreversible.</strong>
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">To continue, please type <span className="font-bold text-red-600 underline">DELETE</span> below:</p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-red-500 transition-all text-center font-black text-lg tracking-[0.4em] uppercase"
                placeholder="DELETE"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => { setIsDeleteModalOpen(false); setDeleteInput(''); }}
                variant="secondary"
                className="flex-1 font-bold"
              >
                Abort
              </Button>
              <Button 
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || isDeleting}
                variant="danger"
                className="flex-1 font-bold shadow-lg shadow-red-500/20"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Deletion'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;