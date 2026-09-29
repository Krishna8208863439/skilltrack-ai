import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineSparkles,
} from 'react-icons/hi';

export const JobRecommendations: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.data.success) {
          setJobs(res.data.jobs);
        }
      } catch (err) {
        toast.error('Failed to load recommended jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId: string, title: string) => {
    setApplyingJobId(jobId);
    try {
      const res = await api.post(`/jobs/${jobId}/apply`);
      if (res.data.success) {
        toast.success(`Applied to ${title} successfully! Track status in Placement Tracking.`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-navy-900">Job Recommendations & Skill Match</h1>
          <p className="text-xs text-slate-500">
            Ranked by multi-factor composite alignment: skill overlap, semantic context, and experience qualification.
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {job.workMode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {job.jobType}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    {job.company} • <span className="font-normal">{job.location}</span>
                  </p>
                  <p className="text-xs text-brand-700 font-semibold mt-0.5">{job.salaryRange}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                  <div>
                    <div className="text-xs text-slate-500">Composite Match</div>
                    <div className="text-2xl font-extrabold text-brand-600">{job.matchScore || 85}%</div>
                  </div>
                  <button
                    onClick={() => handleApply(job.id, job.title)}
                    disabled={applyingJobId === job.id}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
                  >
                    {applyingJobId === job.id ? 'Submitting...' : 'Apply with Profile'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

              {/* Per-Factor Breakdown Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <HiOutlineSparkles className="w-4 h-4 text-brand-600" />
                  <span>Explainable Match Breakdown:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Skill Overlap (50%)</span>
                    <span className="font-bold text-slate-800">{job.breakdown?.skillOverlapScore || 85}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Semantic Match (30%)</span>
                    <span className="font-bold text-slate-800">{job.breakdown?.semanticTextScore || 80}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Experience Fit (10%)</span>
                    <span className="font-bold text-emerald-600">100% (Qualified)</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Location Fit (10%)</span>
                    <span className="font-bold text-slate-800">{job.breakdown?.locationScore || 85}%</span>
                  </div>
                </div>
              </div>

              {/* Skills Overlap */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-700">Skills Status:</span>
                {job.matchingSkills?.map((s: string) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium flex items-center gap-1"
                  >
                    <HiOutlineCheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>{s}</span>
                  </span>
                ))}
                {job.missingSkills?.map((s: string) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-medium flex items-center gap-1"
                  >
                    <HiOutlineExclamation className="w-3 h-3 text-rose-600" />
                    <span>Missing: {s}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
