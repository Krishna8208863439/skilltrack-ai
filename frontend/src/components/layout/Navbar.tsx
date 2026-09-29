import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiBell,
  HiLogout,
  HiOutlineExternalLink,
  HiCheckCircle,
  HiInformationCircle,
  HiExclamation,
  HiXCircle,
  HiX,
  HiCheck,
  HiOutlineTrash,
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const typeStyles: Record<string, { icon: React.ReactNode; bg: string; border: string; iconColor: string }> = {
  success: {
    icon: <HiCheckCircle className="w-4 h-4" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  info: {
    icon: <HiInformationCircle className="w-4 h-4" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: <HiExclamation className="w-4 h-4" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
  },
  error: {
    icon: <HiXCircle className="w-4 h-4" />,
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconColor: 'text-rose-500',
  },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roleBadgeColors: Record<string, string> = {
    CANDIDATE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    INSTITUTE: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    EMPLOYER: 'bg-amber-100 text-amber-800 border-amber-300',
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  // Fetch notifications list (called when dropdown opens)
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // silently fail — don't spam toasts on poll
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll unread count every 30s while logged in
  useEffect(() => {
    if (!user) return;
    const pollCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unreadCount);
      } catch { /* ignore */ }
    };
    pollCount();
    const interval = setInterval(pollCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      setUnreadCount(res.data.unreadCount);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.delete(`/notifications/${id}`);
      setUnreadCount(res.data.unreadCount);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(res.data.notifications);
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        const res = await api.patch(`/notifications/${notif.id}/read`);
        setUnreadCount(res.data.unreadCount);
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch { /* ignore */ }
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            ST
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-navy-900 tracking-tight">SkillTrack AI</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                SIH 2026 • PS-26135
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">Skill Gap & Employment Intelligence Platform</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadgeColors[user.role] || 'bg-slate-100 text-slate-800'}`}>
              {user.role}
            </span>

            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                title="Notifications"
                onClick={() => setOpen(prev => !prev)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
              >
                <HiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <HiBell className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                          title="Mark all as read"
                        >
                          <HiCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                    {loading ? (
                      <div className="py-10 text-center text-xs text-slate-400 animate-pulse">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <HiBell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-500">All caught up!</p>
                        <p className="text-xs text-slate-400 mt-0.5">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        const style = typeStyles[notif.type] || typeStyles.info;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                              notif.isRead
                                ? 'bg-white hover:bg-slate-50'
                                : 'bg-blue-50/40 hover:bg-blue-50'
                            }`}
                          >
                            {/* Type icon */}
                            <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.iconColor} border ${style.border}`}>
                              {style.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs font-semibold leading-snug ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{timeAgo(notif.createdAt)}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                {notif.message}
                              </p>
                              {notif.link && (
                                <span className="text-[10px] text-brand-500 font-medium mt-1 flex items-center gap-0.5">
                                  <HiOutlineExternalLink className="w-3 h-3" />
                                  View details
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => handleMarkRead(notif.id, e)}
                                  title="Mark as read"
                                  className="w-6 h-6 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 flex items-center justify-center transition-colors"
                                >
                                  <HiCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDelete(notif.id, e)}
                                title="Delete"
                                className="w-6 h-6 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                              >
                                <HiX className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Unread dot */}
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
                    <Link
                      to="/notifications"
                      onClick={() => setOpen(false)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                    >
                      View all notifications →
                    </Link>
                    {notifications.length > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            await api.delete('/notifications');
                            setNotifications([]);
                            setUnreadCount(0);
                          } catch {
                            toast.error('Failed to clear notifications');
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 font-medium transition-colors"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            >
              <HiLogout className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
