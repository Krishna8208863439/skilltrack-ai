import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineShieldCheck,
  HiOutlineDownload,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/audit-logs'),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (logsRes.data.success) setAuditLogs(logsRes.data.logs);
      } catch (err) {
        toast.error('Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDownloadCSV = async () => {
    try {
      const res = await api.get('/admin/export-csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SkillTrack_Employment_Intelligence_Report_2026.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('CSV report downloaded successfully.');
    } catch {
      toast.error('Failed to export report. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">National Employment Intelligence & Governance</h1>
            <p className="text-xs text-slate-500">
              Ministry of Skill Development & Higher Education • SIH 2026 PS-26135
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm flex items-center gap-2 self-start"
          >
            <HiOutlineDownload className="w-4 h-4" />
            <span>Export Verified CSV Report</span>
          </button>
        </div>

        {/* 4 Macro KPI Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Registry</span>
              <p className="text-3xl font-extrabold text-navy-900 mt-1">{stats.overview.totalCandidates}</p>
              <p className="text-xs text-slate-500 mt-0.5">Across 48 partner institutes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Placements</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.overview.totalPlaced}</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">Backed by verified offer letters</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Conversion Rate</span>
              <p className="text-3xl font-extrabold text-brand-600 mt-1">{stats.overview.placementRatePercentage}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Formula: Placed ÷ Completed Cohorts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Days to Placement</span>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.overview.averageDaysToPlacement} Days</p>
              <p className="text-xs text-slate-500 mt-0.5">From course completion</p>
            </div>
          </div>
        )}

        {/* Institute Performance Table */}
        {stats && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <HiOutlineAcademicCap className="w-4 h-4 text-indigo-600" />
              <span>Top Performing Vocational Institutes</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Institute</th>
                    <th className="py-2.5 px-3">Enrolled</th>
                    <th className="py-2.5 px-3">Placed</th>
                    <th className="py-2.5 px-3 text-right">Placement Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.institutePerformance?.map((inst: any) => (
                    <tr key={inst.name} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{inst.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{inst.students}</td>
                      <td className="py-2.5 px-3 text-slate-600">{inst.placed}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-brand-600">{inst.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Compliance & Verification Audit Logs</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Target Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{log.actor}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{log.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
