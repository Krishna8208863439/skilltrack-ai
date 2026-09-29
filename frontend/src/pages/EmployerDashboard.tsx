import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiCheck,
} from 'react-icons/hi';

export const EmployerDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);
  const [skillFilter, setSkillFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // New Job Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Bengaluru / Hybrid');
  const [newSalary, setNewSalary] = useState('₹10,00,000 - ₹16,00,000 / year');
  const [newDesc, setNewDesc] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [skillFilter]);

  const fetchData = async () => {
    try {
      const [candRes, pipeRes] = await Promise.all([
        api.get(`/employer/candidates?skill=${skillFilter}`),
        api.get('/tracking/pipeline'),
      ]);
      if (candRes.data.success) setCandidates(candRes.data.candidates);
      if (pipeRes.data.success) setPipeline(pipeRes.data.data);
    } catch (err) {
      console.error('Failed to load recruiter data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setPosting(true);
    try {
      const res = await api.post('/jobs', {
        title: newTitle,
        company: 'TechCorp India',
        location: newLocation,
        salaryRange: newSalary,
        description: newDesc || 'Exciting opportunity for high-caliber engineers.',
      });
      if (res.data.success) {
        toast.success('Job vacancy posted successfully!');
        setShowJobModal(false);
        setNewTitle('');
        setNewDesc('');
      }
    } catch (err) {
      toast.error('Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      const res = await api.post('/tracking/status-update', {
        applicationId: appId,
        status,
        notes: `Recruiter marked candidate as ${status}`,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Employer & Recruiter Intelligence Hub</h1>
            <p className="text-xs text-slate-500">TechCorp India • Talent Acquisition & Verification Portal</p>
          </div>

          <button
            onClick={() => setShowJobModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-2 self-start"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Create New Job Post</span>
          </button>
        </div>

        {/* DPDP Consent Gated Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <HiOutlineShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">DPDP Data Protection Compliance:</span> In compliance with government data protection standards, only candidate profiles with actively granted employer visibility consent are displayed below.
          </div>
        </div>

        {/* Applicant Pipeline Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineBriefcase className="w-4 h-4 text-brand-600" />
            <span>Active Applicant Pipeline ({pipeline?.applications?.length || 0})</span>
          </h2>

          <div className="divide-y divide-slate-100">
            {pipeline?.applications?.map((app: any) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{app.candidateName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                      Match: {app.matchScore}%
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{app.jobTitle} • {app.candidateEmail}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'INTERVIEW_SCHEDULED')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    Mark as Hired
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consent Gated Candidate Search */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <HiOutlineUsers className="w-4 h-4 text-emerald-600" />
              <span>Consent-Gated Talent Search ({candidates.length})</span>
            </h2>

            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g. React, Python, Docker)"
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{cand.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                    <HiCheck className="w-3 h-3" />
                    Consent Verified
                  </span>
                </div>
                <p className="text-xs font-semibold text-brand-600">{cand.headline}</p>
                <p className="text-xs text-slate-500">{cand.location} • {cand.yearsOfExperience} yrs exp</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {cand.skills?.map((s: any) => (
                    <span
                      key={s.name}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {s.name} (Lvl {s.proficiency})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Job Modal */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Post New Verified Job Vacancy</h3>
                <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handlePostJob} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe role responsibilities..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={posting}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm disabled:opacity-50"
                  >
                    {posting ? 'Publishing...' : 'Publish Vacancy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
