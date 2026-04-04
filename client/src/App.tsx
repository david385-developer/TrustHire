// React import not needed with modern JSX
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateApplications from './pages/candidate/ApplicationsPage';
import CandidateProfile from './pages/candidate/ProfilePage';
import CandidateSavedJobs from './pages/candidate/SavedJobsPage';
import CandidateSettings from './pages/candidate/SettingsPage';

import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterAllApplications from './pages/recruiter/AllApplicationsPage';
import RecruiterCandidates from './pages/recruiter/CandidatesPage';
import RecruiterCompany from './pages/recruiter/CompanyPage';
import RecruiterAnalytics from './pages/recruiter/AnalyticsPage';
import RecruiterSettings from './pages/recruiter/SettingsPage';

import CandidateLayout from './layouts/CandidateLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

import ApplicationDetail from './pages/candidate/ApplicationDetail';
import PostJob from './pages/PostJob';
import EditJob from './pages/EditJob';
import RecruiterApplications from './pages/RecruiterApplications';
import StaticPage from './pages/StaticPage';

import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NEW_NOTIFICATION') {
          const { title, body } = event.data.data;
          toast(() => (
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-[var(--primary)] bg-opacity-10 rounded-full">
                <Bell className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{body}</p>
              </div>
            </div>
          ), {
            duration: 5000,
            id: 'push-notification' // Prevent duplicate toasts for same event
          });
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            {/* Public Routes with Navbar and Footer */}
            <Route element={<><Navbar /><main className="flex-1 pt-16"><Outlet /></main><Footer /></>}>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/:slug" element={<StaticPage />} />
            </Route>

            {/* Auth Routes (Full Screen Split Layouts) */}
            <Route element={<main className="min-h-screen w-full"><Outlet /></main>}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Candidate Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CandidateDashboard />} />
              <Route path="applications" element={<CandidateApplications />} />
              <Route path="saved-jobs" element={<CandidateSavedJobs />} />
              <Route path="profile" element={<CandidateProfile />} />
              <Route path="settings" element={<CandidateSettings />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Recruiter Dashboard Routes */}
            <Route
              path="/recruiter"
              element={
                <ProtectedRoute requiredRole="recruiter">
                  <RecruiterLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="applications" element={<RecruiterAllApplications />} />
              <Route path="candidates" element={<RecruiterCandidates />} />
              <Route path="company" element={<RecruiterCompany />} />
              <Route path="analytics" element={<RecruiterAnalytics />} />
              <Route path="settings" element={<RecruiterSettings />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="edit-job/:id" element={<EditJob />} />
              <Route path="jobs/:id/applications" element={<RecruiterApplications />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                padding: '16px',
                borderRadius: '8px'
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: 'white'
                }
              },
              error: {
                iconTheme: {
                  primary: 'var(--danger)',
                  secondary: 'white'
                }
              }
            }}
          />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

// Helper to use Outlet in the public layout
import { Outlet as RouterOutlet } from 'react-router-dom';
const Outlet = () => <RouterOutlet />;

export default App;
