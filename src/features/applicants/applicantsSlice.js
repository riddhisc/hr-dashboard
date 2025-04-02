import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { applicantsAPI } from '../../utils/api'
import { toast } from 'react-toastify'

// Load applicants from localStorage if available
const loadApplicantsFromStorage = () => {
  try {
    // Get applicants from both storage locations
    const storedApplicants = localStorage.getItem('applicants')
    const googleApplicantsJSON = localStorage.getItem('google_user_applicants')
    
    let applicants = []
    let googleApplicants = []
    
    if (storedApplicants) {
      applicants = JSON.parse(storedApplicants)
      console.log('Loaded applicants from localStorage:', applicants.length)
    }
    
    if (googleApplicantsJSON) {
      googleApplicants = JSON.parse(googleApplicantsJSON)
      console.log('Loaded google_user_applicants from localStorage:', googleApplicants.length)
    }
    
    // Merge both sets of applicants, avoiding duplicates
    const mergedApplicants = [...applicants]
    
    googleApplicants.forEach(googleApplicant => {
      if (!mergedApplicants.some(app => app._id === googleApplicant._id)) {
        mergedApplicants.push(googleApplicant)
      }
    })
    
    console.log('Total merged applicants:', mergedApplicants.length)
    
    // Ensure both storage locations are in sync for future loads
    if (mergedApplicants.length > 0) {
      localStorage.setItem('applicants', JSON.stringify(mergedApplicants))
      localStorage.setItem('google_user_applicants', JSON.stringify(mergedApplicants))
    }
    
    return mergedApplicants
  } catch (error) {
    console.error('Error loading applicants from localStorage:', error)
    return []
  }
}

// Mock data for applicants
const mockApplicants = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    status: 'shortlisted',
    source: 'linkedin',
    resumeUrl: '/resumes/john-doe-resume.pdf',
    appliedDate: '2024-03-01',
    notes: 'Strong React experience, good cultural fit',
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    status: 'interview',
    source: 'indeed',
    resumeUrl: '/resumes/jane-smith-resume.pdf',
    appliedDate: '2024-03-02',
    notes: 'Excellent portfolio, 5 years of experience',
  },
  {
    _id: '3',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '(555) 456-7890',
    jobId: '2',
    jobTitle: 'Backend Developer',
    status: 'pending',
    source: 'company',
    resumeUrl: '/resumes/michael-johnson-resume.pdf',
    appliedDate: '2024-03-05',
    notes: '',
  },
  {
    _id: '4',
    name: 'Emily Williams',
    email: 'emily.w@example.com',
    phone: '(555) 234-5678',
    jobId: '2',
    jobTitle: 'Backend Developer',
    status: 'rejected',
    source: 'linkedin',
    resumeUrl: '/resumes/emily-williams-resume.pdf',
    appliedDate: '2024-03-03',
    notes: 'Not enough experience with our tech stack',
  },
  {
    _id: '5',
    name: 'David Brown',
    email: 'david.b@example.com',
    phone: '(555) 876-5432',
    jobId: '3',
    jobTitle: 'UI/UX Designer',
    status: 'hired',
    source: 'indeed',
    resumeUrl: '/resumes/david-brown-resume.pdf',
    appliedDate: '2024-02-15',
    notes: 'Outstanding portfolio, great communication skills',
  }
];

const initialState = {
  applicants: loadApplicantsFromStorage(),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    status: 'all', // 'all' | 'pending' | 'shortlisted' | 'interview' | 'hired' | 'rejected'
    jobId: 'all',
    source: 'all', // 'all' | 'linkedin' | 'indeed' | 'company' | 'referral' | 'other'
    search: '',
    applicationCategory: 'all' // 'all' | 'specific-job' | 'general'
  },
  // Add a lastSync timestamp to track when data was last synchronized
  lastSync: Date.now()
}

// Helper function to save applicants to localStorage
const saveApplicantsToStorage = (applicants) => {
  try {
    localStorage.setItem('applicants', JSON.stringify(applicants))
    
    // Also sync with google_user_applicants to ensure data persistence
    // This is necessary because the app sometimes loads from google_user_applicants instead
    const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]'
    let googleApplicants = []
    try {
      googleApplicants = JSON.parse(googleApplicantsJSON)
      
      // Merge the applicants, preserving Google-specific entries
      // and updating existing entries with the same ID
      const mergedApplicants = [...googleApplicants]
      
      applicants.forEach(applicant => {
        const existingIndex = mergedApplicants.findIndex(a => a._id === applicant._id)
        if (existingIndex >= 0) {
          mergedApplicants[existingIndex] = applicant
        } else if (!mergedApplicants.some(a => a._id === applicant._id)) {
          mergedApplicants.push(applicant)
        }
      })
      
      // Save the merged applicants back to google_user_applicants
      localStorage.setItem('google_user_applicants', JSON.stringify(mergedApplicants))
      console.log('Successfully synced applicants with google_user_applicants')
    } catch (error) {
      console.error('Error syncing with google_user_applicants:', error)
      // If the sync fails, at least ensure the basic applicants are saved
      localStorage.setItem('google_user_applicants', JSON.stringify(applicants))
    }
  } catch (error) {
    console.error('Error saving applicants to localStorage:', error)
  }
}

// Async thunks
export const fetchApplicants = createAsyncThunk(
  'applicants/fetchApplicants',
  async (_, { rejectWithValue, getState }) => {
    // Check if user is a Google user
    const state = getState();
    const user = state.auth.user;
    
    // Get applicants from both storage locations to ensure we have all data
    const regularApplicantsJSON = localStorage.getItem('applicants') || '[]';
    const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]';
    
    let regularApplicants = [];
    let googleApplicants = [];
    
    try {
      regularApplicants = JSON.parse(regularApplicantsJSON);
      googleApplicants = JSON.parse(googleApplicantsJSON);
      console.log('Local cache check - Regular applicants:', regularApplicants.length);
      console.log('Local cache check - Google applicants:', googleApplicants.length);
    } catch (error) {
      console.error('Error parsing applicants from localStorage:', error);
    }
    
    if (user && user.isGoogleUser) {
      console.log('Google user detected, checking both applicant sources');
      
      // Merge both sets of applicants for Google users
      const mergedApplicants = [...googleApplicants];
      
      // Add any regular applicants not already in the Google applicants
      regularApplicants.forEach(regularApp => {
        if (!mergedApplicants.some(app => app._id === regularApp._id)) {
          mergedApplicants.push(regularApp);
        }
      });
      
      console.log('Returning merged applicants for Google user:', mergedApplicants.length);
      
      // Sync the storage for future use
      if (mergedApplicants.length > 0) {
        localStorage.setItem('google_user_applicants', JSON.stringify(mergedApplicants));
        localStorage.setItem('applicants', JSON.stringify(mergedApplicants));
      }
      
      return mergedApplicants;
    }
    
    try {
      console.log('Fetching applicants from backend...');
      const response = await applicantsAPI.getApplicants();
      console.log('Applicants response from backend:', response.data);
      
      let backendApplicants = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        console.log('Backend returned array of applicants');
        backendApplicants = response.data;
      } else if (response.data && response.data.applicants) {
        console.log('Backend returned paginated response with applicants property');
        backendApplicants = response.data.applicants;
      } else {
        console.error('Unexpected response format from backend:', response.data);
        toast.error('Received unexpected data format from server');
        // Fall back to using localStorage data
        return [...regularApplicants, ...googleApplicants.filter(ga => 
          !regularApplicants.some(ra => ra._id === ga._id)
        )];
      }
      
      // Merge backend data with locally saved data (for applicants created in offline mode)
      const mergedApplicants = [...backendApplicants];
      
      // Add locally created applicants that aren't in the backend response
      const localApplicants = [...regularApplicants, ...googleApplicants];
      localApplicants.forEach(localApp => {
        if (localApp._id.startsWith('local_') || localApp._id.startsWith('google_')) {
          if (!mergedApplicants.some(app => app._id === localApp._id)) {
            mergedApplicants.push(localApp);
          }
        }
      });
      
      return mergedApplicants;
    } catch (error) {
      console.error('Error fetching applicants from backend:', error);
      toast.error('Failed to fetch applicants. Using local data.');
      
      // Return merged local data if backend fails
      return [...regularApplicants, ...googleApplicants.filter(ga => 
        !regularApplicants.some(ra => ra._id === ga._id)
      )];
    }
  }
)

// New thunk to fetch applicants with filters
export const fetchApplicantsWithFilters = createAsyncThunk(
  'applicants/fetchApplicantsWithFilters',
  async (filters, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      const allApplicants = state.applicants.applicants || [];
      
      if (user && user.isGoogleUser) {
        console.log('Google user filtering applicants from localStorage');
        
        // Get Google user applicants from localStorage
        const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]';
        let googleApplicants = [];
        
        try {
          googleApplicants = JSON.parse(googleApplicantsJSON);
          
          // Apply filters locally
          let filteredApplicants = [...googleApplicants];
          
          // Status filter
          if (filters.status && filters.status !== 'all') {
            filteredApplicants = filteredApplicants.filter(app => app.status === filters.status);
          }
          
          // Source filter
          if (filters.source && filters.source !== 'all') {
            filteredApplicants = filteredApplicants.filter(app => app.source === filters.source);
          }
          
          // Job filter (including other and general)
          if (filters.jobId && filters.jobId !== 'all') {
            if (filters.jobId === 'general') {
              // General applications have jobId set to 'general' or applicationCategory is 'general'
              filteredApplicants = filteredApplicants.filter(app => 
                app.jobId === 'general' || 
                app.applicationCategory === 'general'
              );
            } else if (filters.jobId === 'other') {
              // Custom/other jobs have jobId set to 'other'
              filteredApplicants = filteredApplicants.filter(app => 
                app.jobId === 'other'
              );
            } else {
              // Specific job filter - match exact jobId
              filteredApplicants = filteredApplicants.filter(app => app.jobId === filters.jobId);
            }
          }
          
          // Application Category filter - Only apply if explicitly set (for backward compatibility)
          if (filters.applicationCategory && filters.applicationCategory !== 'all') {
            if (filters.applicationCategory === 'general') {
              // General applications have jobId set to 'general' or null
              filteredApplicants = filteredApplicants.filter(app => 
                app.jobId === 'general' || 
                app.applicationCategory === 'general' ||
                !app.jobId
              );
            } else if (filters.applicationCategory === 'specific-job') {
              // Specific job applications have valid jobId that's not 'general'
              filteredApplicants = filteredApplicants.filter(app => 
                app.jobId && 
                app.jobId !== 'general' && 
                app.applicationCategory !== 'general'
              );
            }
          }
          
          // Search term
          if (filters.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.toLowerCase();
            filteredApplicants = filteredApplicants.filter(app => 
              (app.name && app.name.toLowerCase().includes(searchTerm)) ||
              (app.email && app.email.toLowerCase().includes(searchTerm)) ||
              (app.jobTitle && app.jobTitle.toLowerCase().includes(searchTerm))
            );
          }
          
          console.log('Filtered Google user applicants:', filteredApplicants);
          return filteredApplicants;
        } catch (error) {
          console.error('Error parsing Google user applicants from localStorage:', error);
          return [];
        }
      }
      
      console.log('Fetching applicants with filters from backend:', filters);
      
      // Check if we're filtering by special values (other, general) which may not be supported by backend
      const useLocalFiltering = filters.jobId === 'other' || filters.jobId === 'general';
      
      if (useLocalFiltering) {
        try {
          // Only include non-'all' filters in the query
          const queryParams = {};
          if (filters.status && filters.status !== 'all') queryParams.status = filters.status;
          // Exclude jobId if it's 'other' or 'general' since backend might not support it
          if (filters.source && filters.source !== 'all') queryParams.source = filters.source;
          // Add search parameter to backend queries
          if (filters.search && filters.search.trim() !== '') queryParams.search = filters.search.trim();
          
          console.log('Query params for backend (excluding special jobId):', queryParams);
          
          const response = await applicantsAPI.getApplicantsWithFilters(queryParams);
          console.log('Filtered applicants response from backend:', response.data);
          
          let backendApplicants = [];
          // Handle different response formats
          if (Array.isArray(response.data)) {
            backendApplicants = response.data;
          } else if (response.data && response.data.applicants) {
            backendApplicants = response.data.applicants;
          }
          
          // Now apply the special jobId filter on the client side
          let filteredApplicants = [...backendApplicants];
          
          if (filters.jobId === 'general') {
            filteredApplicants = filteredApplicants.filter(app => 
              app.jobId === 'general' || 
              app.applicationCategory === 'general'
            );
          } else if (filters.jobId === 'other') {
            filteredApplicants = filteredApplicants.filter(app => 
              app.jobId === 'other'
            );
          }
          
          return filteredApplicants;
        } catch (error) {
          console.error('Error with partial backend filtering, falling back to full client filtering:', error);
          // Fall back to full client-side filtering
          let filteredApplicants = [...allApplicants];
          
          // Apply all filters client-side
          if (filters.status && filters.status !== 'all') {
            filteredApplicants = filteredApplicants.filter(app => app.status === filters.status);
          }
          
          if (filters.source && filters.source !== 'all') {
            filteredApplicants = filteredApplicants.filter(app => app.source === filters.source);
          }
          
          if (filters.jobId && filters.jobId !== 'all') {
            if (filters.jobId === 'general') {
              filteredApplicants = filteredApplicants.filter(app => 
                app.jobId === 'general' || 
                app.applicationCategory === 'general'
              );
            } else if (filters.jobId === 'other') {
              filteredApplicants = filteredApplicants.filter(app => 
                app.jobId === 'other'
              );
            } else {
              filteredApplicants = filteredApplicants.filter(app => app.jobId === filters.jobId);
            }
          }
          
          if (filters.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.toLowerCase();
            filteredApplicants = filteredApplicants.filter(app => 
              (app.name && app.name.toLowerCase().includes(searchTerm)) ||
              (app.email && app.email.toLowerCase().includes(searchTerm)) ||
              (app.jobTitle && app.jobTitle.toLowerCase().includes(searchTerm))
            );
          }
          
          toast.warning('Using local filtering due to server issues with special filters.');
          return filteredApplicants;
        }
      }
      
      // Standard approach - backend filtering for regular filters
      // Only include non-'all' filters in the query
      const queryParams = {};
      if (filters.status && filters.status !== 'all') queryParams.status = filters.status;
      if (filters.jobId && filters.jobId !== 'all') queryParams.jobId = filters.jobId;
      if (filters.source && filters.source !== 'all') queryParams.source = filters.source;
      // Add applicationCategory filter to backend queries
      if (filters.applicationCategory && filters.applicationCategory !== 'all') {
        queryParams.applicationCategory = filters.applicationCategory;
      }
      // Add search parameter to backend queries
      if (filters.search && filters.search.trim() !== '') queryParams.search = filters.search.trim();
      
      console.log('Query params for backend:', queryParams);
      
      const response = await applicantsAPI.getApplicantsWithFilters(queryParams);
      console.log('Filtered applicants response from backend:', response.data);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.applicants) {
        return response.data.applicants;
      } else {
        console.error('Unexpected response format from backend:', response.data);
        toast.error('Received unexpected data format from server');
        return [];
      }
    } catch (error) {
      console.error('Error fetching filtered applicants from backend:', error);
      toast.error('Failed to fetch filtered applicants.');
      return rejectWithValue(error.message);
    }
  }
)

export const fetchApplicantById = createAsyncThunk(
  'applicants/fetchApplicantById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await applicantsAPI.getApplicantById(id);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch applicant details. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

export const fetchApplicantsByJobId = createAsyncThunk(
  'applicants/fetchApplicantsByJobId',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await applicantsAPI.getApplicantsByJobId(jobId);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch applicants for this job. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

export const createApplicant = createAsyncThunk(
  'applicants/createApplicant',
  async (applicantData, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      // Process applicationCategory
      const isGeneralApplication = applicantData.applicationCategory === 'general';
      
      // For general applications, we need to ensure we don't require a specific jobId
      const processedData = { ...applicantData };
      
      // If it's a general application and no jobTitle is provided, add a default
      if (isGeneralApplication) {
        if (!processedData.jobTitle) {
          processedData.jobTitle = 'General Application';
        }
        // For general applications, we set jobId to 'general' if not provided
        if (!processedData.jobId) {
          processedData.jobId = 'general';
        }
      }
      
      if (user && user.isGoogleUser) {
        console.log('Google user creating an applicant, saving to local storage');
        
        // Generate a unique ID for the new applicant
        const newId = 'google_' + Date.now().toString();
        
        // Create a new applicant object with the ID
        const newApplicant = {
          ...processedData,
          _id: newId,
          // Add a flag to mark this as created by a Google user
          createdByGoogleUser: true,
          // Add creation date
          createdAt: new Date().toISOString()
        };
        
        // Get existing Google user applicants from localStorage
        const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]';
        const googleApplicants = JSON.parse(googleApplicantsJSON);
        
        // Add the new applicant
        googleApplicants.push(newApplicant);
        
        // Save back to localStorage
        localStorage.setItem('google_user_applicants', JSON.stringify(googleApplicants));
        
        toast.success('Applicant created successfully!');
        return newApplicant;
      }
      
      console.log('Creating applicant with data:', JSON.stringify(processedData));
      
      // Check if resume is included in applicantData when not a FormData
      if (!(processedData instanceof FormData) && !processedData.resumeUrl) {
        console.warn('No resume URL provided. Using a fallback URL.');
        processedData.resumeUrl = '/dummy-resume.pdf';
      }
      
      try {
      // For non-Google users, proceed with API call
        const response = await applicantsAPI.createApplicant(processedData);
      toast.success('Applicant created successfully!');
      return response.data;
      } catch (apiError) {
        console.error('API error creating applicant:', apiError);
        
        // If backend fails, fall back to localStorage as a last resort
        toast.warning('Server error - saving applicant locally as fallback');
        
        // Generate a unique ID for the new applicant
        const newId = 'local_' + Date.now().toString();
        
        // If applicantData is FormData, extract data from it
        let finalData = processedData;
        if (processedData instanceof FormData) {
          console.log('Converting FormData to regular object for local storage');
          finalData = {};
          for (const [key, value] of processedData.entries()) {
            // Skip the resume file
            if (key !== 'resume') {
              // Try to parse JSON if the value is a stringified object
              try {
                if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                  finalData[key] = JSON.parse(value);
                } else {
                  finalData[key] = value;
                }
              } catch (e) {
                finalData[key] = value;
              }
            }
          }
          // Add a placeholder resumeUrl
          finalData.resumeUrl = '/dummy-resume.pdf';
          console.log('Converted applicant data:', finalData);
        }
        
        // Create a new applicant object with the ID
        const newApplicant = {
          ...finalData,
          _id: newId,
          createdAt: new Date().toISOString(),
          // Add flag to indicate this was saved locally due to backend error
          savedLocally: true
        };
        
        // Get existing applicants from localStorage
        const localApplicantsJSON = localStorage.getItem('applicants') || '[]';
        const localApplicants = JSON.parse(localApplicantsJSON);
        
        // Add the new applicant
        localApplicants.push(newApplicant);
        
        // Save back to localStorage
        localStorage.setItem('applicants', JSON.stringify(localApplicants));
        
        // Also save to google_user_applicants to ensure it shows up
        const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]';
        const googleApplicants = JSON.parse(googleApplicantsJSON);
        googleApplicants.push(newApplicant);
        localStorage.setItem('google_user_applicants', JSON.stringify(googleApplicants));
        
        return newApplicant;
      }
    } catch (error) {
      console.error('Fatal error in createApplicant thunk:', error);
      toast.error('Failed to create applicant: ' + (error.message || 'Unknown error'));
      return rejectWithValue(error.message || 'Unknown error occurred');
    }
  }
)

export const updateApplicantStatus = createAsyncThunk(
  'applicants/updateApplicantStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      if (user && user.isGoogleUser) {
        console.log('Google user updating applicant status in localStorage');
        
        // Get Google user applicants from localStorage
        const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]';
        let googleApplicants = [];
        
        try {
          googleApplicants = JSON.parse(googleApplicantsJSON);
          
          // Find the applicant to update
          const applicantIndex = googleApplicants.findIndex(app => app._id === id);
          
          if (applicantIndex === -1) {
            throw new Error('Applicant not found');
          }
          
          // Update the status
          const updatedApplicant = {
            ...googleApplicants[applicantIndex],
            status,
            updatedAt: new Date().toISOString()
          };
          
          // Replace the applicant in the array
          googleApplicants[applicantIndex] = updatedApplicant;
          
          // Save back to localStorage
          localStorage.setItem('google_user_applicants', JSON.stringify(googleApplicants));
          
          toast.success('Applicant status updated successfully!');
          return updatedApplicant;
        } catch (error) {
          console.error('Error updating Google user applicant status:', error);
          toast.error('Failed to update applicant status');
          return rejectWithValue(error.message);
        }
      }
      
      // For non-Google users, proceed with API call
      const response = await applicantsAPI.updateApplicantStatus(id, { status });
      toast.success('Applicant status updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update applicant status. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

export const addApplicantNote = createAsyncThunk(
  'applicants/addApplicantNote',
  async ({ id, note }, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      if (user && user.isGoogleUser) {
        console.log('Google user adding note to applicant in localStorage');
        
        // Get Google user applicants from localStorage
        const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]';
        let googleApplicants = [];
        
        try {
          googleApplicants = JSON.parse(googleApplicantsJSON);
          
          // Find the applicant to update
          const applicantIndex = googleApplicants.findIndex(app => app._id === id);
          
          if (applicantIndex === -1) {
            throw new Error('Applicant not found');
          }
          
          // Update the notes
          const currentNotes = googleApplicants[applicantIndex].notes || '';
          const updatedNotes = currentNotes ? `${currentNotes}\n\n${note}` : note;
          
          const updatedApplicant = {
            ...googleApplicants[applicantIndex],
            notes: updatedNotes,
            updatedAt: new Date().toISOString()
          };
          
          // Replace the applicant in the array
          googleApplicants[applicantIndex] = updatedApplicant;
          
          // Save back to localStorage
          localStorage.setItem('google_user_applicants', JSON.stringify(googleApplicants));
          
          toast.success('Note added successfully!');
          return updatedApplicant;
        } catch (error) {
          console.error('Error adding note to Google user applicant:', error);
          toast.error('Failed to add note');
          return rejectWithValue(error.message);
        }
      }
      
      // For non-Google users, proceed with API call
      const response = await applicantsAPI.addApplicantNote(id, { note });
      toast.success('Note added successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add note. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

export const deleteApplicant = createAsyncThunk(
  'applicants/deleteApplicant',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user or if the id starts with 'google_' or 'local_'
      const state = getState();
      const user = state.auth.user;
      const isLocalId = id.startsWith('google_') || id.startsWith('local_');
      
      if ((user && user.isGoogleUser) || isLocalId) {
        console.log('Deleting applicant from localStorage:', id);
        
        // Handle both storage locations for consistent deletion
        const storageLocations = ['google_user_applicants', 'applicants'];
        
        for (const location of storageLocations) {
          try {
            const applicantsJSON = localStorage.getItem(location) || '[]';
            const applicants = JSON.parse(applicantsJSON);
            
            // Filter out the applicant to delete
            const filteredApplicants = applicants.filter(app => app._id !== id);
            
            // Save back to localStorage
            localStorage.setItem(location, JSON.stringify(filteredApplicants));
          } catch (error) {
            console.error(`Error deleting applicant from ${location}:`, error);
          }
        }
        
        toast.success('Applicant deleted successfully!');
        return id;
      }
      
      // For non-Google users with server-side IDs, proceed with API call
    try {
      await applicantsAPI.deleteApplicant(id);
      toast.success('Applicant deleted successfully!');
      return id;
    } catch (error) {
        // If we get a 404 error, it means the applicant doesn't exist anymore
        // Consider this a success case since the end result is the same (applicant is gone)
        if (error.response && error.response.status === 404) {
          console.log(`Applicant ${id} not found - already deleted, treating as success`);
          toast.success('Applicant deleted successfully!');
          return id;
        }
        // For other errors, reject with the error message
        throw error;
      }
    } catch (error) {
      console.error('Error deleting applicant:', error);
      toast.error('Failed to delete applicant. Check if the backend server is running.');
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
)

const applicantsSlice = createSlice({
  name: 'applicants',
  initialState,
  reducers: {
    setApplicantFilter: (state, action) => {
      console.log('Setting applicant filter:', action.payload);
      // Ensure we don't override the entire filters object
      state.filters = {
        ...state.filters,
        ...action.payload,
        // Ensure filter values are strings
        status: String(action.payload.status || state.filters.status),
        jobId: String(action.payload.jobId || state.filters.jobId),
        source: String(action.payload.source || state.filters.source),
        search: action.payload.search || state.filters.search
      };
      console.log('Updated filters:', state.filters);
    },
    clearApplicantFilters: (state) => {
      console.log('Clearing applicant filters');
      state.filters = {
        status: 'all',
        jobId: 'all',
        source: 'all',
        search: '',
        applicationCategory: 'all'
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicants.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchApplicants.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.applicants = action.payload
        saveApplicantsToStorage(action.payload)
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchApplicantsWithFilters.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchApplicantsWithFilters.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.applicants = action.payload
      })
      .addCase(fetchApplicantsWithFilters.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchApplicantById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchApplicantById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const existingIndex = state.applicants.findIndex(
          applicant => applicant._id === action.payload._id
        )
        if (existingIndex >= 0) {
          state.applicants[existingIndex] = action.payload
        } else {
          state.applicants.push(action.payload)
        }
      })
      .addCase(fetchApplicantById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchApplicantsByJobId.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchApplicantsByJobId.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const existingIds = state.applicants.map(app => app._id)
        const newApplicants = action.payload.filter(app => !existingIds.includes(app._id))
        state.applicants = [...state.applicants, ...newApplicants]
      })
      .addCase(fetchApplicantsByJobId.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createApplicant.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createApplicant.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.applicants.push(action.payload)
        saveApplicantsToStorage(state.applicants)
      })
      .addCase(createApplicant.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateApplicantStatus.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateApplicantStatus.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.applicants.findIndex(
          applicant => applicant._id === action.payload._id
        )
        if (index !== -1) {
          state.applicants[index] = action.payload
          saveApplicantsToStorage(state.applicants)
        }
      })
      .addCase(updateApplicantStatus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(addApplicantNote.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addApplicantNote.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.applicants.findIndex(
          applicant => applicant._id === action.payload._id
        )
        if (index !== -1) {
          state.applicants[index] = action.payload
          saveApplicantsToStorage(state.applicants)
        }
      })
      .addCase(addApplicantNote.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(deleteApplicant.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteApplicant.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.applicants = state.applicants.filter(
          applicant => applicant._id !== action.payload
        )
        saveApplicantsToStorage(state.applicants)
      })
      .addCase(deleteApplicant.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { setApplicantFilter, clearApplicantFilters } = applicantsSlice.actions
export default applicantsSlice.reducer

// Selectors
export const selectAllApplicants = (state) => {
  console.log('selectAllApplicants state:', state);
  return state.applicants.applicants || [];
}

export const selectApplicantById = (state, applicantId) => 
  state.applicants.applicants.find(applicant => applicant._id === applicantId)

export const selectApplicantsByJobId = (state, jobId) => 
  state.applicants.applicants.filter(applicant => applicant.jobId === jobId)

export const selectApplicantsStatus = (state) => state.applicants.status
export const selectApplicantsError = (state) => state.applicants.error
export const selectApplicantsFilters = (state) => state.applicants.filters

// Filtered selectors
export const selectFilteredApplicants = (state) => {
  // Since we're now filtering on the backend, we can just return all applicants
  // The filtering is done when we fetch the data with fetchApplicantsWithFilters
  const allApplicants = selectAllApplicants(state);
  console.log('selectFilteredApplicants called, filters:', state.applicants.filters);
  console.log('All applicants from redux store:', allApplicants.length);
  
  // Log details of first few applicants for debugging
  if (allApplicants.length > 0) {
    console.log('Sample applicants:', allApplicants.slice(0, 2).map(a => ({
      _id: a._id,
      name: a.name,
      email: a.email,
      jobTitle: a.jobTitle,
      status: a.status
    })));
  } else {
    console.warn('No applicants found in store!');
    
    // Check localStorage directly as a backup
    try {
      const applicantsJSON = localStorage.getItem('applicants');
      const googleApplicantsJSON = localStorage.getItem('google_user_applicants');
      console.log('Checking localStorage directly:');
      console.log('- applicants:', applicantsJSON ? JSON.parse(applicantsJSON).length : 0);
      console.log('- google_user_applicants:', googleApplicantsJSON ? JSON.parse(googleApplicantsJSON).length : 0);
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
  }

  if (!Array.isArray(allApplicants)) {
    console.warn('allApplicants is not an array:', allApplicants);
    return [];
  }

  return allApplicants;
} 