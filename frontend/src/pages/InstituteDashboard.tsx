import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineBadgeCheck,
  HiOutlineClipboardList,
} from 'react-icons/hi';

export const InstituteDashboard: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/institute/programs');
        if (res.data.success) {
          setPrograms(res.data.programs);
          setEnrollments(res.data.enrollments);
        }
      } catch (err) {
        toast.error('Failed to load institute data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerify = async (enrId: string, skill: string) => {
    setVerifyingId(enrId);
    try {
      const res = await api.post('/institute/verify-completion', {
        enrollmentId: enrId,
        finalScore: 92,
        skillNameToVerify: skill,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh
        const refresh = await api.get('/institute/programs');
        if (refresh.data.success) {
          setEnrollments(refresh.data.enrollments);
        }
      }
    } catch (err) {
      toast.error('Failed to verify training completion');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-navy-900">Training Institute & College Portal</h1>
          <p className="text-xs text-slate-500">
            IIT Delhi Skill Development Center • Institute Code: IITD-SKILL-01
          </p>
        </div>

        {/* Top Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled Cohort</span>
            <p className="text-2xl font-extrabold text-navy-900 mt-1">180 Students</p>
            <p className="text-xs text-slate-500 mt-0.5">Across 4 Government-approved programs</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placed Candidates</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">142 Placed</p>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">Verified Employment Outcomes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institutional Placement Rate</span>
            <p className="text-2xl font-extrabold text-brand-600 mt-1">78.8%</p>
            <p className="text-xs text-slate-500 mt-0.5">Formula: Placed ÷ Completed Cohort</p>
          </div>
        </div>

        {/* Training Programs */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineClipboardList className="w-4 h-4 text-brand-600" />
            <span>Active Skill Cohorts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    prog.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {prog.status}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{prog.durationWeeks} Weeks • {prog.mode}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{prog.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {prog.skillsTaught?.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Enrollment & Verification Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <HiOutlineUsers className="w-4 h-4 text-indigo-600" />
              <span>Student Completion & Skill Upgrade Verification</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Final Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{enr.candidateName}</td>
                    <td className="py-3 px-4 text-slate-600">{enr.attendanceRate}%</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {enr.finalScore ? `${enr.finalScore}%` : 'Pending Exam'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        enr.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {enr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleVerify(enr.id, 'Docker')}
                        disabled={verifyingId === enr.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                      >
                        {verifyingId === enr.id ? 'Upgrading...' : 'Verify & Upgrade Skill'}
                      </button>
                    </td>
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
