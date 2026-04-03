import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Lock, 
  Eye, 
  Trash2, 
  ChevronRight, 
  Globe, 
  Mail, 
  AlertTriangle,
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
  const { user, logout } = useAuth();
  const [permission, setPermission] = useState(getNotificationPermission());
  const [isPushLoading, setIsPushLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    jobAlerts: true,
    applicationStatus: true,
    marketing: false,
    security: true
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
    toast.success('Setting updated');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-500 text-sm">Manage your preferences, security, and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-2 border-none shadow-sm">
            <nav className="space-y-1">
              {[
                { label: 'General', icon: Settings, active: true },
                { label: 'Notifications', icon: Bell },
                { label: 'Security & Password', icon: Lock },
                { label: 'Privacy', icon: Eye },
                { label: 'Language & Region', icon: Globe }
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active 
                      ? 'bg-[#1B4D3E] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-gray-400'}`} />
                    {item.label}
                  </span>
                  {!item.active && <ChevronRight className="w-4 h-4 text-gray-300" />}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Push Notifications Card */}
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="bg-[#1B4D3E] bg-opacity-[0.03] p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <Monitor className="w-5 h-5 text-[#1B4D3E]" />
                <h3 className="text-lg font-bold text-gray-900">Browser Push Notifications</h3>
              </div>
              <p className="text-sm text-gray-500">Get real-time alerts on your device even when TrustHire is not open.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Status:</span>
                    {permission === 'granted' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Enabled
                      </span>
                    ) : permission === 'denied' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 max-w-sm">
                    {permission === 'denied' 
                      ? "Notifications are blocked by your browser. Please allow them in your site settings to receive alerts."
                      : "We'll send you a push notification for important updates like new messages or interview requests."}
                  </p>
                </div>

                <Button 
                  onClick={handleTogglePush}
                  disabled={isPushLoading || permission === 'unsupported'}
                  variant={permission === 'granted' ? 'secondary' : 'primary'}
                  size="sm"
                  className="min-w-[140px]"
                >
                  {isPushLoading ? 'Processing...' : permission === 'granted' ? 'Disable' : 'Enable Notifications'}
                </Button>
              </div>

              {permission === 'denied' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 italic text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <p>To re-enable, click the lock/info icon in your browser's address bar and set Notifications to 'Allow'.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Regular Notifications Section */}
          <Card className="border-none shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" />
              In-App Notification Preferences
            </h3>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 pb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize text-sm">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-xs text-gray-500">Enable or disable alerts for this category.</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification(key as any)}
                    className={`w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                      value ? 'bg-[#1B4D3E]' : 'bg-gray-200'
                    } relative`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Security Section (Partial view) */}
          <Card className="border-none shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              Security Settings
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Email Address" 
                  value={user?.email || ''} 
                  disabled 
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Change Password</h4>
                  <p className="text-xs text-gray-500">Update your account password regularly.</p>
                </div>
                <Button variant="secondary" size="sm">Update</Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-none shadow-sm border-l-4 border-l-red-500 bg-red-50/20">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Delete Account</h4>
                  <p className="text-xs text-gray-500">Permanently delete your account and all data.</p>
                </div>
                <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;