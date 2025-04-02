import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import * as interviewsAPI from './interviewsAPI'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { toast } from 'react-toastify'

// Extend dayjs with plugins
dayjs.extend(isBetween)

// Mock data for interviews
const mockInterviews = [
  {
    _id: '1',
    applicantId: '1',
    applicantName: 'John Smith',
    jobId: '1',
    jobTitle: 'Frontend Developer',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in the past
    time: '10:00 AM',
    duration: 60, // minutes
    interviewers: ['Sarah Johnson', 'Michael Chen'],
    type: 'technical',
    location: 'Microsoft Teams',
    status: 'cancelled',
    notes: 'Candidate has 5 years of React experience',
    rating: null
  },
  {
    _id: '2',
    applicantId: '2',
    applicantName: 'Sarah Johnson',
    jobId: '2',
    jobTitle: 'Frontend Developer',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days in the future
    time: '2:30 PM',
    duration: 45,
    interviewers: ['Alex Wong', 'Emily Davis'],
    type: 'technical',
    location: 'Google Meet',
    status: 'completed',
    notes: 'Candidate has an impressive portfolio',
    rating: 4
  },
  {
    _id: '3',
    applicantId: '3',
    applicantName: 'Michael Chen',
    jobId: '1',
    jobTitle: 'Backend Developer',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days in the future
    time: '11:30 AM',
    duration: 60,
    interviewers: ['Sarah Johnson', 'Robert Garcia'],
    type: 'technical',
    location: 'In-office',
    status: 'scheduled',
    notes: 'Second round technical interview',
    rating: null
  },
  {
    _id: '4',
    applicantId: '4',
    applicantName: 'Emily Wilson',
    jobId: '3',
    jobTitle: 'DevOps Engineer',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day in the future
    time: '9:00 AM',
    duration: 45,
    interviewers: ['David Kim', 'Jessica Martinez'],
    type: 'technical',
    location: 'Zoom',
    status: 'scheduled',
    notes: 'Focus on Kubernetes and CI/CD pipelines',
    rating: null
  },
  {
    _id: '5',
    applicantId: '5',
    applicantName: 'Chris Taylor',
    jobId: '2',
    jobTitle: 'UX Designer',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in the future
    time: '3:30 PM',
    duration: 45,
    interviewers: ['Emily Davis', 'James Wilson'],
    type: 'technical',
    location: 'Google Meet',
    status: 'scheduled',
    notes: 'Portfolio review and design challenge discussion',
    rating: null
  }
];

const initialState = {
  interviews: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    status: 'all',
    type: 'all',
    date: null,
    search: ''
  }
}

// Helper function to check if a user is a localStorage-based user (Google or Demo)
const isLocalStorageUser = (user) => {
  if (!user) return false;
  return user.isGoogleUser || user.provider === 'google' || user.isDemo === true;
};

// Async thunks
export const fetchInterviews = createAsyncThunk(
  'interviews/fetchInterviews',
  async (_, { rejectWithValue, getState }) => {
    try {
      // First check if user is a localStorage-based user
      const state = getState();
      const user = state.auth.user;
      const isStorageUser = isLocalStorageUser(user);
      
      console.log('FetchInterviews - Current user:', user);
      console.log('FetchInterviews - Is localStorage user?', isStorageUser);
      
      // For localStorage users, prioritize localStorage data
      if (isStorageUser) {
        console.log('Fetching interviews for localStorage user');
        
        try {
          // Read from localStorage
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          let storedInterviews = [];
          
          try {
            storedInterviews = JSON.parse(storedInterviewsJSON);
            console.log(`Found ${storedInterviews.length} interviews in localStorage`);
            
            if (storedInterviews.length > 0) {
              // Return localStorage interviews for Google users
              return storedInterviews;
            }
          } catch (parseError) {
            console.error('Error parsing localStorage interviews:', parseError);
          }
        } catch (storageError) {
          console.error('Error accessing localStorage:', storageError);
        }
      }
      
      // If we get here, either the user is not a localStorage user or localStorage is empty
      console.log('Fetching interviews from backend API');
      const response = await interviewsAPI.fetchInterviews();
      
      // For localStorage users, also add any interviews from localStorage that aren't in the API response
      if (isStorageUser) {
        console.log('Merging API response with localStorage for localStorage user');
        
        try {
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          let storedInterviews = [];
          
          try {
            storedInterviews = JSON.parse(storedInterviewsJSON);
            
            if (storedInterviews.length > 0) {
              // Create a set of API interview IDs for faster lookup
              const apiInterviewIds = new Set();
              response.data.forEach(interview => apiInterviewIds.add(String(interview._id)));
              
              // Find interviews in localStorage that aren't in the API response
              const uniqueLocalInterviews = storedInterviews.filter(
                interview => !apiInterviewIds.has(String(interview._id))
              );
              
              console.log(`Found ${uniqueLocalInterviews.length} unique interviews in localStorage`);
              
              // Merge API response with unique localStorage interviews
              const mergedInterviews = [...response.data, ...uniqueLocalInterviews];
              console.log(`Returning ${mergedInterviews.length} merged interviews`);
              
              // Update localStorage with merged interviews for future reference
              localStorage.setItem(storageKey, JSON.stringify(mergedInterviews));
              
              return mergedInterviews;
            }
          } catch (parseError) {
            console.error('Error parsing localStorage during merge:', parseError);
          }
        } catch (mergeError) {
          console.error('Error during localStorage merge:', mergeError);
        }
      }
      
      // Return the data from the API response
      return response.data;
      } catch (error) {
      console.error('Error fetching interviews:', error);
      
      // For localStorage users, try to return localStorage data if API fails
      try {
        const state = getState();
        const user = state.auth.user;
        const isStorageUser = isLocalStorageUser(user);
        
        if (isStorageUser) {
          console.log('API error for localStorage user, trying to use localStorage as fallback');
          
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          let storedInterviews = [];
          
          try {
            storedInterviews = JSON.parse(storedInterviewsJSON);
            console.log(`Found ${storedInterviews.length} interviews in localStorage as fallback`);
            
            if (storedInterviews.length > 0) {
              // Return localStorage data as fallback
              return storedInterviews;
            }
          } catch (parseError) {
            console.error('Error parsing localStorage during fallback:', parseError);
          }
        }
      } catch (fallbackError) {
        console.error('Error in localStorage fallback:', fallbackError);
      }
      
      return rejectWithValue(error.message || 'Failed to fetch interviews');
    }
  }
)

export const fetchInterviewById = createAsyncThunk(
  'interviews/fetchInterviewById',
  async (id, { rejectWithValue, getState, dispatch }) => {
      try {
      console.log(`Fetching interview with ID ${id}`);
      // Check if user is a localStorage-based user
      const state = getState();
      const user = state.auth.user;
        
      // Debug info
      console.log('Current user:', user);
      console.log('Is localStorage user?', isLocalStorageUser(user));
      
      if (isLocalStorageUser(user)) {
        console.log('Checking localStorage first for interview');
        try {
          // Get interviews from localStorage - use a specific key based on user type
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          const storedInterviews = JSON.parse(storedInterviewsJSON);
          
          console.log(`Found ${storedInterviews.length} interviews in localStorage`);
          
          // Try to find the interview
          const interview = storedInterviews.find(i => 
            i._id === id || 
            String(i._id) === String(id) ||
            i._id?.toString() === id?.toString()
          );
          
          if (interview) {
            console.log('Found interview in localStorage:', interview);
            
            // Make sure all interviews are in Redux state
            if (storedInterviews.length > 0 && 
                (state.interviews.interviews.length === 0 || 
                 state.interviews.interviews.length !== storedInterviews.length)) {
              console.log('Updating Redux store with all localStorage interviews');
              dispatch(setInterviews(storedInterviews));
            }
            
        return interview;
          }
          
          console.log(`Interview with ID ${id} not found in localStorage`);
          
          // For localStorage users, create a placeholder for ANY ID, even MongoDB ones
          // This ensures demo users can always see a placeholder interview
          if (isLocalStorageUser(user)) {
            console.log('Creating a placeholder interview for localStorage user');
            
            // Use original ID to maintain consistency with navigation
            const placeholderID = id;
            
            // Create a placeholder interview
            const placeholderInterview = {
              _id: placeholderID,
              applicantName: 'New Applicant',
              jobTitle: 'Position',
              status: 'scheduled',
              date: new Date().toISOString(),
              duration: 60,
              interviewers: [],
              location: 'Zoom',
              type: 'initial',
              notes: '',
              feedback: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Add the interview to localStorage
            storedInterviews.push(placeholderInterview);
            localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
            
            // Update Redux store
            dispatch(setInterviews(storedInterviews));
            
            console.log('Created and saved placeholder interview for demo user:', placeholderInterview);
            toast.info('Created a new placeholder interview. This is saved in your browser.');
            
            // Return the created interview
            return placeholderInterview;
          }
      } catch (error) {
          console.error('Error handling localStorage in fetchInterviewById:', error);
        }
      }
      
      // If not in localStorage or not a localStorage user, try the API
      console.log(`Fetching interview with ID ${id} from backend API`);
      try {
      const response = await interviewsAPI.getInterviewById(id);
      
      if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error(`Interview with ID ${id} not found in the database`);
      }
      
      return response.data;
      } catch (apiError) {
        console.error(`API Error fetching interview ${id}:`, apiError);
        
        // For localStorage users, return a not found error but create a placeholder in the component
        if (isLocalStorageUser(user)) {
          console.log('API error for localStorage user, returning special code to create placeholder');
          return rejectWithValue('not_found_create_placeholder');
        }
        
        // For regular API users, just return the error
        throw apiError;
      }
    } catch (error) {
      console.error('Error fetching interview from API:', error);
      return rejectWithValue(error.message || 'Failed to load interview details');
    }
  }
)

export const fetchInterviewsByApplicantId = createAsyncThunk(
  'interviews/fetchInterviewsByApplicantId',
  async (applicantId, { rejectWithValue }) => {
    try {
      const response = await interviewsAPI.getInterviewsByApplicantId(applicantId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch interviews for this applicant. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

export const scheduleInterview = createAsyncThunk(
  'interviews/scheduleInterview',
  async (interviewData, { rejectWithValue, getState }) => {
    try {
      console.log('scheduleInterview received data:', interviewData);
      
      // Check if user is a localStorage-based user
      const state = getState();
      const user = state.auth.user;
      
      if (isLocalStorageUser(user)) {
        console.log('localStorage-based user scheduling interview, saving to localStorage');
        
        // Validate the input data for required fields
        if (!interviewData.applicantId) {
          return rejectWithValue('Applicant is required');
        }
        
        if (!interviewData.date) {
          return rejectWithValue('Interview date is required');
        }
        
        // Validate date format
        try {
          const dateObj = new Date(interviewData.date);
          if (isNaN(dateObj.getTime())) {
            console.error('Invalid date format in API scheduleInterview:', interviewData.date);
            return rejectWithValue('Invalid date format. Please select a valid date.');
          }
          
          // Ensure date is in ISO format
          interviewData.date = dateObj.toISOString();
        } catch (dateError) {
          console.error('Error parsing date in API scheduleInterview:', dateError);
          return rejectWithValue('Error parsing date. Please try again.');
        }
        
        // Generate a unique ID for the new interview
        const newId = 'google_' + Date.now().toString();
        
        // Create the interview object
        const newInterview = {
          _id: newId,
          ...interviewData,
          // Ensure IDs are properly formatted for Google users
          applicantId: String(interviewData.applicantId),
          jobId: String(interviewData.jobId || 'default_job_id'),
          status: 'scheduled',
          feedback: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // We need to add applicant name and job title
          applicantName: '',
          jobTitle: ''
        };
        
        // Find applicant info from state to add applicant name and job title
        const applicants = state.applicants.applicants;
        const applicant = applicants.find(a => String(a._id) === String(interviewData.applicantId));
        
        if (applicant) {
          newInterview.applicantName = applicant.name;
          newInterview.jobTitle = applicant.jobTitle || 'Unknown Position';
        } else {
          console.warn('Could not find applicant details for:', interviewData.applicantId);
          newInterview.applicantName = 'Unknown Applicant';
        }
        
        // Get existing Google user interviews from localStorage
        const googleInterviewsJSON = localStorage.getItem('google_user_interviews') || '[]';
        let googleInterviews = [];
        
        try {
          googleInterviews = JSON.parse(googleInterviewsJSON);
          
          // Add the new interview
          googleInterviews.push(newInterview);
          
          // Save back to localStorage
          localStorage.setItem('google_user_interviews', JSON.stringify(googleInterviews));
          
          toast.success('Interview scheduled successfully!');
          return newInterview;
        } catch (error) {
          console.error('Error saving Google user interview to localStorage:', error);
          toast.error('Failed to schedule interview: Could not save to local storage');
          return rejectWithValue('Failed to save interview data');
        }
      }
      
      // For non-Google users, proceed with API call
      // First validate the data before sending to API to prevent 400 errors
      if (!interviewData.applicantId) {
        return rejectWithValue('Applicant is required');
      }
      
      if (!interviewData.jobId) {
        return rejectWithValue('Job position is required');
      }
      
      if (!interviewData.date) {
        return rejectWithValue('Interview date is required');
      }
      
      // Validate date format
      try {
        const dateObj = new Date(interviewData.date);
        if (isNaN(dateObj.getTime())) {
          console.error('Invalid date format in API scheduleInterview:', interviewData.date);
          return rejectWithValue('Invalid date format. Please select a valid date.');
        }
        
        // Ensure date is in ISO format
        interviewData.date = dateObj.toISOString();
      } catch (dateError) {
        console.error('Error parsing date in API scheduleInterview:', dateError);
        return rejectWithValue('Error parsing date. Please try again.');
      }
      
      // Check if IDs are in the right format for API calls
      const applicantIdStr = String(interviewData.applicantId || '');
      const jobIdStr = String(interviewData.jobId || '');
      
      if (applicantIdStr.startsWith('google_') || applicantIdStr.startsWith('local_')) {
        console.error('Invalid applicantId format for API call:', interviewData.applicantId);
        return rejectWithValue('For standard accounts, please select a valid applicant (not a Google-stored applicant)');
      }
      
      if (jobIdStr.startsWith('google_') || jobIdStr.startsWith('local_')) {
        console.error('Invalid jobId format for API call:', interviewData.jobId);
        return rejectWithValue('For standard accounts, please select a valid job (not a Google-stored job)');
      }
      
      const response = await interviewsAPI.scheduleInterview(interviewData);
      toast.success('Interview scheduled successfully!');
      return response.data;
    } catch (error) {
      console.error('Interview scheduling error:', error);
      
      // Extract the most useful error message
      let errorMessage = 'Failed to schedule interview';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to schedule interview: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
)

export const updateInterviewStatus = createAsyncThunk(
  'interviews/updateStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      console.log(`Updating interview ${id} status to ${status}`);
      
      // Check if interview ID is a localStorage-based ID
      const interviewIdStr = String(id || '');
      const isLocalStorageId = interviewIdStr.startsWith('google_') || 
                               interviewIdStr.startsWith('local_') ||
                               interviewIdStr.startsWith('mock_');
      
      // Check if user is a localStorage-based user
      const state = getState();
      const user = state.auth.user;
      const isStorageUser = isLocalStorageUser(user);
      
      // First get the current interview to preserve its data
      const currentInterview = selectInterviewById(state, id);
      
      if (!currentInterview) {
        throw new Error(`Interview with ID ${id} not found`);
      }
      
      // Create updated interview object with preserved data
      const updatedInterview = {
        ...currentInterview,
        status: status,
        updatedAt: new Date().toISOString()
      };
      
      // If it's a localStorage-based user or a localStorage-based ID, update in localStorage
      if (isStorageUser || isLocalStorageId) {
        console.log('localStorage-based interview or user, updating localStorage');
        
        try {
          // Get interviews from localStorage
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          let storedInterviews = JSON.parse(storedInterviewsJSON);
          
          // Try to find the interview index
          const index = storedInterviews.findIndex(i => 
            i._id === id || 
            String(i._id) === String(id) ||
            i._id?.toString() === id?.toString()
          );
          
          if (index !== -1) {
            // Update the interview with new status while preserving all other data
            storedInterviews[index] = {
              ...storedInterviews[index],
              ...updatedInterview
            };
          
          // Save back to localStorage
            localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
          
            console.log('Updated interview in localStorage:', storedInterviews[index]);
            toast.success('Interview status updated successfully!');
          } else {
            console.warn(`Interview with ID ${id} not found in localStorage, adding it`);
            // Add to localStorage since it wasn't found
            storedInterviews.push(updatedInterview);
            localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
          }
          
          // Update the list of all interviews in localStorage
          storedInterviews = storedInterviews.map(interview => 
            (interview._id === id || String(interview._id) === String(id))
              ? { ...interview, status, updatedAt: new Date().toISOString() }
              : interview
          );
          localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
        } catch (error) {
          console.error('Error updating interview in localStorage:', error);
          // Continue even if localStorage update fails
        }
        
        // For localStorage users or IDs, return the updated interview without API call
        return updatedInterview;
      }
      
      // If not a Google user or localStorage ID, proceed with API call
      console.log('Updating interview status via API');
      
      try {
      const response = await interviewsAPI.updateInterviewStatus(id, { status });
        
        // Merge the API response with our preserved data
        const apiUpdatedInterview = {
          ...updatedInterview,
          ...response.data
        };
        
        console.log('API update successful with preserved data:', apiUpdatedInterview);
      toast.success('Interview status updated successfully!');
        return apiUpdatedInterview;
      } catch (apiError) {
        console.error('API error updating status:', apiError);
        
        // If API fails but we have the current interview data, return that
        if (currentInterview) {
          console.warn('API failed but returning updated local data');
          toast.info('Could not connect to server. Changes saved locally.');
          return updatedInterview;
        }
        
        throw apiError;
      }
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error('Failed to update status: ' + (error.message || 'Unknown error'));
      return rejectWithValue(error.message || 'Failed to update interview status');
    }
  }
)

export const editInterview = createAsyncThunk(
  'interviews/editInterview',
  async ({ id, interviewData }, { rejectWithValue, getState }) => {
    try {
      console.log('editInterview called with ID:', id);
      console.log('Interview data to update:', interviewData);
      
      // Check if user is a localStorage-based user
      const state = getState();
      const user = state.auth.user;
      const isGoogleUser = isLocalStorageUser(user);
      
      // First get the current interview to ensure we have all data
      const currentInterview = selectInterviewById(state, id);
      
      if (!currentInterview) {
        console.warn(`Interview with ID ${id} not found in Redux state`);
      } else {
        console.log('Current interview from state:', currentInterview);
      }
      
      // Special handling for date fields to ensure proper formatting
      let formattedData = { ...interviewData };
      if (formattedData.date) {
        try {
          // Ensure date is in proper ISO format
          const dateObj = new Date(formattedData.date);
          if (!isNaN(dateObj.getTime())) {
            formattedData.date = dateObj.toISOString();
            console.log('Successfully formatted date to ISO:', formattedData.date);
          } else {
            console.warn('Could not parse date, using original:', formattedData.date);
          }
        } catch (dateError) {
          console.error('Error formatting date in thunk:', dateError);
          // Don't throw, just keep the original format
        }
      }
      
      if (isGoogleUser) {
        console.log('Google user editing interview, updating localStorage');
        
        // Get interviews from localStorage
        const storageKey = 'google_user_interviews';
        const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
        let storedInterviews = [];
        
        try {
          storedInterviews = JSON.parse(storedInterviewsJSON);
          
          // Try to find the interview index with more flexible matching
          const index = storedInterviews.findIndex(i => 
            i._id === id || 
            String(i._id) === String(id) ||
            i._id?.toString() === id?.toString()
          );
          
          if (index !== -1) {
            const existingInterview = storedInterviews[index];
            console.log('Found existing interview in localStorage:', existingInterview);
            
            // Create updated interview by merging existing with new data
            const updatedInterview = {
              ...existingInterview,
              ...formattedData, // Use formatted data with proper date
                updatedAt: new Date().toISOString()
              };
              
            console.log('Updated interview object to save:', updatedInterview);
            
            // Update the interview in localStorage
            storedInterviews[index] = updatedInterview;
            
            try {
              localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
              console.log('Updated interview in localStorage successfully');
            } catch (saveError) {
              console.error('Error saving to localStorage:', saveError);
              // Continue even if localStorage save fails
            }
            
            toast.success('Interview updated successfully!');
            
            // Return the updated interview
            return updatedInterview;
          } else if (currentInterview) {
            // Not found by ID, but we have it in Redux state
            console.log('Interview not found in localStorage but available in Redux state');
            
            // Create merged interview data
            const mergedInterview = {
              ...currentInterview,
              ...formattedData,
              _id: id, // Ensure ID consistency
              updatedAt: new Date().toISOString()
            };
            
            // Add to localStorage
            try {
              storedInterviews.push(mergedInterview);
              localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
              console.log('Added interview to localStorage:', mergedInterview);
            } catch (saveError) {
              console.error('Error adding to localStorage:', saveError);
              // Continue even if localStorage save fails
            }
            
            toast.success('Interview updated successfully!');
            
            return mergedInterview;
          } else {
            console.warn(`Interview with ID ${id} not found in localStorage or Redux state, creating new entry`);
            
            // Create a new interview object with the data we have
            const newInterview = {
              _id: id,
              ...formattedData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            try {
              // Add to localStorage
              storedInterviews.push(newInterview);
              localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
              console.log('Created new interview in localStorage:', newInterview);
            } catch (saveError) {
              console.error('Error creating in localStorage:', saveError);
              // Continue even if localStorage save fails
            }
            
            toast.info('Created new interview record');
            return newInterview;
          }
        } catch (localStorageError) {
          console.error('Error accessing localStorage:', localStorageError);
          
          // If we have the interview in Redux state, update and return that
          if (currentInterview) {
            console.log('Returning updated interview from Redux state due to localStorage error');
            
            const mergedInterview = {
              ...currentInterview,
              ...formattedData,
              updatedAt: new Date().toISOString()
            };
            
            toast.warning('Updated interview locally. Some data may not persist between sessions.');
            return mergedInterview;
          }
          
          // If all else fails, create a new interview object to return
          const newInterview = {
            _id: id,
            ...formattedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          toast.warning('Created new interview record due to error finding existing one.');
          return newInterview;
        }
      }
      
      // If not a Google user or not found in localStorage, try API
      console.log('Attempting to update interview via API');
      
      try {
        const response = await interviewsAPI.updateInterview(id, formattedData);
        console.log('API update successful, response:', response);
          
          toast.success('Interview updated successfully!');
        return response;
      } catch (apiError) {
        console.error('API error updating interview:', apiError);
        
        if (currentInterview) {
          console.log('API request failed but returning updated local state');
          
          const updatedInterview = {
            ...currentInterview,
            ...formattedData,
            updatedAt: new Date().toISOString()
          };
          
          toast.info('Server error. Changes saved locally.');
          return updatedInterview;
        }
        
        // If we have no current interview but have data, create a placeholder
        const placeholderInterview = {
          _id: id,
          ...formattedData,
          updatedAt: new Date().toISOString(),
          _localUpdate: true
        };
        
        console.log('Created placeholder interview due to API error:', placeholderInterview);
        toast.info('Created placeholder record due to connection issues.');
        return placeholderInterview;
      }
        } catch (error) {
      console.error('Error in editInterview thunk:', error);
      
      // Don't reject with error message, instead return a fallback interview object
      // This prevents the error from bubbling up to the UI in the first place
      const fallbackInterview = {
        _id: id,
        ...interviewData,
        updatedAt: new Date().toISOString(),
        _fallback: true
      };
      
      toast.info('Interview changes saved locally');
      return fallbackInterview;
    }
  }
)

export const addInterviewFeedback = createAsyncThunk(
  'interviews/addInterviewFeedback',
  async (payload, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      
      // Extract parameters - support both parameter formats for better compatibility
      const interviewId = payload.interviewId || payload.id;
      const feedbackData = payload.feedbackData || payload.feedback;
      
      console.log(`Adding feedback for interview ${interviewId}:`, feedbackData);
      
      // Check if interviewId is a localStorage-based ID (starts with google_ or local_)
      const interviewIdStr = String(interviewId || '');
      const isLocalStorageId = interviewIdStr.startsWith('google_') || interviewIdStr.startsWith('local_');
      
      // If user is a localStorage user or the ID is a localStorage ID, use localStorage
      if (isLocalStorageUser(user) || isLocalStorageId) {
        console.log('Handling feedback for localStorage-based interview');
        
        try {
          // Find the interview in localStorage
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          let storedInterviews = [];
          
          try {
            storedInterviews = JSON.parse(storedInterviewsJSON);
          } catch (parseError) {
            console.error('Error parsing localStorage interviews:', parseError);
            return rejectWithValue('Error accessing locally stored interviews');
          }
          
          // Find the interview to update
          const interviewIndex = storedInterviews.findIndex(interview => 
            String(interview._id) === String(interviewId)
          );
          
          if (interviewIndex === -1) {
            console.error(`Interview with ID ${interviewId} not found in localStorage`);
            return rejectWithValue(`Interview not found in local storage`);
          }
          
          // Create updated interview object
          const originalInterview = storedInterviews[interviewIndex];
          
          // Format feedback data consistently
          const formattedFeedback = typeof feedbackData === 'string' 
            ? { notes: feedbackData } 
            : feedbackData;
          
          const updatedInterview = {
            ...originalInterview,
            feedback: formattedFeedback,
            status: 'completed', // Mark as completed when feedback is added
            updatedAt: new Date().toISOString()
          };
          
          // Update the interview in the array
          storedInterviews[interviewIndex] = updatedInterview;
          
          // Save the entire updated list back to localStorage
          localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
          console.log('Successfully updated interview in localStorage with new feedback');
          
          // Return the fully updated interview object
          return updatedInterview;
          
      } catch (error) {
          console.error('Error updating feedback in localStorage:', error);
          return rejectWithValue(error.message || 'Failed to update feedback in localStorage');
        }
      }
      
      // Handle API users (non-localStorage)
      console.log('Handling feedback addition via API call');
      
      // Validate that the ID is not a localStorage ID before making API call
      if (isLocalStorageId) {
        console.error(`Cannot use API for localStorage interview ID: ${interviewId}`);
        return rejectWithValue('Cannot update this interview through the API. Please try a standard account or contact support.');
      }
      
      try {
        // Format feedback data to match what the backend expects
        let formattedFeedbackData = feedbackData;
        
        // If feedbackData is a string, format it as a structured object
        if (typeof feedbackData === 'string') {
          formattedFeedbackData = {
            notes: feedbackData,
            strengths: '',
            weaknesses: '',
            rating: 3,
            recommendation: 'consider'
          };
        } 
        // If it's an object but missing required fields, add them
        else if (typeof feedbackData === 'object') {
          // Make sure recommendation is one of the allowed values
          let recommendation = feedbackData.recommendation || 'consider';
          // Ensure recommendation is one of the allowed values (hire, reject, consider)
          if (!['hire', 'reject', 'consider'].includes(recommendation)) {
            recommendation = 'consider';
          }
          
          formattedFeedbackData = {
            notes: feedbackData.notes || '',
            strengths: feedbackData.strengths || '',
            weaknesses: feedbackData.weaknesses || '',
            rating: feedbackData.rating || 3,
            recommendation: recommendation
          };
        }
        
        // Get the current interview to preserve its status
        const state = getState();
        const currentInterview = selectInterviewById(state, interviewId);
        const currentStatus = currentInterview?.status;
        
        console.log('Sending formatted feedback data to API:', formattedFeedbackData);
        const response = await interviewsAPI.addInterviewFeedback(interviewId, formattedFeedbackData);
        console.log('API response for adding feedback:', response.data);
        
        // If we got a valid response but the status has changed, restore the original status
        let responseData = response.data;
        if (responseData && currentStatus && responseData.status !== currentStatus) {
          console.log(`Preserving original status '${currentStatus}' instead of API's '${responseData.status}'`);
          responseData = {
            ...responseData,
            status: currentStatus
          };
        }
        
        return responseData; // Return the potentially modified response
      } catch (apiError) {
        console.error(`API Error adding feedback for interview ${interviewId}:`, apiError);
        return rejectWithValue(apiError.message || 'Failed to add feedback through API');
      }
    } catch (error) {
      console.error('Unexpected error in addInterviewFeedback:', error);
      return rejectWithValue(error.message || 'An unexpected error occurred');
    }
  }
)

export const deleteInterview = createAsyncThunk(
  'interviews/deleteInterview',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Always try API first regardless of user type
      console.log('Attempting to delete interview via API');
      
      try {
        await interviewsAPI.deleteInterview(id);
        console.log('API delete successful');
        
        // For localStorage-based users, also remove from localStorage
      const state = getState();
      const user = state.auth.user;
        if (isLocalStorageUser(user)) {
          try {
            removeInterviewFromLocalStorage(id);
          } catch (localError) {
            console.error('Error removing from localStorage:', localError);
            // Continue even if localStorage update fails
          }
        }
        
        toast.success('Interview deleted successfully!');
        return id; // Return the id so we can remove it from state
      } catch (apiError) {
        console.error('API Error deleting interview:', apiError);
        
        // If API call fails, fall back to localStorage
        const state = getState();
        const user = state.auth.user;
        
        if (isLocalStorageUser(user) || apiError.response?.status === 404) {
          console.log('API call failed, falling back to localStorage');
          toast.info('Backend server not available. Using local storage instead.');
          
          removeInterviewFromLocalStorage(id);
          return id;
        }
        
        throw apiError;
      }
    } catch (error) {
      console.error('Unexpected error in deleteInterview thunk:', error);
      toast.error('Failed to delete interview: ' + (error.message || 'Unknown error'));
      return rejectWithValue(error.message || 'Failed to delete interview');
    }
  }
);

// Helper function to remove an interview from localStorage
const removeInterviewFromLocalStorage = (id) => {
  console.log('Removing interview from localStorage');
  
  // Get interviews from localStorage
  const interviewsJSON = localStorage.getItem('google_user_interviews') || '[]';
  let interviews = JSON.parse(interviewsJSON);
  
  // Find the interview to delete
  const interviewIndex = interviews.findIndex(interview => 
    interview._id === id || 
    String(interview._id) === String(id) ||
    interview._id?.toString() === id?.toString()
  );
  
  if (interviewIndex === -1) {
    console.error(`Interview with ID ${id} not found in localStorage`);
    throw new Error(`Interview with ID ${id} not found in localStorage`);
  }
          
          // Remove the interview
  interviews.splice(interviewIndex, 1);
          
          // Save back to localStorage
  localStorage.setItem('google_user_interviews', JSON.stringify(interviews));
  
  // Force direct reading of updated data by clearing any cached data
  localStorage.removeItem('google_user_interviews_cache');
  
  toast.success('Interview deleted from localStorage');
      return id;
};

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    setInterviewFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearInterviewFilters: (state) => {
      state.filters = initialState.filters;
    },
    setInterviews: (state, action) => {
      state.interviews = action.payload;
      state.status = 'succeeded';
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
      .addCase(fetchInterviews.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Handle both array and null/undefined cases
        const interviews = Array.isArray(action.payload) ? action.payload : [];
        
        // Process the interviews to ensure they have applicantName and jobTitle
        state.interviews = interviews.map(interview => {
          // If the backend returns populated applicant data, extract the name
          if (interview.applicantId && typeof interview.applicantId === 'object' && interview.applicantId.name) {
            return {
              ...interview,
              applicantName: interview.applicantId.name,
              jobTitle: interview.jobId && typeof interview.jobId === 'object' ? interview.jobId.title : interview.jobTitle
            };
          }
          return interview;
        });
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchInterviewById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchInterviewById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const existingIndex = state.interviews.findIndex(i => i._id === action.payload._id)
        
        // Process the interview to ensure it has applicantName and jobTitle
        let interview = { ...action.payload };
        
        // If the backend returns populated applicant data, extract the name
        if (interview.applicantId && typeof interview.applicantId === 'object' && interview.applicantId.name) {
          interview = {
            ...interview,
            applicantName: interview.applicantId.name,
            jobTitle: interview.jobId && typeof interview.jobId === 'object' ? interview.jobId.title : interview.jobTitle
          };
        }
        
        if (existingIndex >= 0) {
          state.interviews[existingIndex] = interview;
        } else {
          state.interviews.push(interview);
        }
      })
      .addCase(fetchInterviewById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchInterviewsByApplicantId.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchInterviewsByApplicantId.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const existingIds = state.interviews.map(i => i._id)
        
        // Process the interviews to ensure they have applicantName and jobTitle
        const processedInterviews = action.payload.map(interview => {
          // If the backend returns populated applicant data, extract the name
          if (interview.applicantId && typeof interview.applicantId === 'object' && interview.applicantId.name) {
            return {
              ...interview,
              applicantName: interview.applicantId.name,
              jobTitle: interview.jobId && typeof interview.jobId === 'object' ? interview.jobId.title : interview.jobTitle
            };
          }
          return interview;
        });
        
        const newInterviews = processedInterviews.filter(i => !existingIds.includes(i._id))
        state.interviews = [...state.interviews, ...newInterviews]
      })
      .addCase(fetchInterviewsByApplicantId.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(scheduleInterview.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Process the new interview to ensure it has applicantName and jobTitle
        let newInterview = { ...action.payload };
        
        // If the backend returns populated applicant data, extract the name
        if (newInterview.applicantId && typeof newInterview.applicantId === 'object' && newInterview.applicantId.name) {
          newInterview = {
            ...newInterview,
            applicantName: newInterview.applicantId.name,
            jobTitle: newInterview.jobId && typeof newInterview.jobId === 'object' ? newInterview.jobId.title : newInterview.jobTitle
          };
        }
        
        state.interviews.push(newInterview);
      })
      .addCase(scheduleInterview.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateInterviewStatus.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateInterviewStatus.fulfilled, (state, action) => {
        state.status = 'idle';
        
        // Ensure we have a valid payload
        if (!action.payload) {
          console.error('Invalid payload received from updateInterviewStatus:', action.payload);
          return;
        }
        
        const { _id, status } = action.payload;
        
        // Safety check to ensure we have an ID
        if (!_id) {
          console.error('Invalid interview ID in updateInterviewStatus payload:', action.payload);
          return;
        }
        
        // Find and update the interview
        const existingInterviewIndex = state.interviews.findIndex(
          interview => interview._id === _id || String(interview._id) === String(_id)
        );
        
        if (existingInterviewIndex !== -1) {
          // Update the interview in place
          state.interviews[existingInterviewIndex] = {
            ...state.interviews[existingInterviewIndex],
                  ...action.payload,
            status: status // Ensure status is updated even if it's the only field in payload
          };
          
          console.log('Interview status updated in Redux store:', state.interviews[existingInterviewIndex]);
        } else {
          // If interview not found in state, add it
          console.log('Interview not found in state, adding it with updated status');
          state.interviews.push(action.payload);
        }
      })
      .addCase(updateInterviewStatus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(editInterview.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(editInterview.fulfilled, (state, action) => {
        state.status = 'succeeded'
        console.log('editInterview.fulfilled - payload:', action.payload);
        
        // Ensure the payload has an _id property
        if (!action.payload || !action.payload._id) {
          console.error('Invalid payload from editInterview:', action.payload);
          return;
        }
        
        // Find the interview to update - try both direct and string comparison
        let index = state.interviews.findIndex(i => i._id === action.payload._id);
        
        // If not found by direct comparison, try string comparison
        if (index === -1) {
          index = state.interviews.findIndex(i => 
            String(i._id) === String(action.payload._id)
          );
        }
        
        if (index !== -1) {
          // Process the updated interview to ensure it has applicantName and jobTitle
          let updatedInterview = { ...action.payload };
          
          // Preserve applicant information if it's not in the response
          if (!updatedInterview.applicantName) {
            updatedInterview.applicantName = state.interviews[index].applicantName;
          }
          
          if (!updatedInterview.jobTitle) {
            updatedInterview.jobTitle = state.interviews[index].jobTitle;
          }
          
          // If the backend returns populated applicant data, extract the name
          if (updatedInterview.applicantId && typeof updatedInterview.applicantId === 'object' && updatedInterview.applicantId.name) {
            updatedInterview = {
              ...updatedInterview,
              applicantName: updatedInterview.applicantId.name,
              jobTitle: updatedInterview.jobId && typeof updatedInterview.jobId === 'object' ? updatedInterview.jobId.title : updatedInterview.jobTitle
            };
          }
          
          // Keep the original ID format to maintain consistency
          updatedInterview._id = state.interviews[index]._id;
          
          console.log('Updated interview in state:', updatedInterview);
          state.interviews[index] = updatedInterview;
        } else {
          console.warn('Interview not found in state, adding as new:', action.payload);
          state.interviews.push(action.payload);
        }
      })
      .addCase(editInterview.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(addInterviewFeedback.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addInterviewFeedback.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Safely handle the case where payload might be undefined
        if (!action.payload) {
          console.warn('No payload received from addInterviewFeedback action');
          return;
        }
        
        // Check if the payload is valid
        if (!action.payload._id) {
          console.error('Invalid payload received from addInterviewFeedback:', action.payload);
          return;
        }
        
        const index = state.interviews.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          // Process the updated interview to ensure it has applicantName and jobTitle
          let updatedInterview = { ...action.payload };
          
          // Preserve the original status if adding feedback changed it
          const originalStatus = state.interviews[index].status;
          if (originalStatus && updatedInterview.status !== originalStatus) {
            console.log(`Preserving original status '${originalStatus}' instead of API's '${updatedInterview.status}'`);
            updatedInterview.status = originalStatus;
          }
          
          // If the backend returns populated applicant data, extract the name
          if (updatedInterview.applicantId && typeof updatedInterview.applicantId === 'object' && updatedInterview.applicantId.name) {
            updatedInterview = {
              ...updatedInterview,
              applicantName: updatedInterview.applicantId.name,
              jobTitle: updatedInterview.jobId && typeof updatedInterview.jobId === 'object' ? updatedInterview.jobId.title : updatedInterview.jobTitle
            };
          }
          
          state.interviews[index] = updatedInterview;
        }
        
        // Also update localStorage for localStorage-based users
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (isLocalStorageUser(user)) {
          try {
            const googleInterviewsJSON = localStorage.getItem('google_user_interviews') || '[]';
            let googleInterviews = JSON.parse(googleInterviewsJSON);
            
            const localIndex = googleInterviews.findIndex(i => i._id === action.payload._id);
            if (localIndex !== -1) {
              // Preserve the original status
              const originalStatus = googleInterviews[localIndex].status;
              
              // Create updated interview with preserved status
              const updatedInterview = {
                ...action.payload,
                status: originalStatus // Keep the original status
              };
              
              googleInterviews[localIndex] = updatedInterview;
              localStorage.setItem('google_user_interviews', JSON.stringify(googleInterviews));
              console.log('Updated localStorage-based user interview feedback in localStorage with preserved status:', originalStatus);
            }
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
      })
      .addCase(addInterviewFeedback.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(deleteInterview.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteInterview.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.interviews = state.interviews.filter(i => i._id !== action.payload)
      })
      .addCase(deleteInterview.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { 
  setInterviewFilter, 
  clearInterviewFilters,
  setInterviews,
  updateInterviewInList
} = interviewsSlice.actions
export default interviewsSlice.reducer

// Selectors
export const selectAllInterviews = (state) => state.interviews.interviews
export const selectInterviewsStatus = (state) => state.interviews.status
export const selectInterviewsError = (state) => state.interviews.error
export const selectInterviewsFilters = (state) => state.interviews.filters

// Selector to get a specific interview by ID
export const selectInterviewById = (state, interviewId) => {
  // First try to get from Redux store
  const interviewFromRedux = state.interviews.interviews.find(interview => 
    interview._id === interviewId || 
    String(interview._id) === String(interviewId) ||
    interview._id?.toString() === interviewId?.toString()
  );
  
  if (interviewFromRedux) {
    return interviewFromRedux;
  }
  
  // If not found in Redux store and user is a localStorage-based user, try localStorage
  const user = state.auth.user;
  if (isLocalStorageUser(user)) {
    try {
      const googleInterviewsJSON = localStorage.getItem('google_user_interviews') || '[]';
      const googleInterviews = JSON.parse(googleInterviewsJSON);
      
      const interviewFromLocalStorage = googleInterviews.find(i => 
        i._id === interviewId || 
        String(i._id) === String(interviewId) ||
        i._id?.toString() === interviewId?.toString()
      );
      
      if (interviewFromLocalStorage) {
        return interviewFromLocalStorage;
      }
    } catch (error) {
      console.error('Error reading interviews from localStorage:', error);
    }
  }
  
  // Not found anywhere
  return null;
}

// Filtered selectors
export const selectFilteredInterviews = (state) => {
  const { interviews, filters } = state.interviews;
  
  // Apply filters to interviews from Redux store only
  let filteredInterviews = [...interviews];
  
  // Apply status filter if set
  if (filters.status && filters.status !== 'all') {
    filteredInterviews = filteredInterviews.filter(
      interview => interview.status === filters.status
    );
  }
  
  // Apply date filter if set
  if (filters.date && filters.date !== 'all') {
    if (filters.date === 'today') {
      const today = dayjs().format('YYYY-MM-DD');
      filteredInterviews = filteredInterviews.filter(interview => 
        dayjs(interview.date).format('YYYY-MM-DD') === today
      );
    } else if (filters.date === 'tomorrow') {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      filteredInterviews = filteredInterviews.filter(interview => 
        dayjs(interview.date).format('YYYY-MM-DD') === tomorrow
      );
    } else if (filters.date === 'thisWeek') {
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      filteredInterviews = filteredInterviews.filter(interview => 
        dayjs(interview.date).isBetween(startOfWeek, endOfWeek, null, '[]')
      );
    } else if (filters.date === 'nextWeek') {
      const startOfNextWeek = dayjs().add(1, 'week').startOf('week');
      const endOfNextWeek = dayjs().add(1, 'week').endOf('week');
      filteredInterviews = filteredInterviews.filter(interview => 
        dayjs(interview.date).isBetween(startOfNextWeek, endOfNextWeek, null, '[]')
      );
    }
  }
  
  return filteredInterviews;
}; 