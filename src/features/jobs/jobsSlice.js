import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { jobsAPI } from '../../utils/api'
import { toast } from 'react-toastify'

// Mock data for jobs
const mockJobs = [
  {
    _id: '1',
    title: 'Senior Frontend Developer',
    description: 'We are looking for an experienced Frontend Developer...',
    location: 'Remote',
    status: 'open',
    department: 'Engineering',
    type: 'Full-time',
    salary: { min: 90000, max: 120000, currency: 'USD' },
    skills: ['React', 'TypeScript', 'Redux'],
    createdAt: '2024-03-10',
    applications: 12,
    postedDate: '2024-03-10',
    closingDate: '2024-04-10'
  },
  {
    _id: '2',
    title: 'Backend Developer',
    description: 'Join our team to build scalable backend services...',
    location: 'Hybrid',
    status: 'open',
    department: 'Engineering',
    type: 'Full-time',
    salary: { min: 85000, max: 110000, currency: 'USD' },
    skills: ['Node.js', 'Express', 'MongoDB'],
    createdAt: '2024-03-08',
    applications: 8,
    postedDate: '2024-03-08',
    closingDate: '2024-04-08'
  },
  {
    _id: '3',
    title: 'UI/UX Designer',
    description: 'Design beautiful and intuitive user interfaces...',
    location: 'Onsite',
    status: 'open',
    department: 'Design',
    type: 'Full-time',
    salary: { min: 75000, max: 95000, currency: 'USD' },
    skills: ['Figma', 'Adobe XD', 'User Research'],
    createdAt: '2024-03-05',
    applications: 15,
    postedDate: '2024-03-05',
    closingDate: '2024-04-05'
  }
];

const initialState = {
  jobs: [],
  job: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    status: 'all',
    location: 'all',
    department: 'all',
    search: ''
  }
}

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      if (user && user.isGoogleUser) {
        console.log('Google user fetching jobs from localStorage');
        
        // Retrieve jobs from localStorage
        const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
        try {
          const googleJobs = JSON.parse(googleJobsJSON);
          
          // If no jobs exist for this Google user, provide demo jobs
          if (googleJobs.length === 0) {
            console.log('No jobs found for Google user, adding demo jobs');
            
            // Use the mock jobs but with Google-specific IDs
            const demoJobs = mockJobs.map(job => ({
              ...job,
              _id: 'google_' + job._id,
              createdByGoogleUser: true
            }));
            
            // Save to localStorage
            localStorage.setItem('google_user_jobs', JSON.stringify(demoJobs));
            
            return demoJobs;
          }
          
          return googleJobs;
        } catch (error) {
          console.error('Error parsing Google user jobs from localStorage:', error);
          return [];
        }
      }
      
      // For regular users, proceed with API call
      try {
        const response = await jobsAPI.getJobs();
        const jobsData = response.data;
        
        // If API returns empty array or error, use mock data
        if (!jobsData || !Array.isArray(jobsData) || jobsData.length === 0) {
          console.log('No jobs from API, using mock data');
          return mockJobs;
        }
        
        return jobsData;
      } catch (error) {
        console.error('Error fetching jobs from API, falling back to mock data:', error);
        return mockJobs;
      }
    } catch (error) {
      toast.error(`Failed to fetch jobs. Using mock data instead.`);
      return mockJobs; // Always fallback to mock data on error
    }
  }
)

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      if (user && user.isGoogleUser) {
        console.log('Google user fetching job by ID from localStorage');
        
        // Get jobs from localStorage
        const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
        
        try {
          const googleJobs = JSON.parse(googleJobsJSON);
          
          // Find the job by ID
          const job = googleJobs.find(job => job._id === id);
          
          if (!job) {
            throw new Error('Job not found');
          }
          
          return job;
        } catch (error) {
          console.error('Error finding job in localStorage:', error);
          return rejectWithValue('Job not found in localStorage');
        }
      }
      
      // For regular users, proceed with API call
      const response = await jobsAPI.getJobById(id);
      return response.data;
    } catch (error) {
      toast.error(`Failed to fetch job details. Please check if the backend server is running.`);
      return rejectWithValue(error.message);
    }
  }
)

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      if (user && user.isGoogleUser) {
        console.log('Google user creating job - saving to localStorage');
        
        // Generate a unique ID for the job
        const newId = 'local_' + Date.now().toString();
        
        // Add metadata to the job
        const newJob = {
          ...jobData,
          _id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Get current jobs from localStorage
        const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
        let googleJobs = [];
        
        try {
          googleJobs = JSON.parse(googleJobsJSON);
          
          // Add the new job
          googleJobs.push(newJob);
          
          // Save back to localStorage
          localStorage.setItem('google_user_jobs', JSON.stringify(googleJobs));
          
          toast.success('Job created successfully!');
          return newJob;
        } catch (error) {
          console.error('Error handling localStorage for job creation:', error);
          toast.error('Failed to create job.');
          return rejectWithValue('Failed to save job to localStorage');
        }
      }
      
      // For regular users, proceed with API call
      const response = await jobsAPI.createJob(jobData);
      toast.success('Job created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create job. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      if (user && user.isGoogleUser) {
        console.log('Google user updating job in localStorage');
        
        // Get current jobs from localStorage
        const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
        
        try {
          const googleJobs = JSON.parse(googleJobsJSON);
          
          // Find the job to update
          const jobIndex = googleJobs.findIndex(job => job._id === id);
          
          if (jobIndex === -1) {
            throw new Error('Job not found');
          }
          
          // Update the job
          const updatedJob = {
            ...googleJobs[jobIndex],
            ...jobData,
            updatedAt: new Date().toISOString()
          };
          
          googleJobs[jobIndex] = updatedJob;
          
          // Save back to localStorage
          localStorage.setItem('google_user_jobs', JSON.stringify(googleJobs));
          
          toast.success('Job updated successfully!');
          return updatedJob;
        } catch (error) {
          console.error('Error updating job in localStorage:', error);
          toast.error('Failed to update job.');
          return rejectWithValue('Failed to update job in localStorage');
        }
      }
      
      // For regular users, proceed with API call
      const response = await jobsAPI.updateJob(id, jobData);
      toast.success('Job updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update job. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Check if user is a Google user
      const state = getState();
      const user = state.auth.user;
      
      if (user && user.isGoogleUser) {
        console.log('Google user deleting job from localStorage');
        
        // Get current jobs from localStorage
        const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
        
        try {
          let googleJobs = JSON.parse(googleJobsJSON);
          
          // Filter out the job to delete
          googleJobs = googleJobs.filter(job => job._id !== id);
          
          // Save back to localStorage
          localStorage.setItem('google_user_jobs', JSON.stringify(googleJobs));
          
          toast.success('Job deleted successfully!');
          return id;
        } catch (error) {
          console.error('Error deleting job from localStorage:', error);
          toast.error('Failed to delete job.');
          return rejectWithValue('Failed to delete job from localStorage');
        }
      }
      
      // For regular users, proceed with API call
      await jobsAPI.deleteJob(id);
      toast.success('Job deleted successfully!');
      return id;
    } catch (error) {
      toast.error('Failed to delete job. Please check if the backend server is running.');
      return rejectWithValue(error.message);
    }
  }
)

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobFilter: (state, action) => {
      console.log('Setting job filter:', action.payload);
      console.log('Current filters:', state.filters);
      
      // Check if we're setting a filter with a key-value pair
      if (Object.keys(action.payload).length === 1) {
        const key = Object.keys(action.payload)[0];
        const value = action.payload[key];
        
        // Update just that specific filter
        state.filters[key] = value;
      } else {
        // Update all filters
        state.filters = { ...state.filters, ...action.payload };
      }
      
      console.log('Updated filters:', state.filters);
    },
    clearJobFilters: (state) => {
      state.filters = { status: 'all', location: 'all', department: 'all', search: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        console.log('Fetched jobs:', action.payload);
        
        // Log each job's status
        action.payload.forEach(job => {
          console.log(`Job ${job.title} has status: ${job.status}`);
        });
        
        state.jobs = action.payload
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchJobById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.job = action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createJob.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.jobs.push(action.payload)
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateJob.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.jobs.findIndex(job => job._id === action.payload._id)
        if (index !== -1) {
          state.jobs[index] = action.payload
        }
        if (state.job && state.job._id === action.payload._id) {
          state.job = action.payload
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(deleteJob.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.jobs = state.jobs.filter(job => job._id !== action.payload)
        if (state.job && state.job._id === action.payload) {
          state.job = null
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { setJobFilter, clearJobFilters } = jobsSlice.actions
export default jobsSlice.reducer

// Selectors
export const selectAllJobs = (state) => state.jobs.jobs
export const selectJobById = (state, jobId) => 
  state.jobs.jobs.find(job => job._id === jobId)
export const selectJobsStatus = (state) => state.jobs.status
export const selectJobsError = (state) => state.jobs.error
export const selectJobFilters = (state) => state.jobs.filters

// Filtered selectors
export const selectFilteredJobs = (state) => {
  const { status, location, department, search } = state.jobs.filters;
  console.log('Filtering jobs with filters:', state.jobs.filters);
  console.log('Available jobs before filtering:', state.jobs.jobs);
  
  // Check if we have any jobs to filter
  if (!state.jobs.jobs || state.jobs.jobs.length === 0) {
    return [];
  }
  
  const filteredJobs = state.jobs.jobs.filter(job => {
    // Make sure job is defined
    if (!job) {
      return false;
    }
    
    // Filter by status
    if (status !== 'all') {
      console.log(`Checking job ${job.title} with status ${job.status} against filter ${status}`);
      if (job.status !== status) {
        console.log(`Job ${job.title} has status ${job.status}, filter wants ${status} - excluding`);
        return false;
      }
    }
    
    // Filter by location
    if (location !== 'all' && job.location && job.location.toLowerCase() !== location.toLowerCase()) {
      return false;
    }
    
    // Filter by department
    if (department !== 'all' && job.department !== department) {
      return false;
    }
    
    // Filter by search term
    if (search && job.title && !job.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  console.log('Filtered jobs:', filteredJobs);
  return filteredJobs;
} 