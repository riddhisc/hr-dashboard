import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Get user and token from localStorage
const storedToken = localStorage.getItem('token');
const user = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

// Clear storage if token is expired
if (isTokenExpired(storedToken)) {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

const initialState = {
  user: isTokenExpired(storedToken) ? null : user,
  isAuthenticated: !isTokenExpired(storedToken) && !!user,
  status: 'idle',
  error: null,
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', { email: userData.email });
      const response = await authAPI.login(userData);
      console.log('Login response:', response.data);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

// Google Login - Demo Mode Only (No Backend Call)
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      console.log('Creating demo Google user - no API call');
      
      // Create a mock Google user for demo mode
      const mockGoogleUser = {
        _id: 'google_user_' + Date.now(),
        name: 'Demo Google User',
        email: 'google.user.' + Date.now() + '@example.com',
        isGoogleUser: true,
        provider: 'google',
        demoUser: true,
        token: 'mock_google_token_' + Date.now()
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockGoogleUser));
      localStorage.setItem('token', mockGoogleUser.token);
      
      // Initialize demo data in localStorage
      initializeDemoData();
      
      // Return the mock user
      return mockGoogleUser;
    } catch (error) {
      console.error('Error creating demo Google user:', error);
      return rejectWithValue('Failed to create demo Google user.');
    }
  }
);

// Helper function to initialize demo data
function initializeDemoData() {
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
}

// Get user profile
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Check token before making request
      if (isTokenExpired(localStorage.getItem('token'))) {
        dispatch(logout());
        throw new Error('Session expired. Please log in again.');
      }
      const response = await authAPI.getUserProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user profile'
      );
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      // Check token before making request
      if (isTokenExpired(localStorage.getItem('token'))) {
        dispatch(logout());
        throw new Error('Session expired. Please log in again.');
      }
      const response = await authAPI.updateUserProfile(userData);
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      // Redirect to login page
      window.location.href = '/login';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        
        // Set isDemoUser flag for demo user
        if (action.payload.email && 
            (action.payload.email === 'demo@example.com' || 
             action.payload.email.includes('demo'))) {
          console.log('Setting demo user flag');
          state.user.isDemo = true;
          
          // Update localStorage to include the isDemo flag
          localStorage.setItem('user', JSON.stringify(state.user));
          
          // Initialize demo user interviews in localStorage if not exists or if empty
          const interviewsJSON = localStorage.getItem('google_user_interviews');
          const hasValidInterviews = interviewsJSON && interviewsJSON !== '[]';
          
          if (!hasValidInterviews) {
            console.log('Creating sample interviews for demo user');
            // Create some sample interviews for demo users
            const demoInterviews = [
              {
                _id: `local_${Date.now()}`,
                applicantName: 'Jane Doe',
                jobTitle: 'Frontend Developer',
                status: 'scheduled',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in future
                duration: 60,
                interviewers: ['John Smith'],
                location: 'Zoom',
                type: 'technical',
                notes: 'Discuss React experience and review portfolio projects.',
                feedback: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                _id: `local_${Date.now() + 1}`,
                applicantName: 'Alex Johnson',
                jobTitle: 'Backend Developer',
                status: 'completed',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in past
                duration: 45,
                interviewers: ['Sarah Williams', 'Michael Chen'],
                location: 'Google Meet',
                type: 'final',
                notes: 'Strong Node.js skills, discuss system design experience.',
                feedback: {
                  rating: 4,
                  strengths: 'Excellent problem-solving skills. Strong knowledge of Node.js and databases.',
                  weaknesses: 'Could improve communication of complex concepts.',
                  notes: 'Would be a good addition to the team.',
                  recommendation: 'hire'
                },
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              }
            ];
            localStorage.setItem('google_user_interviews', JSON.stringify(demoInterviews));
          }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;

        // If it's a Google user, clear any stored applicants
        if (action.payload.isGoogleUser) {
          localStorage.removeItem('applicants');
          console.log('Cleared applicants data for Google user');
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer; 