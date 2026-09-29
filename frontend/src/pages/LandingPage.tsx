import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiCheck,
  HiArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section — Clean White Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-white text-slate-900 py-16 sm:py-20 lg:py-24 px-6 border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-brand-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <HiOutlineSparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Smart India Hackathon 2026 • Problem Statement ID: 26135</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
            AI-Powered Skill Gap & <br />
            <span className="bg-gradient-to-r from-brand-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Employment Intelligence Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Bridging education, skills, industry training, and verified employment outcomes for candidates, academic institutes, employers, and government administrators.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/25 transition-all flex items-center gap-2 text-sm"
            >
              <span>Explore Live Platform</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all text-sm"
            >
              Create Account
            </Link>
          </div>

          {/* Quick Metrics Strip — Clean White Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100 hover:shadow-lg transition-all">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assessed Candidates
              </span>
              <p className="text-3xl font-extrabold text-brand-600">1,240+</p>
              <p className="text-xs text-slate-500 mt-0.5">Verified across 48 colleges</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100 hover:shadow-lg transition-all">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Placement Conversion
              </span>
              <p className="text-3xl font-extrabold text-emerald-600">78.4%</p>
              <p className="text-xs text-slate-500 mt-0.5">Placed ÷ Completed Cohorts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100 hover:shadow-lg transition-all">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Verified Job Roles
              </span>
              <p className="text-3xl font-extrabold text-amber-600">320+</p>
              <p className="text-xs text-slate-500 mt-0.5">Across tech & core domains</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-100 hover:shadow-lg transition-all">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Outcome Authenticity
              </span>
              <p className="text-3xl font-extrabold text-indigo-600">100%</p>
              <p className="text-xs text-slate-500 mt-0.5">Verifiable offer letter audit</p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer — Clean White Background */}
      <footer className="mt-auto bg-white text-slate-500 py-8 px-6 text-center text-xs border-t border-slate-200">
        <p className="font-bold text-slate-700">SkillTrack AI — Smart India Hackathon 2026 (Problem Statement ID: 26135)</p>
        <p className="text-slate-400 mt-1">Theme: Skill Development / Employment • Developed by Team Code Warriors</p>
      </footer>
    </div>
  );
};
