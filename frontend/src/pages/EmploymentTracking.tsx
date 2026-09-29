import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlineShieldCheck,
  HiOutlineExternalLink,
} from 'react-icons/hi';

export const EmploymentTracking: React.FC = () => {
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const res = await api.get('/tracking/pipeline');
        if (res.data.success) {
          setPipeline(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load tracking data');
      } finally {
        setLoading(false);
      }
    };
    fetchPipeline();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-navy-900">Employment & Placement Tracking</h1>
          <p className="text-xs text-slate-500">
            End-to-end verified workflow from application through technical interview to authenticated placement.
          </p>
        </div>

        {/* Active Applications */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineBriefcase className="w-4 h-4 text-brand-600" />
            <span>Active Candidate Applications ({pipeline?.applications?.length || 0})</span>
          </h2>

          {pipeline?.applications?.map((app: any) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{app.jobTitle}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{app.company} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Qualification Score: </span>
                  <span className="text-sm font-extrabold text-brand-600">{app.matchScore}%</span>
                </div>
              </div>

              {/* Status History Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Status Transition Audit Trail
                </h4>
                <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {app.statusHistory?.map((hist: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white"></div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">{hist.status}</span>
                        <span className="text-slate-400 ml-2 text-[11px]">{new Date(hist.changedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{hist.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scheduled Interviews */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineCalendar className="w-4 h-4 text-indigo-600" />
            <span>Scheduled Technical Interviews</span>
          </h2>

          {pipeline?.interviews?.map((int: any) => (
            <div
              key={int.id}
              className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {int.round}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{int.jobTitle}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">Interviewer: {int.interviewer}</p>
                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                  Scheduled Time: {new Date(int.scheduledAt).toLocaleString()}
                </p>
              </div>

              <a
                href={int.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-center"
              >
                <span>Join Video Room</span>
                <HiOutlineExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Verified Employment Outcomes */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Employment Outcomes & Placement Records</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pipeline?.outcomes?.map((out: any) => (
              <div
                key={out.id}
                className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{out.candidateName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {out.verificationStatus}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{out.jobTitle} • {out.employerName}</p>
                <p className="text-xs text-slate-500">
                  Offer Date: {new Date(out.offerDate).toLocaleDateString()}
                </p>
                <div className="text-[11px] text-emerald-700 font-medium pt-1">
                  ✓ Verified by accredited organization with authenticated offer repository.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
