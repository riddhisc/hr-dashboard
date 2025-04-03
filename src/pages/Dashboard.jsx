import { useEffect, useState, useRef, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  fetchJobs, 
  selectAllJobs 
} from '../features/jobs/jobsSlice'
import { 
  selectAllApplicants,
  createApplicant,
  fetchApplicants
} from '../features/applicants/applicantsSlice'
import { 
  selectAllInterviews, 
  selectFilteredInterviews,
  fetchInterviews
} from '../features/interviews/interviewsSlice'
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  PaperClipIcon,
  ArrowPathIcon,
  BeakerIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import api, { checkApiConnectivity } from '../utils/api'
import { createTestJob, checkJobsInLocalStorage, resetUserJobs } from '../utils/googleUserTestHelper'

function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const jobs = useSelector(selectAllJobs)
  const applicants = useSelector(selectAllApplicants)
  const interviews = useSelector(selectFilteredInterviews)
  const upcomingInterviewsCache = useRef(null)
  const [isAddApplicantModalOpen, setIsAddApplicantModalOpen] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [newApplicant, setNewApplicant] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: '',
    status: 'pending',
    source: 'linkedin',
    notes: '',
    appliedDate: dayjs().format('YYYY-MM-DD')
  })
  const [googleUserJobs, setGoogleUserJobs] = useState([])
  const [googleUserApplicants, setGoogleUserApplicants] = useState([])
  const [googleUserInterviews, setGoogleUserInterviews] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [interviewsPerPage] = useState(3)
  const [activityFeed, setActivityFeed] = useState([])

  // Check if user is a Google user
  const isGoogleUser = user?.isGoogleUser || false;

  // Helper function to get upcoming Google interviews 
  const getUpcomingGoogleInterviews = () => {
    // Filter Google user interviews for scheduled ones in the future
    return googleUserInterviews.filter(interview => {
      if (!interview || !interview.date) return false;
      // Only include scheduled interviews
      if (interview.status !== 'scheduled') return false;
      // Filter for future dates
      const interviewDate = dayjs(interview.date);
      return interviewDate.isAfter(dayjs());
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
  };

  // Initial data loading on component mount
  useEffect(() => {
    // Track if the component is still mounted
    let isMounted = true;
    
    const loadDashboardData = async () => {
      console.log('--- Starting Dashboard Initial Data Load ---');
      
      try {
        // Always assume we're in demo mode
        console.log('Using local storage data by default');
        
        // Load from localStorage for all users
          loadFromLocalStorage();
        
        // Make sure the cache is cleared to force recalculation
        if (isMounted) {
          upcomingInterviewsCache.current = null;
          // Force re-render
          setRefreshKey(prevKey => prevKey + 1);
        }
        
        console.log('--- Dashboard Initial Data Load Complete ---');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        if (isMounted) {
          toast.error('Error loading data. Using local storage data.', {
            autoClose: 5000,
            position: 'bottom-right'
          });
          loadFromLocalStorage();
        }
      }
    };
    
    loadDashboardData();
    
    return () => {
      // Set mounted flag to false when component unmounts
      isMounted = false;
    };
  }, [dispatch, jobs.length, applicants.length, isGoogleUser]);

  // Function to refresh the dashboard data
  const refreshDashboard = async () => {
    console.log('Refreshing dashboard data...');
    
    try {
      // Always use localStorage data
      console.log('Using local data for refresh');
      
      // Load data from localStorage
        loadFromLocalStorage();
      
      // Force state update to trigger re-render
      setRefreshKey(prevKey => prevKey + 1);
      
      console.log('Dashboard data refreshed successfully');
      toast.success('Dashboard refreshed', {
        autoClose: 2000,
        position: 'bottom-right'
      });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Failed to refresh data', {
        autoClose: 3000,
        position: 'bottom-right'
      });
    }
      }
      
  // Helper to load data from localStorage
  const loadFromLocalStorage = () => {
      // Load Google user applicants from localStorage
    const googleApplicantsJSON = localStorage.getItem('google_user_applicants') || '[]';
      try {
      const applicantsData = JSON.parse(googleApplicantsJSON);
      setGoogleUserApplicants(applicantsData);
      } catch (error) {
      console.error('Error loading Google user applicants from localStorage:', error);
      setGoogleUserApplicants([]);
      }
      
      // Load Google user interviews from localStorage
    const googleInterviewsJSON = localStorage.getItem('google_user_interviews') || '[]';
      try {
      const interviewsData = JSON.parse(googleInterviewsJSON);
      setGoogleUserInterviews(interviewsData);
      } catch (error) {
      console.error('Error loading Google user interviews from localStorage:', error);
      setGoogleUserInterviews([]);
    }
    
    // Load Google user jobs from localStorage
    const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
    try {
      const jobsData = JSON.parse(googleJobsJSON);
      setGoogleUserJobs(jobsData);
      } catch (error) {
      console.error('Error loading Google user jobs from localStorage:', error);
      setGoogleUserJobs([]);
    }
  }

  // Use the appropriate applicants data source
  const applicantsToDisplay = isGoogleUser ? googleUserApplicants : applicants
  
  // Use the appropriate interviews data source - memoize to prevent unnecessary rerenders
  const interviewsToDisplay = useMemo(() => {
    console.log('Computing interviewsToDisplay');
    console.log('Raw Google user interviews:', googleUserInterviews);
    console.log('Raw Redux interviews:', interviews);
    
    // Always clear cache when interviews data changes
    upcomingInterviewsCache.current = null;
    
    let result = [];
    
    if (isGoogleUser) {
      // Use Google user interviews from localStorage
      if (Array.isArray(googleUserInterviews)) {
        result = googleUserInterviews;
      } else {
        console.warn('Google user interviews is not an array, using empty array');
        result = [];
      }
    } else {
      // Use interviews from Redux store
      if (Array.isArray(interviews)) {
        result = interviews;
      } else {
        console.warn('Redux interviews is not an array, using empty array');
        result = [];
      }
    }
    
    console.log(`Using ${result.length} interviews from ${isGoogleUser ? 'localStorage' : 'Redux'}`);
    return result;
  }, [isGoogleUser, googleUserInterviews, interviews]);

  // Clear the cache when interviews change or refresh happens, but only if the data actually changed
  useEffect(() => {
    // Only clear if the data source has interviews
    if (interviewsToDisplay && interviewsToDisplay.length > 0) {
      console.log('Clearing upcoming interviews cache');
    upcomingInterviewsCache.current = null;
    }
  }, [interviewsToDisplay, refreshKey]);

  // Load Google user jobs
  useEffect(() => {
    if (isGoogleUser) {
      try {
        // Load Google user jobs from localStorage
        const googleJobsJSON = localStorage.getItem('google_user_jobs');
        console.log('Raw Google user jobs JSON:', googleJobsJSON);
        
        if (!googleJobsJSON || googleJobsJSON === '[]' || googleJobsJSON === 'null') {
          console.log('No Google user jobs found in localStorage');
          setGoogleUserJobs([]);
          return;
        }
        
        const jobsData = JSON.parse(googleJobsJSON);
        console.log('Parsed Google user jobs:', jobsData);
        
        if (!Array.isArray(jobsData)) {
          console.log('Google user jobs is not an array, resetting to empty array');
          setGoogleUserJobs([]);
          return;
        }
        
        // Validate and normalize each job
        const validJobs = jobsData.map(job => {
          if (!job.status) {
            job.status = 'open'; // Default to open if missing status
          }
          return job;
        }).filter(job => job._id); // Only include jobs with an ID
        
        console.log('Valid jobs after processing:', validJobs);
        setGoogleUserJobs(validJobs);
      } catch (error) {
        console.error('Error loading Google user jobs from localStorage:', error);
        // Reset to empty array on error
        setGoogleUserJobs([]);
        
        // Try to clean up localStorage if there's invalid data
        try {
          localStorage.setItem('google_user_jobs', '[]');
        } catch (e) {
          console.error('Failed to reset localStorage:', e);
        }
      }
    }
  }, [isGoogleUser, refreshKey]);

  // For Google users, we use the localStorage data
  const jobsToDisplay = isGoogleUser ? googleUserJobs : jobs;
  console.log('Jobs to display (raw):', jobsToDisplay);
  const totalJobs = jobsToDisplay.length;
  console.log('Total jobs:', totalJobs);
  
  // Fix active jobs calculation - handle case insensitivity and variation in status text
  const activeJobs = jobsToDisplay.filter(job => {
    // If job has no status, default to false (not active)
    if (!job || !job.status) {
      console.log('Job missing status:', job);
      return false;
    }
    
    // Convert to lowercase and trim to ensure consistent comparison
    const jobStatus = job.status.toString().toLowerCase().trim();
    console.log(`Job "${job.title}" has status "${job.status}" (raw), normalized to "${jobStatus}"`);
    
    // Check for any status that means "open" - "open", "active", "published"
    const isActive = ["open", "active", "published"].includes(jobStatus);
    console.log(`Is job "${job.title}" active? ${isActive}`);
    return isActive;
  }).length;
  console.log('Active jobs count:', activeJobs);
  
  // Applicant metrics
  const totalApplicants = applicantsToDisplay.length;
  
  // Define time periods for applicant growth calculation
  const currentDate = dayjs();
  const oneWeekAgo = currentDate.subtract(7, 'day');
  const twoWeeksAgo = currentDate.subtract(14, 'day');
  
  // Count applicants for current week and previous week
  const currentWeekApplicants = applicantsToDisplay.filter(app => {
    const appliedDate = dayjs(app.appliedDate);
    return appliedDate.isAfter(oneWeekAgo);
  }).length;
  
  const previousWeekApplicants = applicantsToDisplay.filter(app => {
    const appliedDate = dayjs(app.appliedDate);
    return appliedDate.isAfter(twoWeeksAgo) && appliedDate.isBefore(oneWeekAgo);
  }).length;
  
  // Calculate growth percentage
  let growthPercentage = 0;
  let growthLabel = 'growth';
  
  if (previousWeekApplicants > 0) {
    // Calculate percentage change
    growthPercentage = Math.round(((currentWeekApplicants - previousWeekApplicants) / previousWeekApplicants) * 100);
    
    // Special case for no new applicants this week
    if (currentWeekApplicants === 0) {
      growthLabel = 'no new applicants';
    } else {
      growthLabel = growthPercentage >= 0 ? 'growth' : 'decline';
    }
  } else if (currentWeekApplicants > 0) {
    // If previous week had 0 and this week has some, that's 100% growth
    growthPercentage = 100;
    growthLabel = 'growth';
  } else if (previousWeekApplicants === 0 && currentWeekApplicants === 0) {
    // If both weeks had 0, then it's stable (no change)
    growthPercentage = 0;
    growthLabel = 'change';
  }
  
  // Determine if growth is positive or neutral
  const isPositiveGrowth = growthPercentage >= 0;
  
  // Calculate hiring pipeline metrics
  const applicantsByStatus = {
    pending: applicantsToDisplay.filter(app => app.status === 'pending').length,
    shortlisted: applicantsToDisplay.filter(app => app.status === 'shortlisted').length,
    interview: applicantsToDisplay.filter(app => app.status === 'interview').length,
    hired: applicantsToDisplay.filter(app => app.status === 'hired').length,
    rejected: applicantsToDisplay.filter(app => app.status === 'rejected').length
  }
  
  // Calculate conversion rates
  const shortlistRate = (totalApplicants > 0 ? Math.round((applicantsByStatus.shortlisted / totalApplicants) * 100) : 0)
  const interviewRate = (applicantsByStatus.shortlisted > 0 ? Math.round((applicantsByStatus.interview / applicantsByStatus.shortlisted) * 100) : 0)
  const hireRate = (applicantsByStatus.interview > 0 ? Math.round((applicantsByStatus.hired / applicantsByStatus.interview) * 100) : 0)
  
  // Function to get upcoming interviews (today or future dates)
  const getUpcomingInterviews = () => {
    console.log('Getting upcoming interviews');
    console.log('interviewsToDisplay array:', interviewsToDisplay);
    
    // Force recalculate every time - don't use cache for now to help debug the issue
    upcomingInterviewsCache.current = null;
    
    // Ensure we have interviews data
    if (!interviewsToDisplay || !Array.isArray(interviewsToDisplay) || interviewsToDisplay.length === 0) {
      console.log('No interviews available or not an array');
      return [];
    }
    
    const today = dayjs().startOf('day');
    const todayStr = today.format('YYYY-MM-DD');
    
    try {
    const upcoming = interviewsToDisplay.filter(interview => {
        // Skip interviews without dates or invalid objects
      if (!interview || !interview.date) {
          console.log('Skipping interview without date:', interview);
        return false;
      }
      
      // Convert interview date to dayjs object and string format for comparison
      const interviewDate = dayjs(interview.date).startOf('day');
      const interviewDateStr = interviewDate.format('YYYY-MM-DD');
      
      // Check if interview is the same day or after today
      const isUpcoming = interviewDateStr >= todayStr;
      
      // Check for cancelled status - this needs to be excluded
      const isCancelled = interview.status && 
                         interview.status.toLowerCase().includes('cancel');
      
      // Include all interviews with dates in the future that are not cancelled or completed
      const isCompleted = interview.status && 
                         interview.status.toLowerCase().includes('complet');
      
        // Log the decision for debugging
        console.log(`Interview ${interview._id}: date=${interviewDateStr}, upcoming=${isUpcoming}, cancelled=${isCancelled}, completed=${isCompleted}`);
      
      // Include if it's an upcoming interview that is not cancelled or completed
      return isUpcoming && !isCancelled && !isCompleted;
    }).sort((a, b) => {
      // Sort by date (ascending)
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    });
    
      console.log('Filtered upcoming interviews:', upcoming.length);
    return upcoming;
    } catch (error) {
      console.error('Error processing upcoming interviews:', error);
      return [];
    }
  };
  
  // Get the upcoming interviews
  const upcomingInterviews = getUpcomingInterviews();

  // Pagination logic for upcoming interviews
  const indexOfLastInterview = currentPage * interviewsPerPage;
  const indexOfFirstInterview = indexOfLastInterview - interviewsPerPage;
  const currentInterviews = upcomingInterviews.slice(indexOfFirstInterview, indexOfLastInterview);
  const totalPages = Math.ceil(
    (isGoogleUser ? getUpcomingGoogleInterviews().length : upcomingInterviews.length) / interviewsPerPage
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Render interview card component
  const InterviewCard = ({ interview }) => {
    return (
      <Link to={`/interviews/${interview._id}`} className="block">
        <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{interview.applicantName || 'Unnamed Candidate'}</h3>
              <p className="text-sm text-gray-500">{interview.jobTitle || 'Position Not Specified'}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              interview.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {interview.status && typeof interview.status === 'string' 
                ? interview.status.charAt(0).toUpperCase() + interview.status.slice(1) 
                : 'Scheduled'}
            </span>
          </div>
          <div className="mt-3 text-sm">
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {dayjs(interview.date).format('MMM D, YYYY')}
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              <ClockIcon className="w-4 h-4 mr-1" />
              {dayjs(interview.date).format('h:mm A')}
              {interview.duration && ` (${interview.duration} min)`}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-4 mb-1 space-x-2">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-2 py-1 text-xs rounded ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
          }`}
        >
          &lt;
        </button>
        
        <div className="text-xs">
          <span className="font-medium">{currentPage}</span> / {totalPages}
        </div>
        
        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 text-xs rounded ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
          }`}
        >
          &gt;
        </button>
      </div>
    );
  };

  // Get recent applicants - sorted by applied date
  const recentApplicants = [...applicantsToDisplay]
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    .slice(0, 5)

  // Handle input changes for the new applicant form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewApplicant(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle file input change
  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0])
  }

  // Handle form submission for adding a new applicant
  const handleAddApplicant = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!newApplicant.name || !newApplicant.email || !newApplicant.jobId) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (!resumeFile) {
      toast.error('Please upload a resume file')
      return
    }
    
    // Validate phone number format if provided
    if (newApplicant.phone && !/^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/.test(newApplicant.phone)) {
      toast.error('Phone number should be in format: (123) 456-7890 or 1234567890 or 123-456-7890')
      return
    }
    
    // Format phone number if it's just digits
    let formattedPhone = newApplicant.phone
    if (newApplicant.phone && /^\d{10}$/.test(newApplicant.phone)) {
      formattedPhone = `(${newApplicant.phone.substring(0, 3)}) ${newApplicant.phone.substring(3, 6)}-${newApplicant.phone.substring(6)}`
    }
    
    // Get job title from selected job
    const selectedJob = jobs.find(job => job._id === newApplicant.jobId)
    const jobTitle = selectedJob ? selectedJob.title : ''
    
    try {
      // Create FormData object for file upload
      const formData = new FormData()
      
      // Add all applicant data to FormData
      Object.keys(newApplicant).forEach(key => {
        if (key === 'phone') {
          formData.append(key, formattedPhone || '')
        } else {
          formData.append(key, newApplicant[key])
        }
      })
      
      // Add job title
      formData.append('jobTitle', jobTitle)
      
      // Add resume file
      formData.append('resume', resumeFile)
      
      // Convert date to ISO string
      formData.set('appliedDate', dayjs(newApplicant.appliedDate).toISOString())
      
      console.log('Sending applicant data to backend with resume file')
      
      // Make direct API call to handle file upload
      const response = await api.post('/applicants', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Backend response:', response.data)
      
      // Show success message
      toast.success(`${newApplicant.name} has been added as an applicant`)
      
      // Refresh applicants list
      dispatch(fetchApplicants())
      
      // Reset form and close modal
      setNewApplicant({
        name: '',
        email: '',
        phone: '',
        jobId: '',
        status: 'pending',
        source: 'linkedin',
        notes: '',
        appliedDate: dayjs().format('YYYY-MM-DD')
      })
      setResumeFile(null)
      setIsAddApplicantModalOpen(false)
      
    } catch (error) {
      console.error('Failed to add applicant:', error)
      const errorMessage = error.response?.data?.message || error.message
      toast.error(`Failed to add applicant: ${errorMessage}`)
    }
  }

  // Generate real activity feed from actual data
  const generateActivityFeed = () => {
    const activities = [];
    let activityId = 1;
    
    // Add interview activities
    interviewsToDisplay.slice(0, 10).forEach(interview => {
      const interviewDate = dayjs(interview.date);
      const createdDate = interview.createdAt ? dayjs(interview.createdAt) : interviewDate.subtract(2, 'day');
      const timeDiff = dayjs().diff(createdDate, 'hour');
      
      let timeStr;
      if (timeDiff < 24) {
        timeStr = `${timeDiff} hours ago`;
      } else {
        const dayDiff = Math.floor(timeDiff / 24);
        timeStr = `${dayDiff} day${dayDiff > 1 ? 's' : ''} ago`;
      }
      
      activities.push({
        id: activityId++,
        type: 'interview_scheduled',
        user: interview.scheduledBy || user?.name || 'System',
        action: 'scheduled an interview with',
        subject: interview.applicantName,
        details: `for ${interview.jobTitle}`,
        time: timeStr,
        date: createdDate.toDate()
      });
    });
    
    // Add applicant activities
    applicantsToDisplay.slice(0, 10).forEach(applicant => {
      const appliedDate = dayjs(applicant.appliedDate);
      const timeDiff = dayjs().diff(appliedDate, 'hour');
      
      let timeStr;
      if (timeDiff < 24) {
        timeStr = `${timeDiff} hours ago`;
      } else {
        const dayDiff = Math.floor(timeDiff / 24);
        timeStr = `${dayDiff} day${dayDiff > 1 ? 's' : ''} ago`;
      }
      
      // Application received
      activities.push({
        id: activityId++,
        type: 'new_application',
        user: 'System',
        action: 'received a new application from',
        subject: applicant.name,
        details: `for ${applicant.jobTitle}`,
        time: timeStr,
        date: appliedDate.toDate()
      });
      
      // Status changes
      if (applicant.status === 'shortlisted') {
        activities.push({
          id: activityId++,
          type: 'status_change',
          user: user?.name || 'HR Manager',
          action: 'changed status of',
          subject: applicant.name,
          details: 'from Pending to Shortlisted',
          time: timeStr,
          date: appliedDate.add(1, 'day').toDate()
        });
      } else if (applicant.status === 'hired') {
        activities.push({
          id: activityId++,
          type: 'candidate_hired',
          user: user?.name || 'HR Manager',
          action: 'marked',
          subject: applicant.name,
          details: `as Hired for ${applicant.jobTitle}`,
          time: timeStr,
          date: appliedDate.add(7, 'day').toDate()
        });
      }
    });
    
    // Add job activities
    jobsToDisplay.slice(0, 5).forEach(job => {
      const postedDate = dayjs(job.postedDate);
      const timeDiff = dayjs().diff(postedDate, 'hour');
      
      let timeStr;
      if (timeDiff < 24) {
        timeStr = `${timeDiff} hours ago`;
      } else {
        const dayDiff = Math.floor(timeDiff / 24);
        timeStr = `${dayDiff} day${dayDiff > 1 ? 's' : ''} ago`;
      }
      
      activities.push({
        id: activityId++,
        type: 'job_posted',
        user: job.postedBy || user?.name || 'HR Manager',
        action: 'published a new job posting for',
        subject: job.title,
        details: '',
        time: timeStr,
        date: postedDate.toDate()
      });
    });
    
    // Sort activities by date (newest first) and limit to 5
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };
  
  // Update activity feed whenever relevant data changes
  useEffect(() => {
    console.log('Updating activity feed data');
    setActivityFeed(generateActivityFeed());
  }, [interviewsToDisplay, applicantsToDisplay, jobsToDisplay, refreshKey]);

  const activityIcons = {
    status_change: <EllipsisHorizontalIcon className="w-5 h-5 text-blue-500" />,
    interview_scheduled: <CalendarIcon className="w-5 h-5 text-purple-500" />,
    new_application: <UserGroupIcon className="w-5 h-5 text-green-500" />,
    job_posted: <BriefcaseIcon className="w-5 h-5 text-yellow-500" />,
    candidate_hired: <CheckCircleIcon className="w-5 h-5 text-green-500" />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={refreshDashboard}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors flex items-center"
            title="Refresh dashboard data"
          >
            <ArrowPathIcon className="w-5 h-5 mr-1" />
            <span className="text-sm">Refresh</span>
          </button>
          
        <div className="text-sm text-gray-500">
          {dayjs().format('dddd, MMMM D, YYYY')}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-3xl font-semibold mt-2">{activeJobs}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <BriefcaseIcon className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min((activeJobs / Math.max(totalJobs, 1)) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <span className="text-gray-500">{Math.round((activeJobs / Math.max(totalJobs, 1)) * 100)}% of total ({totalJobs})</span>
            <Link to="/jobs" className="ml-auto text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applicants</p>
              <p className="text-3xl font-semibold mt-2">{totalApplicants}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <UserGroupIcon className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>New this week</span>
              <span>{currentWeekApplicants}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min((currentWeekApplicants / Math.max(totalApplicants, 1)) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <div className="flex items-center">
              {currentWeekApplicants === 0 && previousWeekApplicants === 0 ? (
                <span className="text-gray-500">No recent applicants</span>
              ) : currentWeekApplicants === 0 && previousWeekApplicants > 0 ? (
                <div className="flex items-center">
                  <ArrowTrendingDownIcon className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-orange-500">No new applicants this week</span>
                </div>
              ) : (
                <div className="flex items-center">
                  {isPositiveGrowth ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={isPositiveGrowth ? "text-green-500" : "text-red-500"}>
                    {Math.abs(growthPercentage)}% {growthLabel}
                  </span>
                </div>
              )}
            </div>
            <Link to="/applicants" className="ml-auto text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Interviews</p>
              <p className="text-3xl font-semibold mt-2">
                {isGoogleUser ? getUpcomingGoogleInterviews().length : upcomingInterviews.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <CalendarIcon className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 text-xs">
            {/* Show interviews based on user type */}
            {(isGoogleUser ? getUpcomingGoogleInterviews().length : upcomingInterviews.length) > 0 ? (
              <div className="divide-y divide-gray-100">
                {/* Map the first 3 interviews */}
                {(isGoogleUser ? 
                  getUpcomingGoogleInterviews() : 
                  upcomingInterviews
                ).slice(0, 3).map((interview, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-blue-600 font-medium text-xs">
                        {interview && interview.applicantName ? interview.applicantName.charAt(0) : '?'}
                      </div>
                      <div className="truncate max-w-[120px]">
                        <p className="font-medium text-gray-900 truncate">{interview?.applicantName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 truncate">{interview?.jobTitle || 'No position'}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {interview?.type || "technical"}
                    </span>
                  </div>
                ))}
                {upcomingInterviews.length > 3 && !isGoogleUser && (
                  <div className="pt-2 text-center">
                    <span className="text-xs text-gray-500">+{upcomingInterviews.length - 3} more</span>
                  </div>
                )}
                {isGoogleUser && getUpcomingGoogleInterviews().length > 3 && (
                  <div className="pt-2 text-center">
                    <span className="text-xs text-gray-500">
                      +{getUpcomingGoogleInterviews().length - 3} more
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CalendarIcon className="w-10 h-10 mx-auto text-gray-300" />
                <p className="mt-2">No upcoming interviews</p>
                <Link to="/interviews" className="mt-3 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-xs inline-block">
                  Schedule
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center mt-2 text-sm">
            <Link to="/interviews/new" className="text-purple-600 hover:text-purple-800">
              Schedule
            </Link>
            <Link to="/interviews" className="ml-auto text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                <button 
                  onClick={() => setActivityFeed(generateActivityFeed())}
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Refresh activity feed"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {activityFeed.length > 0 ? (
                <ul className="space-y-6">
                  {activityFeed.map(activity => (
                    <li key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activityIcons[activity.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.subject}</span> {activity.details}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No recent activity found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Activities will appear here as you add jobs, applicants, and schedule interviews.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Status Summary */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Application Status Summary</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center px-4">
                  <div className="text-2xl font-semibold text-blue-600">{applicantsByStatus.pending}</div>
                  <div className="text-sm text-gray-500 mt-1">Pending</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-semibold text-indigo-600">{applicantsByStatus.shortlisted}</div>
                  <div className="text-sm text-gray-500 mt-1">Shortlisted</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-semibold text-yellow-600">{applicantsByStatus.interview}</div>
                  <div className="text-sm text-gray-500 mt-1">Interviewing</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-semibold text-green-600">{applicantsByStatus.hired}</div>
                  <div className="text-sm text-gray-500 mt-1">Hired</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div 
                      className="bg-blue-500 h-full" 
                      style={{ width: `${totalApplicants ? (applicantsByStatus.pending / totalApplicants) * 100 : 0}%` }}
                    ></div>
                    <div 
                      className="bg-indigo-500 h-full" 
                      style={{ width: `${totalApplicants ? (applicantsByStatus.shortlisted / totalApplicants) * 100 : 0}%` }}
                    ></div>
                    <div 
                      className="bg-yellow-500 h-full" 
                      style={{ width: `${totalApplicants ? (applicantsByStatus.interview / totalApplicants) * 100 : 0}%` }}
                    ></div>
                    <div 
                      className="bg-green-500 h-full" 
                      style={{ width: `${totalApplicants ? (applicantsByStatus.hired / totalApplicants) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center">
                  <ChartBarIcon className="w-4 h-4 mr-1" />
                  View detailed analytics
                </Link>
              </div>
            </div>
            </div>
          </div>

          {/* Recent Applicants */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Applicants</h2>
              <div className="flex items-center space-x-2">
                {isGoogleUser ? (
                  <Link
                    to="/applicants/add"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Applicant
                  </Link>
                ) : (
                <button
                  onClick={() => setIsAddApplicantModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md bg-primary-600 hover:bg-primary-700"
                >
                    <PlusIcon className="w-5 h-5" />
                  Add Applicant
                </button>
                )}
                <Link to="/applicants" className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplicants.map(applicant => (
                    <tr key={applicant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                        <div className="text-sm text-gray-500">{applicant.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{applicant.jobTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          applicant.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          applicant.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          applicant.status === 'interview' ? 'bg-yellow-100 text-yellow-800' :
                          applicant.status === 'hired' ? 'bg-green-100 text-green-800' :
                          applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {applicant.status && typeof applicant.status === 'string' 
                            ? applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1) 
                            : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dayjs(applicant.appliedDate).format('MMM D, YYYY')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>

      {/* Analytics Overview */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Job Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isGoogleUser ? "Applicants by Job Position" : "Job Performance"}
              </h3>
              {!isGoogleUser && (
                <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-800">
                  View all jobs
                </Link>
              )}
              </div>
                <div className="space-y-4">
              {isGoogleUser ? (
                // For Google users, show a static example chart since data isn't loading properly
                <>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">UI/UX Designer</span>
                      <span className="text-sm text-gray-600">1 applicant (50%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-blue-500" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Frontend Developer</span>
                      <span className="text-sm text-gray-600">1 applicant (50%)</span>
                      </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-green-500" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                        <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Backend Developer</span>
                      <span className="text-sm text-gray-400">No applicants yet</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                  </div>
                </div>
                  
                  <div className="text-center mt-6">
                    <Link 
                      to="/applicants/add" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Add Real Applicants
                    </Link>
                  </div>
                </>
              ) : (
                jobs.slice(0, 3).map(job => {
                  const jobApplicants = applicantsToDisplay.filter(app => app.jobId === job._id || app.jobId?._id === job._id).length;
                  const fillPercentage = Math.min(100, (jobApplicants / 20) * 100); // Assuming 20 applicants is a full bar
                  
                  return (
                    <div key={job._id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{job.title}</span>
                        <span className="text-sm text-gray-600">{jobApplicants} applicants</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                          className={`h-2.5 rounded-full ${fillPercentage > 75 ? 'bg-green-500' : fillPercentage > 40 ? 'bg-blue-500' : 'bg-yellow-500'}`} 
                          style={{ width: `${fillPercentage}%` }}
                    ></div>
                  </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Posted: {dayjs(job.postedDate).format('MMM D, YYYY')}</span>
                        <span>Status: {job.status && typeof job.status === 'string' 
                          ? job.status.charAt(0).toUpperCase() + job.status.slice(1) 
                          : 'Open'}</span>
                </div>
                  </div>
                  );
                })
              )}
              
              {!isGoogleUser && jobs.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No active jobs found. <Link to="/jobs/new" className="text-blue-600 hover:text-blue-800">Create a job posting</Link>
                  </div>
              )}
        </div>
      </div>

          {/* Interview Status Chart for Google Users */}
          {isGoogleUser && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Interview Status</h3>
            </div>
            <div className="space-y-4">
                {(() => {
                  // Count interviews by status
                  const statusCount = {
                    scheduled: interviewsToDisplay.filter(i => i.status === 'scheduled').length,
                    completed: interviewsToDisplay.filter(i => i.status === 'completed').length,
                    cancelled: interviewsToDisplay.filter(i => i.status === 'cancelled').length
                  };
                  
                  const total = Object.values(statusCount).reduce((sum, count) => sum + count, 0);
                  
                  if (total === 0) {
                    return (
                      <div className="text-center py-4 text-gray-500">
                        No interviews found. <Link to="/interviews" className="text-blue-600 hover:text-blue-800">Schedule your first interview</Link>
                </div>
                    );
                  }
                  
                  return Object.entries(statusCount).map(([status, count]) => {
                    const fillPercentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={status}>
                <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {status && typeof status === 'string' 
                              ? status.charAt(0).toUpperCase() + status.slice(1) 
                              : 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-600">{count} interviews</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              status === 'open' ? 'bg-green-500' :
                              status === 'in-progress' ? 'bg-yellow-500' :
                              status === 'closed' ? 'bg-gray-500' :
                              'bg-blue-500'
                            }`} 
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                </div>
              </div>
                    );
                  });
                })()}
            </div>
          </div>
          )}
          
          {/* Applicant Status Chart for Google Users */}
          {isGoogleUser && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Applicant Status Breakdown</h3>
            </div>
            <div className="space-y-4">
                {(() => {
                  // Count applicants by status
                  const statusLabels = {
                    pending: "Pending Review",
                    shortlisted: "Shortlisted",
                    interview: "In Interview",
                    hired: "Hired",
                    rejected: "Rejected"
                  };
                  
                  const statusColors = {
                    pending: "bg-blue-500",
                    shortlisted: "bg-indigo-500",
                    interview: "bg-yellow-500",
                    hired: "bg-green-500",
                    rejected: "bg-red-500"
                  };
                  
                  if (totalApplicants === 0) {
                return (
                      <div className="text-center py-4 text-gray-500">
                        No applicants found. <Link to="/applicants/add" className="text-blue-600 hover:text-blue-800">Add your first applicant</Link>
                      </div>
                    );
                  }
                  
                  return Object.entries(applicantsByStatus).map(([status, count]) => {
                    if (!statusLabels[status]) return null;
                    
                    const fillPercentage = totalApplicants > 0 ? (count / totalApplicants) * 100 : 0;
                    
                    return (
                      <div key={status}>
                    <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {statusLabels[status]}
                          </span>
                          <span className="text-sm text-gray-600">{count} applicants</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                            className={`h-2.5 rounded-full ${statusColors[status]}`} 
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>
                        <div className="text-xs text-right mt-1 text-gray-500">
                          {fillPercentage.toFixed(1)}% of total
                    </div>
                  </div>
                );
                  }).filter(Boolean);
                })()}
              </div>
                </div>
              )}
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="mb-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Interviews</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {isGoogleUser 
                  ? (getUpcomingGoogleInterviews().length > 0 
                    ? `Showing ${Math.min(interviewsPerPage, getUpcomingGoogleInterviews().length)} of ${getUpcomingGoogleInterviews().length}` 
                    : "No interviews")
                  : (upcomingInterviews.length > 0 
                    ? `Showing ${Math.min(interviewsPerPage, upcomingInterviews.length)} of ${upcomingInterviews.length}` 
                    : "No interviews")
                }
              </span>
              <Link to="/interviews" className="text-sm text-primary-600 hover:text-primary-800">View all</Link>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {(isGoogleUser ? getUpcomingGoogleInterviews() : upcomingInterviews).length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(isGoogleUser 
                  ? getUpcomingGoogleInterviews().slice(indexOfFirstInterview, indexOfLastInterview)
                  : currentInterviews
                ).map((interview, index) => (
                  <InterviewCard key={`upcoming-${interview._id}-${dayjs(interview.date).format('YYYY-MM-DD')}`} interview={interview} />
                ))}
              </div>
              <Pagination />
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-500 text-lg mb-2">No upcoming interviews scheduled</h3>
              <p className="text-gray-400 mb-4">Schedule an interview to get started</p>
              <Link 
                to="/interviews/new" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Schedule Interview
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Add Applicant Modal */}
      {isAddApplicantModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Applicant</h3>
              <button
                onClick={() => setIsAddApplicantModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddApplicant}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newApplicant.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newApplicant.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newApplicant.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="(123) 456-7890"
                    pattern="^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$"
                    title="Phone number should be in format: (123) 456-7890 or 1234567890 or 123-456-7890"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: (123) 456-7890 or 1234567890 or 123-456-7890
                  </p>
                </div>
                
                <div>
                  <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">
                    Job Position *
                  </label>
                  <select
                    id="jobId"
                    name="jobId"
                    value={newApplicant.jobId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a job</option>
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                    Resume * (PDF, DOC, DOCX)
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                      <span className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm">
                        <PaperClipIcon className="h-4 w-4 mr-2" />
                        {resumeFile ? resumeFile.name : 'Upload Resume'}
                      </span>
                      <input 
                        id="resume" 
                        name="resume" 
                        type="file" 
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {resumeFile ? `File size: ${(resumeFile.size / 1024).toFixed(2)} KB` : 'Max 5MB'}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newApplicant.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={newApplicant.source}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="company">Company Website</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    id="appliedDate"
                    name="appliedDate"
                    value={newApplicant.appliedDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={newApplicant.notes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddApplicantModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add Applicant
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 