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

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google login successful:', credentialResponse);
    
    if (USE_MOCK_DATA) {
      console.log('Using mock data for Google login');
      // Create a mock user for demo purposes
      const mockUser = {
        _id: 'google_123456789',
        name: 'Demo Google User',
        email: 'demo.google@example.com',
        isGoogleUser: true
      };
      
      // Store in localStorage and update auth state
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock_google_token_123456789');
      
      // Update Redux state
      dispatch(login(mockUser));
      
      // Redirect to dashboard
      navigate('/dashboard');
      return;
    }
    
    // Regular API call for non-demo mode
    dispatch(googleLogin(credentialResponse.credential));
  };

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, googleLogin, clearError } from '../features/auth/authSlice';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { GoogleLogin } from '@react-oauth/google';

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.group('Google Login Success');
      console.log('Full Google credential response:', JSON.stringify(credentialResponse, null, 2));
      
      // Detailed credential check
      if (!credentialResponse) {
        console.error('No credential response received');
        alert('Google login failed: No credential response');
        console.groupEnd();
        return;
      }

      const credential = credentialResponse.credential;
      
      if (!credential) {
        console.error('No credential found in the response');
        alert('Google login failed: No credential found');
        console.groupEnd();
        return;
      }

      console.log('Credential length:', credential.length);
      console.log('Credential first 20 chars:', credential.substring(0, 20));

      console.log('Attempting to dispatch googleLogin');
      const response = await dispatch(googleLogin(credential));
      
      console.log('Dispatch response:', JSON.stringify(response, null, 2));
      
      // More detailed error handling
      if (response.type === 'auth/googleLogin/rejected') {
        console.error('Google login rejected:', response.payload);
        alert(`Google login failed: ${response.payload || 'Unknown error'}`);
        console.groupEnd();
        return;
      }
      
      if (response.type === 'auth/googleLogin/fulfilled') {
        console.log('Google login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.error('Google login failed: Unexpected response type', response);
        alert(`Google login failed: Unexpected response`);
      }
      console.groupEnd();
    } catch (error) {
      console.group('Google Login Error');
      console.error('Comprehensive Google login error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response,
        payload: error.payload
      });
      alert(`Google login failed: ${error.message}`);
      console.groupEnd();
    }
  }

  const handleGoogleError = (errorResponse) => {
    console.group('Google Login Error Details');
    console.error('Detailed Google login error:', {
      error: errorResponse,
      type: typeof errorResponse,
      keys: Object.keys(errorResponse || {})
    });
    alert('Google login failed');
    console.groupEnd();
  }

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
          
          <div className="flex items-center justify-center">
            <div className="text-sm">
              <span className="text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              type="standard"
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              federated_credentials_supported={false}
            />
          </div>
          
          <div className="text-sm text-center">
            <p className="text-gray-600">
              Demo credentials: admin@example.com / password123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 