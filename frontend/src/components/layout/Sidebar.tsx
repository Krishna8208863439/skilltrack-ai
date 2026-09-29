import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineBell,
} from 'react-icons/hi';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'CANDIDATE';
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unreadCount);
      } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const candidateNav: NavItem[] = [
    { label: 'Overview', path: '/dashboard', icon: HiOutlineHome },
    { label: 'My Profile & Skills', path: '/profile', icon: HiOutlineUserCircle },
    { label: 'AI Resume Parser', path: '/resume', icon: HiOutlineDocumentText },
    { label: 'Skill Gap Analysis', path: '/skill-gap', icon: HiOutlineChartBar },
    { label: 'Job Matches', path: '/jobs', icon: HiOutlineBriefcase },
    { label: 'Course Recommender', path: '/courses', icon: HiOutlineAcademicCap },
    { label: 'Placement Tracking', path: '/tracking', icon: HiOutlineCheckCircle },
    { label: 'Notifications', path: '/notifications', icon: HiOutlineBell, badge: unreadCount },
  ];

  const instituteNav: NavItem[] = [
    { label: 'Institute Portal', path: '/institute', icon: HiOutlineAcademicCap },
    { label: 'Training Cohorts', path: '/institute', icon: HiOutlineClipboardList },
    { label: 'Student Placements', path: '/tracking', icon: HiOutlineCheckCircle },
    { label: 'Notifications', path: '/notifications', icon: HiOutlineBell, badge: unreadCount },
  ];

  const employerNav: NavItem[] = [
    { label: 'Recruiter Hub', path: '/employer', icon: HiOutlineBriefcase },
    { label: 'Talent Search (Consent)', path: '/employer', icon: HiOutlineUsers },
    { label: 'Active Pipeline', path: '/tracking', icon: HiOutlineClipboardList },
    { label: 'Notifications', path: '/notifications', icon: HiOutlineBell, badge: unreadCount },
  ];

  const adminNav: NavItem[] = [
    { label: 'National Analytics', path: '/admin', icon: HiOutlineChartBar },
    { label: 'Placements & Audit', path: '/admin', icon: HiOutlineShieldCheck },
    { label: 'Notifications', path: '/notifications', icon: HiOutlineBell, badge: unreadCount },
  ];

  let items = candidateNav;
  if (role === 'INSTITUTE') items = instituteNav;
  else if (role === 'EMPLOYER') items = employerNav;
  else if (role === 'ADMIN') items = adminNav;

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-200 shadow-xs">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {role} Workspace
        </p>
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.path + item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-xs border border-brand-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 m-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Status: Live
        </div>
        <p className="text-[11px] text-slate-500">SIH 2026 • PS-26135</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Code Warriors • Gov Intel</p>
      </div>
    </aside>
  );
};
