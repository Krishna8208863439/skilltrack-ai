import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  HiOutlineSparkles,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineChartPie,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiArrowRight,
} from 'react-icons/hi';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, jobsRes, pipeRes] = await Promise.all([
          api.get('/candidate/profile'),
          api.get('/jobs'),
          api.get('/tracking/pipeline'),
        ]);
        if (profRes.data.success) setProfile(profRes.data.profile);
        if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
        if (pipeRes.data.success) setPipeline(pipeRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topJob = jobs.length > 0 ? jobs[0] : null;
  const compatibilityScore = topJob?.matchScore || (profile?.skills?.length ? 75 : 0);
  const totalSkills = profile?.skills?.length || 0;
  const verifiedSkills = profile?.skills?.filter((s: any) => s.isVerified).length || 0;
  const pendingSkills = Math.max(0, totalSkills - verifiedSkills);
  const activeApplications = pipeline?.applications?.length || 0;
  const scheduledInterviews = pipeline?.interviews?.length || 0;

  const targetRequiredSkills = topJob?.requiredSkills?.slice(0, 4) || [
    { name: 'React.js', minProficiency: 3 },
    { name: 'Node.js', minProficiency: 3 },
    { name: 'Docker', minProficiency: 2 },
    { name: 'PostgreSQL', minProficiency: 3 },
  ];

  const quickSkillsList = targetRequiredSkills.map((req: any) => {
    const candSkill = profile?.skills?.find(
      (s: any) => s.name.toLowerCase() === req.name.toLowerCase()
    );
    const candProf = candSkill ? candSkill.proficiency : 0;
    const reqProf = req.minProficiency || 3;
    const isMet = candProf >= reqProf;
    return {
      name: req.name,
      candProf,
      reqProf,
      isMet,
      percent: Math.min(100, Math.round((candProf / reqProf) * 100)),
    };
  });

  const missingFromTarget = quickSkillsList.filter((s: any) => !s.isMet);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-50/90 via-white to-slate-50 rounded-2xl p-6 lg:p-8 text-slate-900 border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
                <HiOutlineSparkles className="w-3.5 h-3.5" />
                <span>Target Role: {profile?.targetJobRole || topJob?.title || 'Full Stack Engineer'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {user?.name || 'Candidate'}!
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                {scheduledInterviews > 0
                  ? `Your profile is active with ${scheduledInterviews} interview(s) scheduled. Review requirements below.`
                  : 'Your profile is active. Browse verified opportunities and bridge detected skill gaps.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/skill-gap"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
              >
                <HiOutlineChartPie className="w-4 h-4" />
                <span>Run Skill Gap</span>
              </Link>
              <Link
                to="/resume"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Upload Resume</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Compatibility</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <HiOutlineChartPie className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-navy-900 mt-2">{compatibilityScore}%</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
              <span>{compatibilityScore >= 70 ? 'Above benchmark (70%)' : 'Skill bridging recommended'}</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Skills</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HiOutlineAcademicCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-navy-900 mt-2">
              {verifiedSkills} / {totalSkills}
            </p>
            <p className="text-xs text-slate-500 mt-1">{pendingSkills} skill(s) awaiting institute verification</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Applications</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HiOutlineBriefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-navy-900 mt-2">
              {activeApplications}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {activeApplications > 0 ? `${activeApplications} active in pipeline` : 'Explore recommendations below'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews Scheduled</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HiOutlineCalendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-navy-900 mt-2">
              {scheduledInterviews}
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-1">
              {scheduledInterviews > 0 ? 'Technical rounds pending' : 'No upcoming interviews'}
            </p>
          </div>
        </div>

        {/* Two Columns: Skill Gap Quick View & Recommended Jobs */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
          {/* Quick Skill Gap Card */}
          <div className="xl:col-span-5 bg-white p-6 lg:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Skill Gap Diagnosis</h3>
                  <p className="text-xs text-slate-500">Target Role: {profile?.targetJobRole || topJob?.title || 'Full Stack Engineer'}</p>
                </div>
                <Link to="/skill-gap" className="text-xs text-brand-600 font-bold hover:underline">
                  View Radar &rarr;
                </Link>
              </div>

              <div className="space-y-3.5">
                {quickSkillsList.map((sk: any) => (
                  <div key={sk.name}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800">{sk.name} (Proficiency {sk.candProf}/{sk.reqProf})</span>
                      <span className={sk.isMet ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                        {sk.isMet ? "Requirement Met" : (sk.candProf === 0 ? "Gap: Missing" : "Gap: Below Target")}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${sk.isMet ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.max(5, sk.percent)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-800">Bridge Recommendation: </span>
                {missingFromTarget.length > 0 ? (
                  <span>
                    Enroll in accredited courses for <span className="font-bold">{missingFromTarget.map((m: any) => m.name).join(', ')}</span> to raise your compatibility score.
                  </span>
                ) : (
                  <span>You meet all primary requirements for this target role! Explore senior-level certification courses.</span>
                )}
              </div>
            </div>

            <Link
              to="/courses"
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center block transition-colors"
            >
              Browse Recommended Courses
            </Link>
          </div>

          {/* Top Job Matches */}
          <div className="xl:col-span-7 bg-white p-6 lg:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Top Recommended Jobs</h3>
                <p className="text-xs text-slate-500">Ranked by Explainable Skill & Experience Match</p>
              </div>
              <Link to="/jobs" className="text-xs text-brand-600 font-bold hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-3.5">
              {jobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{job.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {job.workMode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{job.company} • {job.location}</p>
                    <p className="text-xs text-brand-700 font-semibold">{job.salaryRange}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requiredSkills?.map((s: any) => (
                        <span key={s.name} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Match Score</span>
                      <div className="text-lg font-extrabold text-brand-600">{job.matchScore || 85}%</div>
                    </div>
                    <Link
                      to={`/jobs`}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
