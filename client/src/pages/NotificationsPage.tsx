import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { notificationIconMap } from '../utils/notificationIcons';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

type Notification = {
  _id: string;
  type: keyof typeof notificationIconMap;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (nextPage = page, nextUnreadOnly = unreadOnly) => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', {
        params: { page: nextPage, limit: 20, unreadOnly: nextUnreadOnly }
      });
      setItems(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err: any) {
      setItems([]);
      console.error('Failed to load notifications:', err.response?.data?.message || err.message);
      setError('Unable to load notifications at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, unreadOnly);
    const interval = setInterval(() => fetchData(page, unreadOnly), 30000);
    return () => clearInterval(interval);
  }, [page, unreadOnly]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      await fetchData(page, unreadOnly);
      toast.success('Notifications marked as read');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update notifications');
    }
  };

  const openItem = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await api.put(`/notifications/${notification._id}/read`);
      }
      if (notification.link) {
        navigate(notification.link);
      } else {
        await fetchData(page, unreadOnly);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to open notification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
        <Button variant="primary" size="sm" onClick={markAllRead}>Mark all read</Button>
      </div>

      <div className="flex items-center gap-3 border-b border-gray-200">
        <button
          className={`px-3 py-2 text-sm ${!unreadOnly ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600'}`}
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
        >
          All
        </button>
        <button
          className={`px-3 py-2 text-sm ${unreadOnly ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600'}`}
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
        >
          Unread
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{error}</p>
          <button onClick={() => fetchData()} className="text-[#1B4D3E] font-semibold hover:underline mt-2">
            Try again
          </button>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((notification) => {
            const { Icon, colorClass } =
              notificationIconMap[notification.type] || notificationIconMap.application_submitted;

            return (
              <div
                key={notification._id}
                onClick={() => openItem(notification)}
                className={`p-4 rounded-lg border ${notification.isRead ? 'bg-white' : 'bg-[#EFF6FF]'} cursor-pointer hover:bg-gray-50`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${colorClass}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-gray-700">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No notifications"
          description={unreadOnly ? 'You have no unread notifications right now.' : 'Notifications will appear here as application activity happens.'}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            className="px-3 py-1.5 border rounded disabled:opacity-50"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            className="px-3 py-1.5 border rounded disabled:opacity-50"
            onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
