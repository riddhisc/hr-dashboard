import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { initializeGoogleUserData } from '../../utils/initializeGoogleUserData';

// Initial state with user loaded from storage (if any)
const loadUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
  }
  return null;
};

// Initial state with demo user for quick testing
const initialState = {
  user: loadUserFromStorage() || null,
  isAuthenticated: !!loadUserFromStorage(),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = 'succeeded';
    },
    loginStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = 'succeeded';
      state.error = null;
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(action.payload));
      
      // If this is a Google user, initialize their data
      if (action.payload && action.payload.isGoogleUser) {
        console.log('Google user logged in, initializing data');
        
        // Initialize Google user data in localStorage
        initializeGoogleUserData();
        
        // Make sure we re-create the sample interviews with correct names
        // Retrieve the samples and save them back to localStorage to ensure consistency
        try {
          const googleInterviewsJSON = localStorage.getItem('google_user_interviews');
          if (googleInterviewsJSON) {
            const googleInterviews = JSON.parse(googleInterviewsJSON);
            
            // Make sure each interview has correct data
            for (const interview of googleInterviews) {
              if (!interview.applicantName || interview.applicantName === 'Unknown Applicant') {
                if (interview.applicantId === 'google_applicant_1') {
                  interview.applicantName = 'John Smith';
                  interview.jobTitle = 'Frontend Developer';
                } else if (interview.applicantId === 'google_applicant_2') {
                  interview.applicantName = 'Sarah Johnson';
                  interview.jobTitle = 'Senior Frontend Developer';
                }
              }
              
              // Ensure all IDs are in the right format
              if (interview.applicantId && !interview.applicantId.startsWith('google_')) {
                interview.applicantId = `google_applicant_${Date.now()}`;
              }
              
              if (interview.jobId && !interview.jobId.startsWith('google_')) {
                interview.jobId = `google_job_${Date.now()}`;
              }
              
              // Ensure feedback is an object, not a string
              if (interview.feedback === '' || interview.feedback === null) {
                interview.feedback = {};
              }
            }
            
            // Save back to localStorage
            localStorage.setItem('google_user_interviews', JSON.stringify(googleInterviews));
          }
        } catch (err) {
          console.error('Error updating localStorage samples:', err);
        }
      }
    },
    loginFailed: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      
      // Remove user from localStorage
      localStorage.removeItem('user');
      
      toast.success('Logged out successfully');
    }
  }
});

// Action creators
export const {
  setUser,
  loginStart,
  loginSuccess,
  loginFailed,
  logout
} = authSlice.actions;

// Login thunk (not an actual API call in demo mode)
export const login = (credentials) => (dispatch) => {
  try {
    dispatch(loginStart());
    
    // Demo credentials check
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      const user = {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin'
      };
      
      dispatch(loginSuccess(user));
      toast.success('Logged in successfully');
      return true;
    } else if (credentials.email.includes('google') || credentials.isGoogleUser) {
      // For Google users
      const user = {
        id: credentials.id || 'google-user',
        name: credentials.name || 'Google User',
        email: credentials.email || 'google@example.com',
        role: 'admin',
        isGoogleUser: true
      };
      
      dispatch(loginSuccess(user));
      toast.success('Logged in with Google successfully');
      return true;
    } else {
      dispatch(loginFailed('Invalid credentials'));
      toast.error('Invalid credentials');
      return false;
    }
  } catch (error) {
    dispatch(loginFailed(error.message || 'Login failed'));
    toast.error(error.message || 'Login failed');
    return false;
  }
};

// Load user from localStorage
export const loadUser = () => (dispatch) => {
  const user = localStorage.getItem('user');
  
  if (user) {
    dispatch(setUser(JSON.parse(user)));
    return true;
  }
  
  return false;
};

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer; 