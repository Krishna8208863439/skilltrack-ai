import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';

import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { CandidateProfile } from './pages/CandidateProfile';
import { ResumeUpload } from './pages/ResumeUpload';
import { SkillGapAnalysis } from './pages/SkillGapAnalysis';
import { JobRecommendations } from './pages/JobRecommendations';
import { CourseRecommendations } from './pages/CourseRecommendations';
import { EmploymentTracking } from './pages/EmploymentTracking';
import { InstituteDashboard } from './pages/InstituteDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotificationsPage } from './pages/NotificationsPage';

const ADMIN_EMAIL = 'krishna@gmail.com';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center">
        <div className="text-sm font-semibold animate-pulse text-brand-600">Initializing SkillTrack AI...</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Only krishna@gmail.com may access ADMIN-gated routes
  if (allowedRoles?.includes('ADMIN') && user.role === 'ADMIN') {
    if (user.email.toLowerCase() !== ADMIN_EMAIL) {
      return <Navigate to="/login" replace />;
    }
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRoutes: Record<UserRole, string> = {
      CANDIDATE: '/dashboard',
      INSTITUTE: '/institute',
      EMPLOYER: '/employer',
      ADMIN: '/admin',
    };
    return <Navigate to={roleRoutes[user.role] || '/dashboard'} replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '12px',
              borderRadius: '12px',
              border: '1px solid #334155',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Candidate Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <ResumeUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-gap"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <SkillGapAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <JobRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <CourseRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <EmploymentTracking />
              </ProtectedRoute>
            }
          />

          {/* Role Hubs */}
          <Route
            path="/institute"
            element={
              <ProtectedRoute allowedRoles={['INSTITUTE', 'ADMIN']}>
                <InstituteDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Notifications — available to all authenticated roles */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
