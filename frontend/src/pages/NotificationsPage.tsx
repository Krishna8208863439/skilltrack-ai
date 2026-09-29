import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  HiBell,
  HiCheckCircle,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
  HiCheck,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiFilter,
} from 'react-icons/hi';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

type FilterType = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error';

const typeConfig: Record<string, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconColor: string;
  label: string;
  badgeBg: string;
  badgeText: string;
}> = {
  success: {
    icon: <HiCheckCircle className="w-5 h-5" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    label: 'Success',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  info: {
    icon: <HiInformationCircle className="w-5 h-5" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    label: 'Info',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  warning: {
    icon: <HiExclamation className="w-5 h-5" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    label: 'Warning',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  error: {
    icon: <HiXCircle className="w-5 h-5" />,
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconColor: 'text-rose-500',
    label: 'Alert',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
  },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const handleMarkRead = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      setUnreadCount(res.data.unreadCount);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id + '-del');
    try {
      const res = await api.delete(`/notifications/${id}`);
      setUnreadCount(res.data.unreadCount);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(res.data.notifications);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) await handleMarkRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'success', label: 'Success', count: notifications.filter(n => n.type === 'success').length },
    { key: 'info', label: 'Info', count: notifications.filter(n => n.type === 'info').length },
    { key: 'warning', label: 'Warning', count: notifications.filter(n => n.type === 'warning').length },
    { key: 'error', label: 'Alert', count: notifications.filter(n => n.type === 'error').length },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <HiBell className="w-6 h-6 text-brand-600" />
              Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'You are all caught up'}
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors"
                >
                  <HiCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
              >
                <HiOutlineTrash className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <HiFilter className="w-4 h-4 text-slate-400 mr-1" />
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-4 p-5 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-2/3" />
                    <div className="h-2 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <HiBell className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {filter === 'all'
                  ? "We'll notify you about important updates here."
                  : 'Try a different filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(notif => {
                const style = typeConfig[notif.type] || typeConfig.info;
                const isDeleting = actionLoading === notif.id + '-del';
                const isMarking = actionLoading === notif.id;

                return (
                  <div
                    key={notif.id}
                    className={`group flex items-start gap-4 p-5 transition-colors cursor-pointer ${
                      notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/30 hover:bg-blue-50/60'
                    } ${isDeleting ? 'opacity-50' : ''}`}
                    onClick={() => handleNotifClick(notif)}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.iconColor} border ${style.border}`}>
                      {style.icon}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-bold leading-snug ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                            {notif.title}
                          </p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${style.badgeBg} ${style.badgeText}`}>
                            {style.label}
                          </span>
                          {!notif.isRead && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(notif.createdAt)}</span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{notif.message}</p>

                      {notif.link && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-brand-500 hover:text-brand-700 font-semibold transition-colors">
                          <HiOutlineExternalLink className="w-3.5 h-3.5" />
                          View details
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}
                    >
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          disabled={isMarking}
                          title="Mark as read"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors disabled:opacity-50"
                        >
                          <HiCheck className="w-3.5 h-3.5" />
                          {isMarking ? '...' : 'Read'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        disabled={isDeleting}
                        title="Delete notification"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary footer */}
        {!loading && notifications.length > 0 && (
          <p className="text-center text-[11px] text-slate-400">
            Showing {filtered.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};
