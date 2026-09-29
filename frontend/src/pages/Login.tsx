import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiLockClosed,
  HiMail,
  HiArrowRight,
  HiEye,
  HiEyeOff,
  HiCheckCircle,
} from 'react-icons/hi';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-stretch font-sans">

      {/* ── Left brand panel (desktop only) ─────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-10 text-white">
        <div>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-extrabold text-2xl shadow-lg group-hover:scale-105 transition-transform">
              ST
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight leading-tight">SkillTrack AI</p>
              <p className="text-[11px] text-white/70">SIH 2026 • PS-26135</p>
            </div>
          </Link>

          <div className="mt-12">
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
              Welcome back to<br />India's Skill &<br />Employment Hub
            </h2>
            <p className="text-sm text-white/75 leading-relaxed mt-4">
              Sign in to access your personalised skill gap analysis, job matches, and verified placement tracking.
            </p>
          </div>

          <ul className="mt-10 space-y-4">
            {[
              'AI-powered skill gap diagnostics',
              'Real-time job & course matching',
              'Verified employment outcome tracking',
              'Consent-first data privacy (DPDP)',
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                <HiCheckCircle className="w-4 h-4 text-white/60 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-white/50">
          Smart India Hackathon 2026 • Team Code Warriors
        </p>
      </aside>

      {/* ── Right form panel ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-10 overflow-y-auto">

        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8 self-start">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
            ST
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 tracking-tight leading-tight">SkillTrack AI</p>
            <p className="text-[10px] text-slate-500">SIH 2026 • PS-26135</p>
          </div>
        </div>

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-sm text-slate-500 mt-1">
              New to the platform?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Create an account
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <HiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <HiLockClosed className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 shadow-lg shadow-brand-600/25 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>
                  Sign In to Workspace
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider + register */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <Link
            to="/register"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-sm font-semibold text-slate-700 hover:text-brand-700 transition-all"
          >
            Create a new account
            <HiArrowRight className="w-4 h-4" />
          </Link>

          <p className="mt-8 text-center text-[11px] text-slate-400">
            Smart India Hackathon 2026 • PS-26135 • Team Code Warriors
          </p>
        </div>
      </main>
    </div>
  );
};
