import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiCheck,
} from 'react-icons/hi';

export const CandidateProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [targetJobRole, setTargetJobRole] = useState('');
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState(3);
  const [consent, setConsent] = useState({
    shareProfileWithEmployers: true,
    shareResumeWithEmployers: true,
    shareAcademicRecords: true,
    allowPlacementTracking: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/candidate/profile');
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setProfile(p);
          setHeadline(p.headline || '');
          setBio(p.bio || '');
          setTargetJobRole(p.targetJobRole || 'Full Stack Engineer');
          setSkills(p.skills || []);
          if (p.consent) setConsent(p.consent);
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) {
      toast.error('Skill already in list');
      return;
    }
    const updated = [
      ...skills,
      {
        id: 'cs-' + Date.now(),
        name: newSkillName.trim(),
        proficiency: Number(newSkillProf),
        category: 'TECHNICAL',
        source: 'SELF_REPORTED',
        isVerified: false,
      }
    ];
    setSkills(updated);
    setNewSkillName('');
    toast.success(`Added ${newSkillName.trim()}`);
  };

  const handleRemoveSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/candidate/profile', {
        headline,
        bio,
        targetJobRole,
        skills,
        consent,
      });
      if (res.data.success) {
        toast.success('Profile and skills saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const proficiencyLabels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Candidate Profile & Skills</h1>
            <p className="text-xs text-slate-500">Manage your verified credentials, proficiency depths, and privacy consent.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2 self-start"
          >
            <HiCheck className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

        {/* Section 1: Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineUser className="w-4 h-4 text-brand-600" />
            <span>Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full Stack Developer | React & Node"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Desired Job Role</label>
              <select
                value={targetJobRole}
                onChange={(e) => setTargetJobRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Backend API Developer">Backend API Developer</option>
                <option value="Cloud DevOps Associate">Cloud DevOps Associate</option>
                <option value="Data Engineer">Data Engineer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bio & Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your technical background and career goals..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Section 2: Skills with 1-5 Proficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <HiOutlineAcademicCap className="w-4 h-4 text-emerald-600" />
              <span>Skills & Proficiency (Level 1 to 5)</span>
            </h2>
            <span className="text-xs text-slate-500">{skills.length} skills listed</span>
          </div>

          {/* Add Skill Form */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill Name (e.g. Docker, Python, AWS)"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-600 font-medium">Proficiency:</span>
              <select
                value={newSkillProf}
                onChange={(e) => setNewSkillProf(Number(e.target.value))}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Elementary</option>
                <option value={3}>3 - Intermediate</option>
                <option value={4}>4 - Advanced</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1 shrink-0"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {skills.map((sk) => (
              <div
                key={sk.name}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{sk.name}</span>
                    {sk.isVerified ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                        <HiCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        Self Reported
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1.5 w-5 rounded-full ${
                          lvl <= sk.proficiency ? 'bg-brand-600' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-semibold text-slate-600 ml-1">
                      {proficiencyLabels[sk.proficiency]} ({sk.proficiency}/5)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(sk.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Consent & Privacy (DPDP) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineShieldCheck className="w-4 h-4 text-brand-600" />
            <span>DPDP Consent & Visibility Controls</span>
          </h2>
          <p className="text-xs text-slate-500">
            Control which organizations can view your candidate profile in matching queries.
          </p>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.shareProfileWithEmployers}
                onChange={(e) => setConsent({ ...consent, shareProfileWithEmployers: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Allow verified employers to discover my profile in talent skill searches.
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.shareResumeWithEmployers}
                onChange={(e) => setConsent({ ...consent, shareResumeWithEmployers: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Make parsed resume documents accessible to shortlisted recruiters.
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.allowPlacementTracking}
                onChange={(e) => setConsent({ ...consent, allowPlacementTracking: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Permit training institutes to record verified placement and employment outcomes.
              </span>
            </label>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
