import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import {
  HiUser,
  HiMail,
  HiLockClosed,
  HiPhone,
  HiArrowRight,
  HiAcademicCap,
  HiBriefcase,
  HiShieldCheck,
  HiEye,
  HiEyeOff,
  HiCheckCircle,
} from 'react-icons/hi';

const roles: { value: UserRole; label: string; sub: string; icon: React.ReactNode; color: string; active: string }[] = [
  {
    value: 'CANDIDATE',
    label: 'Candidate',
    sub: 'Student / Job Seeker',
    icon: <HiUser className="w-5 h-5" />,
    color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
    active: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200',
  },
  {
    value: 'INSTITUTE',
    label: 'Institute',
    sub: 'College / Training Center',
    icon: <HiAcademicCap className="w-5 h-5" />,
    color: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
    active: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200',
  },
  {
    value: 'EMPLOYER',
    label: 'Employer',
    sub: 'Recruiter / Company',
    icon: <HiBriefcase className="w-5 h-5" />,
    color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    active: 'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    sub: 'Gov / Platform Admin',
    icon: <HiShieldCheck className="w-5 h-5" />,
    color: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50',
    active: 'border-rose-500 bg-rose-50 ring-2 ring-rose-200',
  },
];

const iconColors: Record<UserRole, string> = {
  CANDIDATE: 'text-emerald-600',
  INSTITUTE: 'text-indigo-600',
  EMPLOYER: 'text-amber-600',
  ADMIN: 'text-rose-600',
};

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<UserRole>('CANDIDATE');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setPasswordError('');
    if (!consentAgreed) return;
    setLoading(true);
    const success = await register(name, email, password, role);
    setLoading(false);
    if (success) {
      if (role === 'INSTITUTE') navigate('/institute');
      else if (role === 'EMPLOYER') navigate('/employer');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/dashboard');
    }
  };

  const selectedRole = roles.find(r => r.value === role)!;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-stretch font-sans">

      {/* ── Left brand panel (hidden on mobile) ─────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-10 text-white">
        {/* Logo */}
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

          <div className="mt-12 space-y-2">
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
              Join the National<br />Skill Intelligence<br />Platform
            </h2>
            <p className="text-sm text-white/75 leading-relaxed mt-4">
              AI-powered skill gap analysis, job matching, and verified employment tracking — built for India's workforce ecosystem.
            </p>
          </div>

          {/* Feature bullets */}
          <ul className="mt-10 space-y-4">
            {[
              'AI resume parsing & skill extraction',
              'Verified employment outcome tracking',
              'Real-time job & course matching',
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

      {/* ── Right form panel ────────────────────────────────────────────────── */}
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
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-sm text-slate-500 mt-1">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                I am joining as
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                      role === r.value ? r.active : `bg-white ${r.color}`
                    }`}
                  >
                    <span className={`shrink-0 ${role === r.value ? iconColors[r.value] : 'text-slate-400'}`}>
                      {r.icon}
                    </span>
                    <div>
                      <p className={`text-xs font-bold leading-tight ${role === r.value ? 'text-slate-900' : 'text-slate-700'}`}>
                        {r.label}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name / Organisation
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <HiUser className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={role === 'INSTITUTE' ? 'e.g. IIT Delhi Skill Centre' : 'e.g. Priya Sharma'}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <HiPhone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiLockClosed className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiLockClosed className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      passwordError
                        ? 'border-rose-400 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <p className="text-xs text-rose-600 font-medium -mt-2">{passwordError}</p>
            )}

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={e => setConsentAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${
                  consentAgreed ? 'bg-brand-600 border-brand-600' : 'bg-white border-slate-300 group-hover:border-brand-400'
                }`}>
                  {consentAgreed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[12px] text-slate-600 leading-relaxed">
                I agree to the{' '}
                <span className="text-brand-600 font-semibold">DPDP Consent Policy</span>.
                Only accredited institutes and verified recruiters may access my data.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !consentAgreed}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/25 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create {selectedRole.label} Account
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Smart India Hackathon 2026 • PS-26135 • Team Code Warriors
          </p>
        </div>
      </main>
    </div>
  );
};
