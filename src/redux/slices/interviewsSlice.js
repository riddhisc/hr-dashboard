import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import * as interviewsAPI from '../../features/interviews/interviewsAPI'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

// Extend dayjs with plugins
dayjs.extend(isBetween)

// Mock interview data for demo purposes
const mockInterviews = [
  {
    _id: 'mock_interview_1',
    applicantId: 'google_1',
    applicantName: 'Emily Brown',
    jobId: 'google_1',
    jobTitle: 'Senior Frontend Developer',
    date: dayjs().add(1, 'day').set('hour', 10).set('minute', 0).toISOString(),
    duration: 60,
    type: 'technical',
    location: 'Zoom',
    notes: 'Focus on React and TypeScript experience',
    status: 'scheduled',
    interviewers: [
      { id: 'interviewer_1', name: 'John Smith', email: 'john.smith@example.com' }
    ]
  },
  {
    _id: 'mock_interview_2',
    applicantId: 'google_2',
    applicantName: 'Michael Chen',
    jobId: 'google_2',
    jobTitle: 'Backend Developer',
    date: dayjs().add(3, 'day').set('hour', 10).set('minute', 0).toISOString(),
    duration: 60,
    type: 'technical',
    location: 'Google Meet',
    notes: 'Focus on Node.js and database experience',
    status: 'scheduled',
    interviewers: [
      { id: 'interviewer_2', name: 'Sarah Johnson', email: 'sarah.j@example.com' }
    ]
  },
  {
    _id: 'mock_interview_3',
    applicantId: 'google_5',
    applicantName: 'David Brown',
    jobId: 'google_3',
    jobTitle: 'UI/UX Designer',
    date: dayjs().add(5, 'day').set('hour', 13).set('minute', 30).toISOString(),
    duration: 60,
    type: 'portfolio',
    location: 'In-office',
    notes: 'Review portfolio and design process',
    status: 'scheduled',
    interviewers: [
      { id: 'interviewer_1', name: 'John Smith', email: 'john.smith@example.com' },
      { id: 'interviewer_3', name: 'Alex Wong', email: 'alex.w@example.com' }
    ]
  }
];

const initialState = {
  interviews: [],
  status: 'idle',
  error: null,
  lastFetched: null,
  filters: {
    status: 'all',
    type: 'all',
    date: null,
    search: ''
  }
}

// Fetch all interviews
export const fetchInterviews = createAsyncThunk(
  'interviews/fetchInterviews',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if there's already data in the cache and no need to refresh
      const currentState = getState().interviews;
      const hasData = currentState.interviews && currentState.interviews.length > 0;
      const isRecent = currentState.lastFetched && 
                      (Date.now() - currentState.lastFetched < 10000); // Cache for 10 seconds
      
      if (hasData && isRecent) {
        console.log('Using cached interviews data, last fetched at', new Date(currentState.lastFetched).toLocaleTimeString());
        return currentState.interviews;
      }
      
      // Check if user is a Google user (needs demo data)
      const { auth } = getState();
      const isGoogleUser = auth.user?.provider === 'google' || 
                           auth.user?.isGoogleUser || 
                           auth.user?.isDemo === true;
                           
      if (isGoogleUser) {
        console.log('Google user detected, checking for interviews in localStorage');
        
        // Get interviews from localStorage
        const googleInterviewsJSON = localStorage.getItem('google_user_interviews') || '[]';
        try {
          const googleInterviews = JSON.parse(googleInterviewsJSON);
          
          // If no interviews exist for this Google user, provide demo interviews
          if (googleInterviews.length === 0) {
            console.log('No interviews found for Google user, adding demo interviews');
            
            // Create mock interviews with Google user-specific IDs
            const demoInterviews = mockInterviews.map(interview => ({
              ...interview,
              _id: interview._id,
              createdByGoogleUser: true
            }));
            
            // Save to localStorage
            localStorage.setItem('google_user_interviews', JSON.stringify(demoInterviews));
            
            return demoInterviews;
          }
          
          return googleInterviews;
        } catch (error) {
          console.error('Error parsing Google user interviews from localStorage:', error);
          
          // Provide mock data as fallback
          localStorage.setItem('google_user_interviews', JSON.stringify(mockInterviews));
          return mockInterviews;
        }
      }
      
      console.log('Fetching interviews from backend API');
      try {
        const response = await interviewsAPI.fetchInterviews();
        
        if (!response.data) {
          throw new Error('No data received from API');
        }
        
        console.log(`Received ${response.data.length} interviews from API`);
        
        // Normalize data to ensure consistent format
        const normalizedInterviews = response.data.map(interview => {
          // Ensure each interview has all required fields
          return {
            ...interview,
            // Set default values for missing fields
            status: interview.status || 'scheduled',
            type: interview.type || 'technical',
            applicantName: interview.applicantName || (interview.applicantId?.name || 'Unknown Applicant'),
            jobTitle: interview.jobTitle || (interview.jobId?.title || 'Unknown Position'),
            // Ensure date is valid
            date: interview.date || new Date().toISOString()
          };
        });
        
        console.log('Normalized interviews sample:', normalizedInterviews.slice(0, 2));
        
        return normalizedInterviews;
      } catch (apiError) {
        console.error('API error fetching interviews:', apiError);
        // Fall back to mock data if the API call fails
        return mockInterviews;
      }
    } catch (error) {
      console.error('Error fetching interviews from backend:', error);
      // Display error message to user
      toast.error(`Failed to fetch interviews: ${error.message || 'Unknown error'}`);
      return rejectWithValue(error.message || 'Failed to fetch interviews');
    }
  }
)

// Schedule a new interview
export const scheduleInterview = createAsyncThunk(
  'interviews/scheduleInterview',
  async (interviewData, { rejectWithValue }) => {
    try {
      const response = await interviewsAPI.scheduleInterview(interviewData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update interview status
export const updateInterviewStatus = createAsyncThunk(
  'interviews/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      console.log(`Updating interview status via API: ID ${id}, Status ${status}`);
      
      // Make API call to update status
      const response = await interviewsAPI.updateInterviewStatus(id, { status });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      toast.success('Interview status updated successfully!');
      return response.data;
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error('Failed to update status: ' + (error.message || 'Unknown error'));
      return rejectWithValue(error.message || 'Failed to update interview status');
    }
  }
)

// Edit interview
export const editInterview = createAsyncThunk(
  'interviews/editInterview',
  async ({ id, interviewData }, { rejectWithValue }) => {
    try {
      console.log('Editing interview via API:', id);
      console.log('Interview data:', interviewData);
      
      const response = await interviewsAPI.updateInterview(id, interviewData);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      toast.success('Interview updated successfully!');
      return response.data;
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Failed to update interview: ' + (error.message || 'Unknown error'));
      return rejectWithValue(error.message || 'Failed to update interview');
    }
  }
)

// Add a new action for adding feedback specifically
export const addInterviewFeedback = createAsyncThunk(
  'interviews/addInterviewFeedback',
  async ({ interviewId, feedbackData }, { rejectWithValue, dispatch }) => {
    try {
      console.log(`Adding feedback for interview ${interviewId}:`, feedbackData);
      
      // This action uses the editInterview action to update the interview with feedback
      const interviewUpdate = {
        id: interviewId,
        interviewData: {
          feedback: feedbackData
        }
      };
      
      // Dispatch the editInterview action to update the interview
      const result = await dispatch(editInterview(interviewUpdate)).unwrap();
      
      return result;
    } catch (error) {
      console.error('Error adding interview feedback:', error);
      toast.error(`Failed to add feedback: ${error.message || 'Unknown error'}`);
      return rejectWithValue(error.message || 'Failed to add feedback');
    }
  }
);

// Schedule interview with multiple interviewers
export const scheduleInterviewWithInterviewers = createAsyncThunk(
  'interviews/scheduleWithInterviewers',
  async (interviewData, { rejectWithValue, getState }) => {
    try {
      console.log('Scheduling interview with interviewers:', interviewData);
      
      // Get the selected interviewers from localStorage
      const storedInterviewersStr = localStorage.getItem('interviewers');
      const storedInterviewers = storedInterviewersStr ? JSON.parse(storedInterviewersStr) : [];
      
      // Find the full interviewer data for each selected interviewer ID
      const selectedInterviewerDetails = interviewData.interviewers.map(interviewer => {
        const fullInterviewer = storedInterviewers.find(i => i.id === interviewer.id);
        return fullInterviewer || interviewer;  // Fall back to provided data if not found
      });
      
      // First, check if we're using localStorage-based storage (for Google users or demo mode)
      const { auth } = getState();
      const isLocalStorageUser = auth.user?.provider === 'google' || 
                               auth.user?.isGoogleUser || 
                               auth.user?.isDemo === true;
      
      if (isLocalStorageUser) {
        // For local storage users, we'll simulate a successful API call and store in localStorage
        console.log('Using localStorage to schedule interview (Google user or demo mode)');
        
        // Generate a unique ID
        const newInterview = {
          _id: `local_${Date.now()}`,
          ...interviewData,
          interviewers: selectedInterviewerDetails,  // Use the full interviewer data
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Get existing interviews from localStorage
        const storageKey = 'google_user_interviews';
        const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
        let storedInterviews = JSON.parse(storedInterviewsJSON);
        
        // Add the new interview
        storedInterviews.push(newInterview);
        
        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
        
        console.log('Successfully saved interview to localStorage:', newInterview);
        return newInterview;
      } else {
        // For regular users, make an API call
        console.log('Making API call to schedule interview');
        const interviewPayload = {
          ...interviewData,
          interviewers: selectedInterviewerDetails  // Use the full interviewer data
        };
        const response = await interviewsAPI.scheduleInterview(interviewPayload);
        console.log('API response:', response);
        return response;
      }
    } catch (error) {
      console.error('Error scheduling interview with interviewers:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to schedule interview');
    }
  }
);

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    setInterviewFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearInterviewFilters: (state) => {
      state.filters = initialState.filters
    },
    setInterviews: (state, action) => {
      state.interviews = action.payload
      state.status = 'succeeded'
    },
    updateInterviewInList: (state, action) => {
      const updatedInterview = action.payload;
      const index = state.interviews.findIndex(interview => 
        interview._id === updatedInterview._id || 
        String(interview._id) === String(updatedInterview._id)
      );
      
      if (index !== -1) {
        state.interviews[index] = {
          ...state.interviews[index],
          ...updatedInterview
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch interviews
      .addCase(fetchInterviews.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.interviews = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Schedule interview
      .addCase(scheduleInterview.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.interviews.push(action.payload)
      })
      .addCase(scheduleInterview.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Schedule interview with multiple interviewers
      .addCase(scheduleInterviewWithInterviewers.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(scheduleInterviewWithInterviewers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.interviews.push(action.payload)
      })
      .addCase(scheduleInterviewWithInterviewers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to schedule interview'
      })
      // Update status
      .addCase(updateInterviewStatus.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateInterviewStatus.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.interviews.findIndex(i => i._id === action.payload._id)
        if (index !== -1) {
          state.interviews[index] = action.payload
        }
      })
      .addCase(updateInterviewStatus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Edit interview
      .addCase(editInterview.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(editInterview.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.interviews.findIndex(i => i._id === action.payload._id)
        if (index !== -1) {
          state.interviews[index] = action.payload
        }
      })
      .addCase(editInterview.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Add interview feedback
      .addCase(addInterviewFeedback.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addInterviewFeedback.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.interviews.findIndex(i => i._id === action.payload._id)
        if (index !== -1) {
          state.interviews[index] = action.payload
        }
      })
      .addCase(addInterviewFeedback.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

// Selectors
export const selectAllInterviews = state => state.interviews.interviews
export const selectInterviewsStatus = state => state.interviews.status
export const selectInterviewsError = state => state.interviews.error
export const selectInterviewsFilters = state => state.interviews.filters

export const selectFilteredInterviews = state => {
  const interviews = state.interviews.interviews
  const filters = state.interviews.filters
  
  console.log('Filtering interviews with filters:', filters)
  console.log('Total interviews before filtering:', interviews.length)
  
  return interviews.filter(interview => {
    // Skip interviews without proper date information
    if (!interview || !interview.date) {
      console.log('Skipping interview with missing data:', interview?._id)
      return false
    }
    
    // Status filter
    if (filters.status !== 'all' && interview.status !== filters.status) {
      return false
    }
    
    // Type filter
    if (filters.type !== 'all' && interview.type !== filters.type) {
      return false
    }
    
    // Date filter
    if (filters.date && filters.date !== 'all') {
      const interviewDate = dayjs(interview.date)
      const today = dayjs().startOf('day')
      
      // Skip if interview date is invalid
      if (!interviewDate.isValid()) {
        console.error('Invalid interview date:', interview.date, 'for interview:', interview._id)
        return false
      }
      
      // For debugging
      console.log(`Filtering interview ${interview._id} with date ${interviewDate.format('YYYY-MM-DD')} against filter ${filters.date}`)
      
      // Format current date filters
      if (filters.date === 'today') {
        // Check if interview is today
        const isToday = interviewDate.isSame(today, 'day')
        console.log(`- Is today (${today.format('YYYY-MM-DD')})? ${isToday}`)
        if (!isToday) {
          return false
        }
      } else if (filters.date === 'tomorrow') {
        // Check if interview is tomorrow
        const tomorrow = today.add(1, 'day')
        const isTomorrow = interviewDate.isSame(tomorrow, 'day')
        console.log(`- Is tomorrow (${tomorrow.format('YYYY-MM-DD')})? ${isTomorrow}`)
        if (!isTomorrow) {
          return false
        }
      } else if (filters.date === 'thisWeek') {
        // Check if interview is this week
        const startOfWeek = today.startOf('week')
        const endOfWeek = today.endOf('week')
        const isThisWeek = interviewDate.isBetween(startOfWeek, endOfWeek, 'day', '[]')
        console.log(`- Is this week (${startOfWeek.format('YYYY-MM-DD')} to ${endOfWeek.format('YYYY-MM-DD')})? ${isThisWeek}`)
        if (!isThisWeek) {
          return false
        }
      } else if (filters.date === 'nextWeek') {
        // Check if interview is next week
        const startOfNextWeek = today.add(1, 'week').startOf('week')
        const endOfNextWeek = today.add(1, 'week').endOf('week')
        const isNextWeek = interviewDate.isBetween(startOfNextWeek, endOfNextWeek, 'day', '[]')
        console.log(`- Is next week (${startOfNextWeek.format('YYYY-MM-DD')} to ${endOfNextWeek.format('YYYY-MM-DD')})? ${isNextWeek}`)
        if (!isNextWeek) {
          return false
        }
      } else if (filters.date === 'thisMonth') {
        // Check if interview is this month (any year)
        const currentMonth = today.month();
        const interviewMonth = interviewDate.month();
        const isThisMonth = interviewMonth === currentMonth;
        console.log(`- Is this month (month ${currentMonth + 1})? ${isThisMonth}`);
        if (!isThisMonth) {
          return false;
        }
      } else if (filters.date === 'nextMonth') {
        // Check if interview is next month (any year)
        const nextMonth = (today.month() + 1) % 12; // Handle December → January transition
        const interviewMonth = interviewDate.month();
        const isNextMonth = interviewMonth === nextMonth;
        console.log(`- Is next month (month ${nextMonth + 1})? ${isNextMonth}`);
        if (!isNextMonth) {
          return false;
        }
      } else {
        // Try to parse as a specific date if it's not one of the keywords
        try {
          const specificDate = dayjs(filters.date)
          if (specificDate.isValid()) {
            const isSpecificDate = interviewDate.isSame(specificDate, 'day')
            console.log(`- Is specific date (${specificDate.format('YYYY-MM-DD')})? ${isSpecificDate}`)
            if (!isSpecificDate) {
              return false
            }
          }
        } catch (error) {
          console.error('Error parsing date filter:', error)
          return false
        }
      }
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        interview.applicantName?.toLowerCase().includes(searchLower) ||
        interview.jobTitle?.toLowerCase().includes(searchLower) ||
        interview.type?.toLowerCase().includes(searchLower) ||
        interview.location?.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) {
        return false
      }
    }
    
    return true
  })
}

export const { 
  setInterviewFilter, 
  clearInterviewFilters,
  setInterviews,
  updateInterviewInList
} = interviewsSlice.actions

export default interviewsSlice.reducer 