import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Lock, 
  Trash2, 
  ChevronRight, 
  Mail, 
  AlertTriangle,
  CreditCard,
  Building,
  Users,
  Monitor,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { subscribeToPush, unsubscribeFromPush, getNotificationPermission } from '../../utils/pushNotifications';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState(getNotificationPermission());
  const [isPushLoading, setIsPushLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    newApplications: true,
    interviewConfirmations: true,
    weeklyDigest: false,
    platformUpdates: true
  });

  useEffect(() => {
    // Sync permission state periodically or on focus
    const interval = setInterval(() => {
      setPermission(getNotificationPermission());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePush = async () => {
    setIsPushLoading(true);
    try {
      if (permission === 'granted') {
        const success = await unsubscribeFromPush();
        if (success) {
          toast.success('Browser notifications disabled');
        }
      } else {
        const success = await subscribeToPush();
        if (success) {
          toast.success('Browser notifications enabled!');
        } else {
          toast.error('Failed to enable notifications. Direct permission might be needed.');
        }
      }
      setPermission(getNotificationPermission());
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsPushLoading(false);
    }
  };

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification setting updated');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Recruiter Settings</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your account, team, and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-1 border-none shadow-sm">
            <nav className="space-y-0.5">
              {[
                { label: 'Account Settings', icon: Settings, active: true },
                { label: 'Company Profile', icon: Building },
                { label: 'Team Members', icon: Users },
                { label: 'Billing & Plans', icon: CreditCard },
                { label: 'Security', icon: Lock },
                { label: 'Notifications', icon: Bell }
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded text-sm font-medium transition-all duration-200 ${
                    item.active 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </span>
                  {!item.active && <ChevronRight className="w-4 h-4 text-slate-300" />}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Push Notifications Card */}
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="bg-blue-50/30 p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Browser Push Notifications</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Get device-level alerts even when TrustHire is minimized.</p>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status:</span>
                    {permission === 'granted' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Enabled
                      </span>
                    ) : permission === 'denied' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
                        <XCircle className="w-2.5 h-2.5" /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-sm">
                    {permission === 'denied' 
                      ? "Notifications are currently blocked by your browser settings."
                      : "Notifications will show up on your desktop/mobile for new priority applications and interview updates."}
                  </p>
                </div>

                <Button 
                  onClick={handleTogglePush}
                  disabled={isPushLoading || permission === 'unsupported'}
                  variant={permission === 'granted' ? 'secondary' : 'primary'}
                  size="sm"
                  className="rounded px-6 h-9"
                >
                  {isPushLoading ? 'Wait...' : permission === 'granted' ? 'Disable' : 'Enable'}
                </Button>
              </div>

              {permission === 'denied' && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded flex gap-2 italic text-[10px] font-medium text-amber-800">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <p>Reset permission via lock icon in address bar → Notifications → Allow.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recruitment Notifications */}
          <Card className="border-none shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              In-App Notification Preferences
            </h3>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">Control alerts for this recruitment event.</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification(key as any)}
                    className={`w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                      value ? 'bg-blue-600' : 'bg-slate-200'
                    } relative`}
                  >
                    <span className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                      value ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Profile Settings */}
          <Card className="border-none shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Account Settings
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Work Email" 
                  value={user?.email || ''} 
                  disabled 
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Security</h4>
                  <p className="text-xs text-slate-500 font-medium">Keep your credentials updated for safety.</p>
                </div>
                <Button variant="secondary" size="sm" className="rounded">Update</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;