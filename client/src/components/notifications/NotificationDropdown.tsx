import React, { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BellOff, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { notificationIconMap } from '../../utils/notificationIcons';

type Notification = {
  _id: string;
  type: keyof typeof notificationIconMap;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

interface Props {
  onClose: () => void;
  onUpdatedCount: (count: number) => void;
}

const NotificationDropdown: React.FC<Props> = ({ onClose, onUpdatedCount }) => {
  const [items, setItems] = useState<Notification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/recruiter') ? '/recruiter' : '/dashboard';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { page: 1, limit: 10 } });
      setItems(data.data || []);
      onUpdatedCount(data.unreadCount || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [onUpdatedCount]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      await fetchData();
    } catch {
      // ignore
    }
  };

  const openItem = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await api.put(`/notifications/${notification._id}/read`);
      }
      await fetchData();
    } catch {
      // ignore
    } finally {
      if (notification.link) {
        navigate(notification.link);
      }
      onClose();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">
          Mark all read
        </button>
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse h-14 bg-gray-100 rounded" />
            ))}
          </div>
        )}

        {!loading && items && items.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <BellOff className="w-5 h-5 text-gray-400" />
            </div>
            No notifications yet
          </div>
        )}

        {!loading && items && items.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {items.map((notification) => {
              const { Icon, colorClass } =
                notificationIconMap[notification.type] || notificationIconMap.application_submitted;

              return (
                <li
                  key={notification._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-[#EFF6FF]' : 'bg-white'}`}
                  onClick={() => openItem(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className={`w-5 h-5 ${colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-100 p-2">
        <button
          className="w-full text-sm text-blue-600 hover:bg-blue-50 py-2 rounded-md"
          onClick={() => {
            navigate(`${basePath}/notifications`);
            onClose();
          }}
        >
          {'View All Notifications ->'}
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
