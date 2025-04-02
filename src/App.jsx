import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import JobPostings from './pages/JobPostings'
import JobDetails from './pages/JobDetails'
import Applicants from './pages/Applicants'
import ApplicantDetails from './pages/ApplicantDetails'
import AddApplicant from './pages/AddApplicant'
import Interviews from './pages/Interviews'
import InterviewDetails from './pages/InterviewDetails'
import InterviewScheduler from './pages/InterviewScheduler'
import InterviewerManagement from './pages/InterviewerManagement'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import BackendStatus from './components/BackendStatus'
import ProfileEdit from './pages/ProfileEdit'
import CandidateComparison from './pages/CandidateComparison'
import InterviewQuestionBank from './pages/InterviewQuestionBank'
import { useEffect } from 'react'
import { setUser, selectAuthStatus } from './redux/slices/authSlice'
import { toast } from 'react-toastify'
import axios from 'axios'
import { checkApiHealth } from './health-check'
import NotFound from './pages/NotFound'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch()
  const authStatus = useSelector(selectAuthStatus)
  
  // Check if backend is available on app startup
  useEffect(() => {
    const checkBackendAvailability = async () => {
      try {
        // Check for demo mode first
        const isDemoMode = 
          localStorage.getItem('demo_mode') === 'true' || 
          (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))?.demoUser) ||
          (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))?.isGoogleUser) ||
          (localStorage.getItem('token') && localStorage.getItem('token').includes('demo'));
        
        // If in demo mode, skip the health check
        if (isDemoMode) {
          console.log('Demo mode detected, skipping backend health check');
          localStorage.setItem('backend_error_shown', 'true');
          return;
        }
        
        // Check if we've already shown the error toast in this session
        const errorShown = localStorage.getItem('backend_error_shown') === 'true';
        if (errorShown) {
          console.log('Backend error message already shown, skipping check');
          return;
        }
        
        // Use our health check utility to check API availability
        const healthResult = await checkApiHealth();
        
        if (healthResult.status === 'unhealthy') {
          console.error('Backend server check failed:', healthResult.message);
          
          // Show a toast with the error message
          toast.error(
            'Cannot connect to backend server. Application is running in demo mode.',
            { autoClose: 5000 }
          );
          
          // Set flag in localStorage to prevent showing multiple toasts
          localStorage.setItem('backend_error_shown', 'true');
        } else {
          // Clear the flag if the backend is available
          localStorage.removeItem('backend_error_shown');
        }
      } catch (error) {
        console.error('Backend availability check error:', error);
      }
    };
    
    checkBackendAvailability();
  }, []);
  
  // Load user from localStorage on app startup
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch(setUser(parsedUser));
        console.log('User loaded from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
  }, [dispatch]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <BackendStatus />
      <Routes>
        {/* Redirect root to dashboard */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        
        {/* All routes under MainLayout - protected */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobPostings />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/applicants/:applicantId" element={<ApplicantDetails />} />
          <Route path="/add-applicant" element={<AddApplicant />} />
          <Route path="/compare-candidates" element={<CandidateComparison />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/interviews/:interviewId" element={<InterviewDetails />} />
          <Route path="/interviewers" element={<InterviewerManagement />} />
          <Route path="/question-bank" element={<InterviewQuestionBank />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
        </Route>

        {/* Catch all route - redirect to 404 page */}
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </>
  )
}

export default App 