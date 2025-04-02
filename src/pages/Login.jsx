import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, googleLogin, clearError } from '../features/auth/authSlice';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { GoogleLogin } from '@react-oauth/google';

// Get the Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

console.log('Google OAuth Configuration:', { 
  clientId: GOOGLE_CLIENT_ID, 
  mockDataEnabled: USE_MOCK_DATA 
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, status, error } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    console.log('Using demo login');
    
    // Create a mock user for demo purposes
    const mockUser = {
      _id: 'demo_user_123456789',
      name: 'Demo User',
      email: 'demo.user@example.com',
      demoUser: true,
      provider: 'local'
    };
    
    // Store in localStorage and update auth state
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock_demo_token_123456789');
    
    // Initialize demo data in localStorage
    initializeDemoData();
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google login successful:', credentialResponse);
    
    // Create a mock user for Google sign-in
    const mockGoogleUser = {
      _id: 'google_user_' + Date.now(),
      name: 'Google User',
      email: 'google.user@example.com',
      isGoogleUser: true,
      provider: 'google',
      demoUser: true
    };
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(mockGoogleUser));
    localStorage.setItem('token', 'mock_google_token_' + Date.now());
    
    // Initialize demo data in localStorage
    initializeDemoData();
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  const handleGoogleError = (errorResponse) => {
    console.error('Google login error:', errorResponse);
    alert('Google login failed. Please try the Demo User option instead.');
  };

  // Initialize demo data in localStorage
  const initializeDemoData = () => {
    // Check if demo data already exists
    if (!localStorage.getItem('demoDataInitialized')) {
      // Initialize jobs
      const demoJobs = [
        {
          _id: 'demo_job_1',
          title: 'Frontend Developer',
          description: 'We are looking for a skilled Frontend Developer...',
          location: 'Remote',
          status: 'open',
          department: 'Engineering',
          skills: ['React', 'JavaScript', 'CSS'],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          applications: 5
        },
        {
          _id: 'demo_job_2',
          title: 'Backend Developer',
          description: 'Experienced Backend Developer needed...',
          location: 'Hybrid',
          status: 'open',
          department: 'Engineering',
          skills: ['Node.js', 'Express', 'MongoDB'],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          applications: 3
        },
        {
          _id: 'demo_job_3',
          title: 'UI/UX Designer',
          description: 'Creative UI/UX Designer to join our team...',
          location: 'Onsite',
          status: 'closed',
          department: 'Design',
          skills: ['Figma', 'Adobe XD', 'UI Design'],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          applications: 8
        }
      ];
      localStorage.setItem('demoJobs', JSON.stringify(demoJobs));
      
      // Initialize applicants
      const demoApplicants = [
        {
          _id: 'demo_applicant_1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          jobId: 'demo_job_1',
          status: 'applied',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'demo_applicant_2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '987-654-3210',
          jobId: 'demo_job_2',
          status: 'interview',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('demoApplicants', JSON.stringify(demoApplicants));
      
      // Initialize interviews
      const demoInterviews = [
        {
          _id: 'demo_interview_1',
          applicantId: 'demo_applicant_1',
          jobId: 'demo_job_1',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00 AM',
          duration: 60,
          status: 'scheduled',
          interviewers: ['Demo Interviewer 1']
        },
        {
          _id: 'demo_interview_2',
          applicantId: 'demo_applicant_2',
          jobId: 'demo_job_2',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '2:00 PM',
          duration: 45,
          status: 'pending',
          interviewers: ['Demo Interviewer 2', 'Demo Interviewer 3']
        }
      ];
      localStorage.setItem('demoInterviews', JSON.stringify(demoInterviews));
      
      // Mark as initialized
      localStorage.setItem('demoDataInitialized', 'true');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {status === 'loading' ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              Sign in
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-sm">
              <span className="text-gray-500">Or continue with</span>
            </div>
            
            <div className="flex space-x-4">
              <div id="googleLoginButton">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Try Demo Account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 