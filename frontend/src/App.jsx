import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './layouts/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobSearchPage from './pages/JobSearchPage';
import JobDetailsPage from './pages/JobDetailsPage';
import AiRecommendationsPage from './pages/AiRecommendationsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Standalone Authentication Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Application Shell Pages */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="jobs" element={<JobSearchPage />} />
              <Route path="jobs/:id" element={<JobDetailsPage />} />
              <Route path="ai-recommendations" element={<AiRecommendationsPage />} />
              <Route path="saved-jobs" element={<SavedJobsPage />} />
              <Route path="applications" element={<ApplicationTrackerPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminDashboardPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
