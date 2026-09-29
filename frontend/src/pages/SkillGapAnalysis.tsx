import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import {
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineAcademicCap,
  HiOutlineInformationCircle,
} from 'react-icons/hi';

export const SkillGapAnalysis: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('job-1');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.data.success) {
          setJobs(res.data.jobs);
          if (res.data.jobs.length > 0) {
            setSelectedJobId(res.data.jobs[0].id);
          }
        }
      } catch (err) {
        toast.error('Failed to load jobs');
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    const runAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.post('/skill-gap/analyze', { jobId: selectedJobId });
        if (res.data.success) {
          setAnalysisData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to analyze skill gap');
      } finally {
        setLoading(false);
      }
    };
    runAnalysis();
  }, [selectedJobId]);

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Skill Gap Diagnosis & Radar Matrix</h1>
            <p className="text-xs text-slate-500">
              Deterministic weighted evaluation against industry role specifications.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-semibold text-slate-700">Target Role:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white shadow-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Explainable Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-300/80 text-xs text-slate-700 flex items-start gap-3">
          <HiOutlineInformationCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Explainable Scoring Standard:</span> Compatibility score is computed deterministically using: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono">Sum(ImportanceWeight * ProficiencyCredit) / Sum(Weights)</code>. This reflects objective curriculum qualification alignment, <span className="font-semibold underline">not a statistical likelihood of being hired</span>.
          </div>
        </div>

        {/* Score Row */}
        {analysisData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Compatibility</p>
                <p className="text-3xl font-extrabold text-brand-600 mt-1">{analysisData.matchPercentage}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Weighted curriculum alignment</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-base">
                {analysisData.matchPercentage}%
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Skill Gap</p>
                <p className="text-3xl font-extrabold text-rose-600 mt-1">{analysisData.skillGapScore}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Missing or below min level</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-base">
                {analysisData.skillGapScore}%
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actionable Strategy</p>
                <p className="text-xs font-semibold text-slate-800 mt-1 leading-snug">
                  {analysisData.actionPlan}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {analysisData && (
          <div className="grid grid-cols-1 gap-6">
            {/* Missing Skills Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HiOutlineExclamation className="w-4 h-4 text-rose-600" />
                <span>Detected Skill Gaps ({analysisData.missingSkills.length})</span>
              </h3>

              {analysisData.missingSkills.length === 0 ? (
                <div className="p-6 text-center text-emerald-600 text-xs font-semibold">
                  Congratulations! You meet all mandatory skill requirements for this role.
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisData.missingSkills.map((ms: any) => (
                    <div
                      key={ms.name}
                      className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{ms.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ms.importance === 'REQUIRED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {ms.importance}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Target Level Needed: Level {ms.requiredProficiency} • Current: Level 0
                        </p>
                      </div>

                      <Link
                        to="/courses"
                        className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shrink-0"
                      >
                        Bridge Gap
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Skills */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Matching Proficiencies ({analysisData.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.matchedSkills.map((sk: any) => (
                    <span
                      key={sk.name}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1"
                    >
                      <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{sk.name} (Lvl {sk.currentProficiency}/{sk.requiredProficiency})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
