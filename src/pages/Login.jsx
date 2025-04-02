import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../features/auth/authSlice';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for demo credentials
    if (email === 'admin@example.com' && password === 'password123') {
      console.log('Using demo credentials');
      
      // Create a mock user
      const mockUser = {
        _id: 'demo_user_' + Date.now(),
        name: 'Demo Admin',
        email: 'admin@example.com',
        role: 'admin',
        demoUser: true,
        token: 'demo_token_' + Date.now()
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockUser.token);
      
      // Initialize demo data
      initializeDemoData();
      
      // Navigate to dashboard
      navigate('/dashboard');
      return;
    }

    // Regular login for non-demo credentials
    try {
      dispatch(login({ email, password }));
    } catch (error) {
      console.error('Login failed, suggest using demo account:', error);
      // Show error message suggesting to use demo account if real login fails
      dispatch({ 
        type: 'auth/loginFailed', 
        payload: 'Login failed. Please check your credentials or try the demo account.'
      });
    }
  };

  // Simple Google login simulation that works reliably
  const handleGoogleLogin = () => {
    console.log('Simulating Google login for demo mode');
    
    // Create a mock Google user
    const mockGoogleUser = {
      _id: 'google_user_' + Date.now(),
      name: 'Demo Google User',
      email: 'google.user.' + Date.now() + '@example.com',
      isGoogleUser: true,
      provider: 'google',
      demoUser: true,
      token: 'mock_google_token_' + Date.now()
    };
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(mockGoogleUser));
    localStorage.setItem('token', mockGoogleUser.token);
    
    // Initialize demo data
    initializeDemoData();
    
    // Navigate to dashboard
        navigate('/dashboard');
  };

  // Initialize demo data in localStorage
  const initializeDemoData = () => {
    if (!localStorage.getItem('demoDataInitialized')) {
      console.log('Initializing demo data in localStorage...');
      const demoJobs = [
        { _id: 'demo_job_1', title: 'Frontend Developer', status: 'open', applications: 5, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { _id: 'demo_job_2', title: 'Backend Developer', status: 'open', applications: 3, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { _id: 'demo_job_3', title: 'UI/UX Designer', status: 'closed', applications: 8, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      const demoApplicants = [
        { _id: 'demo_applicant_1', name: 'John Doe', jobId: 'demo_job_1', status: 'applied', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { _id: 'demo_applicant_2', name: 'Jane Smith', jobId: 'demo_job_2', status: 'interview', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      const demoInterviews = [
        { _id: 'demo_interview_1', applicantId: 'demo_applicant_1', jobId: 'demo_job_1', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:00 AM', status: 'scheduled', interviewers: ['Demo Interviewer 1'] },
        { _id: 'demo_interview_2', applicantId: 'demo_applicant_2', jobId: 'demo_job_2', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '2:00 PM', status: 'pending', interviewers: ['Demo Interviewer 2'] }
      ];
      localStorage.setItem('demoJobs', JSON.stringify(demoJobs));
      localStorage.setItem('demoApplicants', JSON.stringify(demoApplicants));
      localStorage.setItem('demoInterviews', JSON.stringify(demoInterviews));
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
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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
              {/* Custom Google button that works reliably */}
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Sign in with Google
              </button>
          </div>
          
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Demo credentials: <span className="font-medium">admin@example.com / password123</span>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 