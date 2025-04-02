import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  fetchInterviews, 
  updateInterviewStatus,
  scheduleInterview,
  editInterview,
  setInterviewFilter,
  selectFilteredInterviews,
  selectInterviewsStatus,
  selectInterviewsError,
  selectInterviewsFilters,
  setInterviews,
  updateInterviewInList
} from '../redux/slices/interviewsSlice'
import { 
  selectAllApplicants,
  fetchApplicants
} from '../features/applicants/applicantsSlice'
import InterviewCard from '../components/InterviewCard'
import { 
  CalendarIcon, 
  FunnelIcon, 
  PlusIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  InformationCircleIcon as InfoIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { toast } from 'react-toastify'
import { initializeUserData } from '../utils/initializeGoogleUserData'

// Extend dayjs with plugins
dayjs.extend(isBetween)

function Interviews() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const interviews = useSelector(selectFilteredInterviews)
  const status = useSelector(selectInterviewsStatus)
  const error = useSelector(selectInterviewsError)
  const filters = useSelector(selectInterviewsFilters)
  const applicants = useSelector(selectAllApplicants)
  const user = useSelector(state => state.auth.user)
  const isGoogleUser = user && user.isGoogleUser
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState(null)
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [calendarView, setCalendarView] = useState('week') // 'day', 'week', 'month'
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [upcomingInterviews, setUpcomingInterviews] = useState([])
  // Store all interviews separately to use for upcoming interviews section, so filters don't affect it
  const [allInterviews, setAllInterviews] = useState([])
  
  // Pagination state for upcoming interviews
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1)
  const [interviewsPerPage] = useState(6)
  
  // Form state for interview scheduling
  const [interviewForm, setInterviewForm] = useState({
    date: dayjs().add(1, 'week').format('YYYY-MM-DD'),
    time: '10:00',
    duration: 60,
    type: 'technical',
    location: 'Zoom',
    notes: ''
  })

  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'technical',
    location: 'Zoom',
    notes: ''
  })

  // State for refreshing interviews
  const [refreshKey, setRefreshKey] = useState(0);

  // Add pagination state for all interviews
  const [currentAllInterviewsPage, setCurrentAllInterviewsPage] = useState(1);
  const [interviewsPerAllPage] = useState(6);

  // Group interviews by date for calendar view
  const interviewsByDate = useMemo(() => {
    console.log('Grouping interviews by date:', interviews);
    
    return interviews.reduce((acc, interview) => {
      if (!interview || !interview.date) {
        console.log('Interview missing date:', interview);
        return acc;
      }
      
      try {
        const date = dayjs(interview.date).format('YYYY-MM-DD');
        console.log(`Grouping interview ${interview._id} to date ${date}`);
        
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(interview);
      } catch (error) {
        console.error('Error formatting date for interview:', interview, error);
      }
      
      return acc;
    }, {});
  }, [interviews]);

  // Log the grouped interviews for debugging
  useEffect(() => {
    console.log('Interviews grouped by date:', interviewsByDate);
  }, [interviewsByDate]);

  // Call this function in useEffect
  useEffect(() => {
    console.log(`Fetching interviews with refreshKey: ${refreshKey}`);
    
    const fetchData = async () => {
      try {
        console.log('Fetching all interviews from backend API');
        // Fetch from backend API
        const result = await dispatch(fetchInterviews()).unwrap();
        console.log('Fetched interviews from backend:', result?.length || 0);
        
        // For Google users, we need to also check localStorage
        if (isGoogleUser) {
          console.log('Google user detected - checking localStorage for interviews');
          try {
            // Get interviews from localStorage
            const storageKey = 'google_user_interviews';
            const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
            let storedInterviews = [];
            
            try {
              storedInterviews = JSON.parse(storedInterviewsJSON);
              console.log(`Found ${storedInterviews.length} interviews in localStorage`);
              
              if (storedInterviews.length > 0) {
                // Update Redux store with localStorage interviews
                dispatch(setInterviews(storedInterviews));
                
                // Set allInterviews directly from localStorage for Google users
                setAllInterviews(storedInterviews);
                console.log('Set allInterviews from localStorage for Google user:', storedInterviews);
                
                // No need to continue with API results for Google users
                // Fetch applicants in parallel
                dispatch(fetchApplicants());
                return;
              }
            } catch (parseError) {
              console.error('Error parsing interviews from localStorage:', parseError);
            }
          } catch (localStorageError) {
            console.error('Error reading from localStorage:', localStorageError);
          }
        }
        
        // Store all interviews in component state
        setAllInterviews(result || []);
        
        // Fetch applicants in parallel
        dispatch(fetchApplicants());
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(`Failed to fetch interviews: ${error.message || 'Unknown error'}`);
        
        // For Google users, try localStorage as a fallback
        if (isGoogleUser) {
          try {
            const storageKey = 'google_user_interviews';
            const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
            const storedInterviews = JSON.parse(storedInterviewsJSON);
            
            if (storedInterviews.length > 0) {
              console.log('Using localStorage interviews as fallback for Google user');
              setAllInterviews(storedInterviews);
              dispatch(setInterviews(storedInterviews));
              return;
            }
          } catch (fallbackError) {
            console.error('Error using localStorage fallback:', fallbackError);
          }
        }
        
        // Set empty arrays if fetch fails to avoid undefined errors
        setAllInterviews([]);
      }
    };
    
    fetchData();
  }, [dispatch, refreshKey, isGoogleUser]);

  // Update upcoming interviews whenever the allInterviews list changes
  useEffect(() => {
    console.log('Updating upcoming interviews. Total all interviews:', allInterviews.length);
    console.log('Raw interview data sample:', allInterviews.slice(0, 3).map(i => ({ 
      id: i._id, 
      name: i.applicantName, 
      date: i.date, 
      status: i.status,
      dateType: typeof i.date
    })));
    
    // Guard clause - if no interviews, set empty array and return
    if (!allInterviews || !Array.isArray(allInterviews) || allInterviews.length === 0) {
      console.log('No interviews available, setting upcomingInterviews to empty array');
      setUpcomingInterviews([]);
      return;
    }
    
    try {
      // Use the current date for comparison
      const now = dayjs();
      console.log('Current date for comparison:', now.format('YYYY-MM-DD HH:mm:ss'));
      
      // Filter interviews for upcoming ones (scheduled interviews in the future, regardless of how far)
      const upcoming = allInterviews.filter(interview => {
        // Make sure we have a valid interview with a date
        if (!interview || !interview.date) {
          console.log(`Skipping interview due to missing date or interview object`, interview);
          return false;
        }

        console.log(`Processing interview for upcoming: ${interview._id}, Date: ${interview.date}, Status: ${interview.status}, Date type: ${typeof interview.date}`);

        // For upcoming interviews, we only want those with status 'scheduled'
        if (interview.status !== 'scheduled') {
          console.log(`Skipping interview ${interview._id} due to status: ${interview.status}`);
          return false;
        }

        try {
          // Parse the interview date
          const interviewDate = dayjs(interview.date);
          
          if (!interviewDate.isValid()) {
            console.error(`Invalid date format for interview ${interview._id}: ${interview.date}`);
            return false;
          }
          
          console.log(`Interview ${interview._id} date parsed as: ${interviewDate.format('YYYY-MM-DD HH:mm:ss')}`);
          
          // Check if the interview is in the future (including today)
          const interviewDateOnly = interviewDate.startOf('day');
          const todayDateOnly = now.startOf('day');
          
          const isSameDay = interviewDateOnly.isSame(todayDateOnly);
          const isAfterToday = interviewDateOnly.isAfter(todayDateOnly);
          
          console.log(`Interview ${interview._id} date comparison: Same day as today? ${isSameDay}, After today? ${isAfterToday}`);
          
          if (isSameDay) {
            // For today's interviews, we need to check the time too
            const isAfterNow = interviewDate.isAfter(now);
            const isSameTime = interviewDate.isSame(now);
            console.log(`Interview ${interview._id} time comparison: After current time? ${isAfterNow}, Same time? ${isSameTime}`);
            
            if (isAfterNow || isSameTime) {
              console.log(`Interview ${interview._id} is TODAY and is upcoming`);
              return true;
            } else {
              console.log(`Interview ${interview._id} is TODAY but already passed`);
              return false;
            }
          } else if (isAfterToday) {
            console.log(`Interview ${interview._id} is in the FUTURE (${interviewDateOnly.format('YYYY-MM-DD')})`);
            return true;
          } else {
            console.log(`Interview ${interview._id} is in the PAST (${interviewDateOnly.format('YYYY-MM-DD')})`);
            return false;
          }
        } catch (error) {
          console.error(`Error parsing date for interview ${interview._id}:`, error);
          return false;
        }
      });

      // Sort by date (soonest first)
      const sorted = upcoming.sort((a, b) => {
        // Handle potential null/undefined dates
        if (!a.date) return 1; // Push items without dates to the end
        if (!b.date) return -1;
        
        return new Date(a.date) - new Date(b.date);
      });
      
      console.log('Upcoming interviews count:', sorted.length);
      console.log('Upcoming interviews:', sorted.map(i => ({ 
        id: i._id, 
        name: i.applicantName, 
        date: dayjs(i.date).format('YYYY-MM-DD'),
        status: i.status
      })));
      
      // Update the state with the filtered and sorted interviews
      setUpcomingInterviews(sorted);
    } catch (error) {
      console.error('Error updating upcoming interviews:', error);
      // In case of error, ensure we don't leave upcomingInterviews in a bad state
      setUpcomingInterviews([]);
    }
  }, [allInterviews]);

  // Add a useEffect to update the calendar when the date filter changes
  useEffect(() => {
    // If a date filter is selected, update the calendar view to show that date
    if (filters.date && filters.date !== 'all') {
      const today = dayjs();
      
      if (filters.date === 'today') {
        setCurrentDate(today);
      } else if (filters.date === 'tomorrow') {
        setCurrentDate(today.add(1, 'day'));
      } else if (filters.date === 'thisWeek') {
        setCurrentDate(today); // Current week
      } else if (filters.date === 'nextWeek') {
        setCurrentDate(today.add(1, 'week'));
      } else {
        // Try to parse the date
        try {
          const parsedDate = dayjs(filters.date);
          if (parsedDate.isValid()) {
            setCurrentDate(parsedDate);
          }
        } catch (error) {
          console.error('Error parsing date filter:', error);
        }
      }
    }
  }, [filters.date]);

  // Add a useEffect to update the calendar when the currentDate changes
  useEffect(() => {
    console.log('Current date changed:', currentDate.format('YYYY-MM-DD'));
    
    // If we're in week view, log the start and end of the week
    if (calendarView === 'week') {
      const startOfWeek = currentDate.startOf('week');
      const endOfWeek = currentDate.endOf('week');
      console.log('Week range:', startOfWeek.format('YYYY-MM-DD'), 'to', endOfWeek.format('YYYY-MM-DD'));
      
      // Log interviews for each day of the week
      for (let i = 0; i < 7; i++) {
        // Create a new date object for each day to avoid mutation
        const date = dayjs(startOfWeek).add(i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        console.log(`Interviews for ${dateStr}:`, interviewsByDate[dateStr] || 'None');
      }
    }
    
    // If we're in day view, log the interviews for that day
    if (calendarView === 'day') {
      const dateStr = currentDate.format('YYYY-MM-DD');
      console.log(`Interviews for ${dateStr}:`, interviewsByDate[dateStr] || 'None');
    }
  }, [currentDate, calendarView, interviewsByDate]);

  const handleStatusChange = (interviewId, newStatus) => {
    console.log(`Changing interview ${interviewId} status to ${newStatus}`);
    
    // Check if this is a Google user interview by the ID format
    const isLocalStorageId = String(interviewId).startsWith('google_') || 
                             String(interviewId).startsWith('local_') || 
                             String(interviewId).startsWith('mock_');
    
    // For Google user interviews, update directly in localStorage and state
    if (isLocalStorageId || isGoogleUser) {
      try {
        console.log('Updating localStorage interview status');
        
        // Get the current interview data
        const currentInterview = interviews.find(interview => 
          String(interview._id) === String(interviewId)
        );
        
        if (!currentInterview) {
          toast.error(`Could not find interview with ID ${interviewId}`);
          return;
        }
        
        // Create the updated interview
        const updatedInterview = {
          ...currentInterview,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        // Update in localStorage directly
        const storageKey = 'google_user_interviews';
        const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
        let storedInterviews = [];
        
        try {
          storedInterviews = JSON.parse(storedInterviewsJSON);
          
          // Update the interview in localStorage
          const updatedInterviews = storedInterviews.map(interview => 
            String(interview._id) === String(interviewId) 
              ? { ...interview, status: newStatus, updatedAt: new Date().toISOString() } 
              : interview
          );
          
          // Save back to localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedInterviews));
          
          // Update in Redux store
          dispatch(updateInterviewInList(updatedInterview));
          
          // Update in local state
          setAllInterviews(prev => prev.map(interview => 
            String(interview._id) === String(interviewId) 
              ? updatedInterview 
              : interview
          ));
          
          toast.success(`Interview status updated to ${newStatus}`);
        } catch (error) {
          console.error('Error updating localStorage:', error);
          toast.error('Error updating status in local storage');
        }
        
        return;
      } catch (error) {
        console.error('Error handling localStorage update:', error);
        toast.error('Error updating status');
        return;
      }
    }

    // For regular users, use the Redux action
    try {
      dispatch(updateInterviewStatus({ id: interviewId, status: newStatus }))
        .unwrap()
        .then(() => {
          console.log('Status updated successfully');
          // No need to update allInterviews manually, will be updated by the component's useEffect
        })
        .catch((error) => {
          console.error('Failed to update interview status:', error);
          toast.error(`Failed to update interview status: ${error.toString()}`);
        });
    } catch (error) {
      console.error('Error dispatching updateInterviewStatus:', error);
      toast.error('Error updating status: ' + error.toString());
    }
  };

  const handleFilterChange = (filterType, value) => {
    console.log(`Changing filter: ${filterType} = ${value}`);
    
    // Log the current date for debugging
    console.log('Current date (before update):', dayjs().format('YYYY-MM-DD HH:mm:ss'));
    
    // Special handling for date filter
    if (filterType === 'date') {
      if (value === 'all') {
        console.log('Clearing date filter');
      } else if (value === 'today') {
        console.log('Setting today filter:', dayjs().format('YYYY-MM-DD'));
        // Update calendar view to show today
        setCurrentDate(dayjs());
        // Set calendar view to day for today
        setCalendarView('day');
      } else if (value === 'tomorrow') {
        console.log('Setting tomorrow filter:', dayjs().add(1, 'day').format('YYYY-MM-DD'));
        // Update calendar view to show tomorrow
        setCurrentDate(dayjs().add(1, 'day'));
        // Set calendar view to day for tomorrow
        setCalendarView('day');
      } else if (value === 'thisWeek') {
        console.log('Setting this week filter range:', 
          dayjs().startOf('week').format('YYYY-MM-DD'), 
          'to', 
          dayjs().endOf('week').format('YYYY-MM-DD')
        );
        // Update calendar view to show this week
        setCurrentDate(dayjs());
        // Set calendar view to week
        setCalendarView('week');
      } else if (value === 'nextWeek') {
        console.log('Setting next week filter range:', 
          dayjs().add(1, 'week').startOf('week').format('YYYY-MM-DD'), 
          'to', 
          dayjs().add(1, 'week').endOf('week').format('YYYY-MM-DD')
        );
        // Update calendar view to show next week
        setCurrentDate(dayjs().add(1, 'week'));
        // Set calendar view to week
        setCalendarView('week');
      } else if (value === 'thisMonth') {
        const currentMonth = dayjs().month();
        const monthName = dayjs().format('MMMM');
        console.log(`Setting this month filter (month ${currentMonth + 1} - ${monthName}), any year`);
        
        // Update calendar view to show this month
        setCurrentDate(dayjs());
        // Set calendar view to month
        setCalendarView('month');
      } else if (value === 'nextMonth') {
        const nextMonth = (dayjs().month() + 1) % 12;
        const nextMonthName = dayjs().add(1, 'month').format('MMMM');
        console.log(`Setting next month filter (month ${nextMonth + 1} - ${nextMonthName}), any year`);
        
        // Update calendar view to show next month
        setCurrentDate(dayjs().add(1, 'month'));
        // Set calendar view to month
        setCalendarView('month');
      }
    }
    
    // Dispatch the filter change to Redux
    dispatch(setInterviewFilter({ [filterType]: value }));
    
    // Check if calendar view needs to be updated further
    console.log('Calendar view set to:', calendarView);
    console.log('Current date updated to:', currentDate.format('YYYY-MM-DD'));
  };

  const handleViewDetails = (interviewId) => {
    console.log('Viewing details for interview:', interviewId);
    
    // For Google users, check if interview exists in localStorage before navigating
    if (isGoogleUser) {
      const googleInterviewsJSON = localStorage.getItem('google_user_interviews') || '[]';
      try {
        const googleInterviews = JSON.parse(googleInterviewsJSON);
        const interview = googleInterviews.find(i => 
          i._id === interviewId || 
          String(i._id) === String(interviewId)
        );
        
        if (!interview) {
          toast.error('Interview not found in local storage');
          return;
        }
      } catch (error) {
        console.error('Error checking localStorage for interview:', error);
      }
    }
    
    navigate(`/interviews/${interviewId}`);
  }

  const handleScheduleInterview = (data) => {
    console.log('Scheduling interview with data:', data);
    
    // Validate and format date
    let formattedData = { ...data };
    try {
      // Ensure date is a proper ISO string
      if (formattedData.date) {
        const dateObj = new Date(formattedData.date);
        if (!isNaN(dateObj.getTime())) {
          formattedData.date = dateObj.toISOString();
          console.log('Formatted date to valid ISO:', formattedData.date);
        } else {
          console.error('Invalid date format:', formattedData.date);
          toast.error('Invalid date format. Please select a valid date.');
          return;
        }
      } else {
        console.error('Missing date');
        toast.error('Please select an interview date');
        return;
      }
      
      // Ensure duration is a number
      if (formattedData.duration) {
        formattedData.duration = Number(formattedData.duration);
        if (isNaN(formattedData.duration)) {
          formattedData.duration = 60; // Default to 60 minutes
        }
      } else {
        formattedData.duration = 60; // Default to 60 minutes
      }
      
      // Ensure interviewers is an array
      if (!formattedData.interviewers) {
        formattedData.interviewers = [];
      } else if (!Array.isArray(formattedData.interviewers)) {
        // If it's a string, convert to array
        if (typeof formattedData.interviewers === 'string') {
          formattedData.interviewers = [formattedData.interviewers];
        } else {
          // If it's any other type, set to empty array
          formattedData.interviewers = [];
        }
      }
    } catch (dateError) {
      console.error('Error formatting data:', dateError);
      toast.error('Error with data format. Please try again.');
      return;
    }
    
    // For Google users, ensure we use valid formats for IDs
    if (isGoogleUser) {
      console.log('Google user detected, transforming IDs for local storage');
      
      // Create a new data object with transformed IDs for Google users
      const transformedData = {
        ...formattedData,
        // Always use google_ prefixed IDs for Google users - ensure strings
        applicantId: formattedData.applicantId && typeof formattedData.applicantId === 'string' && !formattedData.applicantId.startsWith('google_') ? 
          `google_applicant_${Date.now()}` : (formattedData.applicantId || `google_applicant_${Date.now()}`),
        // Convert jobId to string before checking startsWith
        jobId: formattedData.jobId && typeof formattedData.jobId === 'string' && !formattedData.jobId.startsWith('google_') ? 
          `google_job_${Date.now()}` : (formattedData.jobId ? String(formattedData.jobId) : `google_job_${Date.now()}`)
      };
      
      console.log('Original data:', formattedData);
      console.log('Transformed data:', transformedData);
      
      // Use the transformed data for Google users
      formattedData = transformedData;
    }
    
    dispatch(scheduleInterview(formattedData))
      .unwrap()
      .then(result => {
        console.log('Interview scheduled successfully:', result);
        toast.success('Interview scheduled successfully!');
        
        // Close the modal
        setIsScheduleModalOpen(false);
        
        // Reset form and selection
        setInterviewForm({
          date: dayjs().add(1, 'week').format('YYYY-MM-DD'),
          time: '10:00',
          duration: 60,
          type: 'technical',
          location: 'Zoom',
          notes: ''
        });
        setSelectedApplicant(null);
        
        // Immediately update the local state for Google users
        if (isGoogleUser) {
          try {
            // Get interviews from localStorage
            const storageKey = 'google_user_interviews';
            const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
            let storedInterviews = [];
            
            try {
              storedInterviews = JSON.parse(storedInterviewsJSON);
              
              // Check if the newly scheduled interview exists
              const exists = storedInterviews.some(interview => interview._id === result._id);
              
              if (exists) {
                console.log('Newly scheduled interview found in localStorage');
                // Update the allInterviews state with the localStorage interviews
                setAllInterviews(storedInterviews);
                
                // Also update Redux store
                dispatch(setInterviews(storedInterviews));
                
                // Force a re-render of the components
                setRefreshKey(prevKey => prevKey + 1);
              } else {
                console.warn('Newly scheduled interview not found in localStorage, adding it');
                // Add the interview to both states
                setAllInterviews(prevInterviews => [...prevInterviews, result]);
                dispatch(setInterviews([...storedInterviews, result]));
                
                // Force a re-render
                setRefreshKey(prevKey => prevKey + 1);
              }
            } catch (parseError) {
              console.error('Error parsing interviews from localStorage:', parseError);
              toast.error('Error updating interviews list. Please refresh the page.');
            }
          } catch (error) {
            console.error('Error updating local state after scheduling for Google user:', error);
            toast.error('Error updating interviews list. Please refresh the page to see new interview.');
          }
        } else {
          // For non-Google users, fetch updated interviews from backend
        dispatch(fetchInterviews())
          .unwrap()
            .then(updatedInterviews => {
              setAllInterviews(updatedInterviews);
            })
            .catch(fetchError => {
              console.error('Error fetching updated interviews:', fetchError);
              // Add interview to local state anyway to show immediate feedback
              setAllInterviews(prevInterviews => [...prevInterviews, result]);
            });
        }
      })
      .catch(error => {
        console.error('Failed to schedule interview:', error);
        
        // Check for specific error messages
        let errorMessage = 'Failed to schedule interview';
        
        if (error.toString().includes('ID format')) {
          errorMessage = 'Invalid applicant or job ID format. Please select valid options.';
        } else if (error.toString().includes('Google user')) {
          errorMessage = 'Unable to add interview with Google user account. Try with a standard account.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        toast.error(errorMessage);
      });
  };

  const handlePrevDate = () => {
    if (calendarView === 'day') {
      setCurrentDate(currentDate.subtract(1, 'day'))
    } else if (calendarView === 'week') {
      setCurrentDate(currentDate.subtract(1, 'week'))
    } else {
      setCurrentDate(currentDate.subtract(1, 'month'))
    }
  }

  const handleNextDate = () => {
    if (calendarView === 'day') {
      setCurrentDate(currentDate.add(1, 'day'))
    } else if (calendarView === 'week') {
      setCurrentDate(currentDate.add(1, 'week'))
    } else {
      setCurrentDate(currentDate.add(1, 'month'))
    }
  }

  const handleTodayClick = () => {
    setCurrentDate(dayjs())
  }

  const handleApplicantSelect = (e) => {
    const applicantId = e.target.value;
    if (applicantId && applicantId !== 'none') {
      const applicant = applicants.find(a => a._id === applicantId);
      console.log('Selected applicant:', applicant);
      setSelectedApplicant(applicant);
    } else {
      setSelectedApplicant(null);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setInterviewForm({
      ...interviewForm,
      [name]: value
    });
  }

  const handleEditClick = (interview) => {
    console.log('Editing interview:', interview);
    
    if (!interview || !interview._id) {
      console.error('Invalid interview object:', interview);
      toast.error('Cannot edit this interview: invalid data');
      return;
    }
    
    setEditingInterview(interview);
    
    // Initialize form with current interview data
    try {
      // Ensure we have a valid date
      let interviewDate;
      try {
        interviewDate = dayjs(interview.date);
        // Validate that the date is valid
        if (!interviewDate.isValid()) {
          console.warn('Invalid date in interview:', interview.date);
          // Use current date as fallback
          interviewDate = dayjs();
        }
      } catch (error) {
        console.error('Error parsing interview date:', error);
        interviewDate = dayjs();
      }
      
      const formattedDate = interviewDate.format('YYYY-MM-DD');
      const formattedTime = interviewDate.format('HH:mm');
      
      console.log('Setting edit form with date:', formattedDate, 'and time:', formattedTime);
      
      setEditForm({
        date: formattedDate,
        time: formattedTime,
        duration: interview.duration || 60,
        type: interview.type || 'technical',
        location: interview.location || 'Zoom',
        notes: interview.notes || ''
      });
      
      console.log('Edit form initialized successfully');
    } catch (error) {
      console.error('Error initializing edit form:', error);
      // Set default values if there's an error
      setEditForm({
        date: dayjs().format('YYYY-MM-DD'),
        time: dayjs().format('HH:mm'),
        duration: 60,
        type: 'technical',
        location: 'Zoom',
        notes: ''
      });
    }
    
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  const handleSaveEdit = async () => {
    console.log('Saving edited interview:', editingInterview);
    if (!editingInterview) {
      toast.error('No interview selected for editing');
      return;
    }
    
    // Format date and time
    try {
      const formattedDateTime = `${editForm.date}T${editForm.time}:00`;
      console.log('Formatted date/time:', formattedDateTime);
      
      // Create updated interview object
    const updatedInterviewData = {
        date: formattedDateTime,
        duration: parseInt(editForm.duration, 10),
      type: editForm.type,
      location: editForm.location,
      notes: editForm.notes,
      // Preserve important fields
      applicantId: editingInterview.applicantId,
      applicantName: editingInterview.applicantName,
      jobId: editingInterview.jobId,
      jobTitle: editingInterview.jobTitle,
      status: editingInterview.status,
      interviewers: editingInterview.interviewers || []
    };
    
    console.log('Saving updated interview data:', updatedInterviewData);
      
      // Check if this is a localStorage-based ID
      const interviewId = editingInterview._id;
      const interviewIdStr = String(interviewId);
      const isLocalStorageId = interviewIdStr.startsWith('google_') || 
                               interviewIdStr.startsWith('local_') || 
                               interviewIdStr.startsWith('mock_');
      
      // For Google users or localStorage IDs, update directly in localStorage first
      if (isGoogleUser || isLocalStorageId) {
        console.log('Google user or localStorage ID detected, updating in localStorage first');
        
        try {
          // Get interviews from localStorage
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          let storedInterviews = [];
          
          try {
            storedInterviews = JSON.parse(storedInterviewsJSON);
            
            // Find the interview to update
            const index = storedInterviews.findIndex(interview => 
              String(interview._id) === String(interviewId)
            );
            
            if (index !== -1) {
              console.log('Found interview in localStorage, updating');
              
              // Update the interview with the new data
              const updatedInterview = {
                ...storedInterviews[index],
                ...updatedInterviewData,
                updatedAt: new Date().toISOString()
              };
              
              // Update in localStorage
              storedInterviews[index] = updatedInterview;
              localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
              
              // Update in local state
              const updatedInterviews = allInterviews.map(interview => 
                String(interview._id) === String(interviewId) 
                  ? updatedInterview 
                  : interview
              );
              setAllInterviews(updatedInterviews);
              
              // Update in Redux store
              dispatch(updateInterviewInList(updatedInterview));
              
              // Close modal
              setIsEditModalOpen(false);
              setEditingInterview(null);
              
              toast.success('Interview updated successfully!');
              
              // Force a re-render
              setRefreshKey(prevKey => prevKey + 1);
              
              return;
            } else {
              console.log('Interview not found in localStorage, will use regular Redux flow');
            }
          } catch (parseError) {
            console.error('Error parsing interviews from localStorage:', parseError);
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
      
      // For regular API calls or localStorage fallback, use the Redux thunk
      try {
        // Update via backend API through Redux
      const result = await dispatch(editInterview({ 
        id: editingInterview._id, 
        interviewData: updatedInterviewData 
      })).unwrap();
      
      console.log('Interview update result:', result);
        
        if (!result) {
          console.warn('No result from editInterview, but continuing with UI update');
          // Even if API call didn't return data, we can still update the local UI
          // This is a fallback for when the server request fails but we want the UI to update
        }
      
      // Close modal and clear editing state
      setIsEditModalOpen(false);
      setEditingInterview(null);
      
        // Fetch fresh data from backend or update local state
        try {
      const interviews = await dispatch(fetchInterviews()).unwrap();
      setAllInterviews(interviews); // Update allInterviews with fresh data
        } catch (fetchError) {
          console.warn('Could not fetch interviews after update, using optimistic update', fetchError);
          // Optimistic update - update the interview in the local state
          const updatedInterviews = allInterviews.map(interview => 
            interview._id === editingInterview._id 
              ? { ...interview, ...updatedInterviewData }
              : interview
          );
          setAllInterviews(updatedInterviews);
        }
      
      // Force a refresh of the interviews list
      setRefreshKey(prevKey => prevKey + 1);
      
      toast.success('Interview updated successfully!');
    } catch (error) {
      console.error('Failed to update interview:', error);
      toast.error('Failed to update interview: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      toast.error('An error occurred while saving: ' + (error.message || 'Unknown error'));
    }
  };

  // Calculate pagination values for upcoming interviews
  const indexOfLastUpcoming = currentUpcomingPage * interviewsPerPage;
  const indexOfFirstUpcoming = indexOfLastUpcoming - interviewsPerPage;
  // Ensure we have a valid array before slicing
  const currentUpcomingInterviews = Array.isArray(upcomingInterviews) 
    ? upcomingInterviews.slice(indexOfFirstUpcoming, indexOfLastUpcoming)
    : [];
  const totalUpcomingPages = Math.max(1, Math.ceil(
    Array.isArray(upcomingInterviews) ? upcomingInterviews.length / interviewsPerPage : 0
  ));
  
  // Handle page changes
  const paginateUpcoming = (pageNumber) => setCurrentUpcomingPage(pageNumber);
  const nextUpcomingPage = () => setCurrentUpcomingPage(prev => Math.min(prev + 1, totalUpcomingPages));
  const prevUpcomingPage = () => setCurrentUpcomingPage(prev => Math.max(prev - 1, 1));

  // UpcomingPagination component
  const UpcomingPagination = () => {
    // Log pagination values for debugging
    console.log('Pagination debug:', {
      currentPage: currentUpcomingPage,
      totalPages: totalUpcomingPages,
      total: upcomingInterviews.length,
      perPage: interviewsPerPage,
      showing: currentUpcomingInterviews.length
    });

    // Always render pagination controls if there are interviews, even if just one page
    if (upcomingInterviews.length <= 0) return null;
    
    return (
      <div className="flex justify-center items-center mt-6 mb-2 bg-white py-3 rounded-md">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={prevUpcomingPage}
            disabled={currentUpcomingPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
              currentUpcomingPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-500 hover:bg-gray-50'
            } text-sm font-medium`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <span className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium text-gray-700">
            Page {currentUpcomingPage} of {Math.max(1, totalUpcomingPages)}
          </span>
          
          <button
            onClick={nextUpcomingPage}
            disabled={currentUpcomingPage === totalUpcomingPages || totalUpcomingPages <= 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
              currentUpcomingPage === totalUpcomingPages || totalUpcomingPages <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-500 hover:bg-gray-50'
            } text-sm font-medium`}
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    );
  };

  // Calculate pagination values for all interviews
  const indexOfLastAllInterview = currentAllInterviewsPage * interviewsPerAllPage;
  const indexOfFirstAllInterview = indexOfLastAllInterview - interviewsPerAllPage;
  // Ensure we have a valid array before slicing
  const currentAllInterviews = Array.isArray(interviews) 
    ? interviews.slice(indexOfFirstAllInterview, indexOfLastAllInterview)
    : [];
  const totalAllInterviewsPages = Math.max(1, Math.ceil(
    Array.isArray(interviews) ? interviews.length / interviewsPerAllPage : 0
  ));

  // Handle page changes for all interviews
  const paginateAllInterviews = (pageNumber) => setCurrentAllInterviewsPage(pageNumber);
  const nextAllInterviewsPage = () => setCurrentAllInterviewsPage(prev => Math.min(prev + 1, totalAllInterviewsPages));
  const prevAllInterviewsPage = () => setCurrentAllInterviewsPage(prev => Math.max(prev - 1, 1));

  // Add the AllInterviewsPagination component
  const AllInterviewsPagination = () => {
    // Log pagination values for debugging
    console.log('All Interviews Pagination debug:', {
      currentPage: currentAllInterviewsPage,
      totalPages: totalAllInterviewsPages,
      total: interviews.length,
      perPage: interviewsPerAllPage,
      showing: currentAllInterviews.length
    });

    // Always render pagination controls if there are interviews, even if just one page
    if (interviews.length <= 0) return null;
    
    return (
      <div className="flex justify-center items-center mt-6 mb-2 bg-white py-3 rounded-md">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={prevAllInterviewsPage}
            disabled={currentAllInterviewsPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
              currentAllInterviewsPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-500 hover:bg-gray-50'
            } text-sm font-medium`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <span className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium text-gray-700">
            Page {currentAllInterviewsPage} of {Math.max(1, totalAllInterviewsPages)}
          </span>
          
          <button
            onClick={nextAllInterviewsPage}
            disabled={currentAllInterviewsPage === totalAllInterviewsPages || totalAllInterviewsPages <= 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
              currentAllInterviewsPage === totalAllInterviewsPages || totalAllInterviewsPages <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-500 hover:bg-gray-50'
            } text-sm font-medium`}
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    );
  };

  // Reset pagination on component mount
  useEffect(() => {
    setCurrentUpcomingPage(1);
    setCurrentAllInterviewsPage(1);
    console.log('Pagination reset to page 1 on mount');
  }, []);

  // Reset upcoming interviews pagination when the list changes
  useEffect(() => {
    setCurrentUpcomingPage(1);
  }, [upcomingInterviews.length]);

  // Reset all interviews pagination when the list changes
  useEffect(() => {
    setCurrentAllInterviewsPage(1);
  }, [interviews.length]);

  // If we're loading and not a Google user, show loading state
  if (status === 'loading' && interviews.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (status === 'failed') {
    return <div className="text-red-600">Error: {error}</div>
  }

  // Debug logs
  console.log('Current filters:', filters);
  console.log('Total interviews:', interviews.length);
  console.log('All interviews count:', allInterviews.length);
  console.log('Upcoming interviews count:', upcomingInterviews.length);
  console.log('Upcoming interviews:', upcomingInterviews.map(i => ({ 
    id: i._id,
    name: i.applicantName,
    date: dayjs(i.date).format('YYYY-MM-DD'),
    status: i.status
  })));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all interview sessions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Schedule Interview Button */}
          <div className="ml-auto flex gap-3">
          {/* Commented out the Advanced Scheduler button for now */}
          {/* <button
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
              Advanced Scheduler (disabled)
            </button> */}
            
            <button
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              onClick={() => navigate('/interviewers')}
            >
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-gray-500" />
              Interviewers
            </button>
            
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Schedule Interview
          </button>
          </div>
        </div>
      </div>

      {/* Info message for all users */}
      <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700">
        <div className="flex items-center">
          <InfoIcon className="w-6 h-6 mr-2" />
          <div>
            <p className="font-medium">Welcome to Interview Management</p>
            <p className="text-sm">You can schedule interviews and manage your candidates. {isGoogleUser ? "Your data will be stored locally in your browser." : ""}</p>
          </div>
        </div>
      </div>

      {/* Only show empty state if there are no interviews */}
      {interviews.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <CalendarIcon className="w-16 h-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No interviews scheduled yet</h3>
          <p className="mt-2 text-gray-500">
            Get started by scheduling your first interview.
          </p>
          <button
            onClick={() => setIsScheduleModalOpen(true)} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Schedule Your First Interview
          </button>
        </div>
      )}

      {/* Filters and Calendar Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Calendar Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
            <button
                onClick={() => setCalendarView('day')}
                className={`px-3 py-1 text-sm rounded-md ${
                  calendarView === 'day'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-3 py-1 text-sm rounded-md ${
                  calendarView === 'week'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  calendarView === 'month'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setCurrentDate(prev => prev.subtract(1, calendarView))}
                className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <button
                onClick={() => setCurrentDate(dayjs())}
                className="px-3 py-1 mx-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Today
            </button>
            <button
                onClick={() => setCurrentDate(prev => prev.add(1, calendarView))}
                className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </button>
              <span className="ml-4 text-sm font-medium">
              {calendarView === 'day' && currentDate.format('MMMM D, YYYY')}
                {calendarView === 'week' && `Week of ${currentDate.startOf('week').format('MMMM D')} - ${currentDate.endOf('week').format('MMMM D')}`}
              {calendarView === 'month' && currentDate.format('MMMM YYYY')}
            </span>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1 text-sm ${
                calendarView === 'day' 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Day
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1 text-sm ${
                calendarView === 'week' 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1 text-sm ${
                calendarView === 'month' 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              Month
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center ml-auto space-x-4">
            <div className="flex items-center">
              <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
              <select
                className="form-select rounded-md border-gray-300 text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <select
              className="form-select rounded-md border-gray-300 text-sm"
              value={filters.date || 'all'}
              onChange={(e) => {
                console.log('Selected date filter:', e.target.value);
                handleFilterChange('date', e.target.value);
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="thisWeek">This Week</option>
              <option value="nextWeek">Next Week</option>
              <option value="thisMonth">This Month</option>
              <option value="nextMonth">Next Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar view tip */}
      {/* <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Need more advanced scheduling features? Try our new <a href="/scheduler" className="font-medium underline">Interview Calendar Scheduler</a> to check interviewer availability and send automatic calendar invites.
            </p>
          </div>
        </div>
      </div> */}

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        {calendarView === 'day' && (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">{currentDate.format('dddd, MMMM D')}</h3>
            <div className="space-y-4">
              {(() => {
                const dateStr = currentDate.format('YYYY-MM-DD');
                console.log(`Rendering day view for ${dateStr}, interviews:`, interviewsByDate[dateStr]);
                
                if (interviewsByDate[dateStr] && interviewsByDate[dateStr].length > 0) {
                  return interviewsByDate[dateStr].map(interview => (
                    <div 
                      key={interview._id} 
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(interview._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{interview.applicantName || 'Unknown Applicant'}</p>
                          <p className="text-sm text-gray-500">{dayjs(interview.date).format('h:mm A')}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(interview);
                            }}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors mr-2"
                            aria-label="Edit interview"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                            interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ));
                } else {
                  return <p className="text-center text-gray-500 py-4">No interviews scheduled for this day.</p>;
                }
              })()}
            </div>
          </div>
        )}

        {calendarView === 'week' && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => {
                // Create a new date object for each day to avoid mutation issues
                const startOfWeek = currentDate.startOf('week');
                const date = dayjs(startOfWeek).add(i, 'day');
                const dateStr = date.format('YYYY-MM-DD');
                const isToday = dateStr === dayjs().format('YYYY-MM-DD');
                
                console.log(`Rendering week day ${dateStr}, interviews:`, interviewsByDate[dateStr]);
                
                return (
                  <div key={i} className="min-h-[150px] max-h-[300px] overflow-y-auto">
                    <div className={`text-center p-2 mb-2 ${isToday ? 'bg-primary-50 rounded-md' : ''}`}>
                      <p className={`text-sm font-medium ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>
                        {date.format('ddd')}
                      </p>
                      <p className={`text-2xl ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                        {date.format('D')}
                      </p>
                    </div>
                    
                    {/* Interviews for this day */}
                    <div className="space-y-2">
                      {interviewsByDate[dateStr] && interviewsByDate[dateStr].length > 0 ? (
                        interviewsByDate[dateStr].map(interview => (
                          <div 
                            key={interview._id} 
                            className="p-2 text-xs border rounded-md hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewDetails(interview._id)}
                          >
                            <p className="font-medium truncate">{interview.applicantName}</p>
                            <p className="text-gray-500">{dayjs(interview.date).format('h:mm A')}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-gray-400">No interviews</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Month view would go here */}
        {calendarView === 'month' && (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">{currentDate.format('MMMM YYYY')}</h3>
            
            {/* Month grid header - days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={i} className="text-center p-2">
                  <p className="text-sm font-medium text-gray-600">{day}</p>
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                // Generate days for the month view
                const startOfMonth = currentDate.startOf('month');
                const endOfMonth = currentDate.endOf('month');
                const startDate = startOfMonth.startOf('week');
                const endDate = endOfMonth.endOf('week');
                
                const totalDays = endDate.diff(startDate, 'day') + 1;
                const days = Array.from({ length: totalDays }).map((_, i) => {
                  const date = dayjs(startDate).add(i, 'day');
                  const dateStr = date.format('YYYY-MM-DD');
                  const isToday = dateStr === dayjs().format('YYYY-MM-DD');
                  const isCurrentMonth = date.month() === currentDate.month();
                  
                  // Get interviews for this day
                  const dayInterviews = interviewsByDate[dateStr] || [];
                  
                  return (
                    <div 
                      key={i} 
                      className={`
                        min-h-[100px] max-h-[150px] overflow-y-auto p-1 border border-gray-100 
                        ${isToday ? 'bg-primary-50' : ''} 
                        ${isCurrentMonth ? '' : 'bg-gray-50'}
                      `}
                    >
                      <div className="text-right">
                        <span 
                          className={`
                            inline-block w-6 h-6 text-center rounded-full text-sm
                            ${isToday ? 'bg-primary-600 text-white' : ''}
                            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                          `}
                        >
                          {date.date()}
                        </span>
                      </div>
                      
                      {/* Interviews for this day */}
                      <div className="mt-1 space-y-1">
                        {dayInterviews.map(interview => (
                          <div 
                            key={interview._id} 
                            className={`
                              text-xs p-1 rounded truncate cursor-pointer
                              ${interview.status === 'scheduled' ? 'bg-blue-50 border-l-2 border-blue-500' :
                                interview.status === 'completed' ? 'bg-green-50 border-l-2 border-green-500' :
                                'bg-red-50 border-l-2 border-red-500'}
                            `}
                            onClick={() => handleViewDetails(interview._id)}
                          >
                            <p className="font-medium truncate">{interview.applicantName}</p>
                            <p className="text-gray-500 truncate">{dayjs(interview.date).format('h:mm A')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
                
                return days;
              })()}
            </div>
          </div>
        )}
      </div>
      
      {/* Upcoming Interviews */}
      <div className="bg-primary-50 rounded-lg shadow p-6 mb-8 border border-primary-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-700 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Upcoming Interviews
        </h2>
        
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-sm text-primary-600 font-medium">
            {upcomingInterviews.length} upcoming
          </div>
        </div>
        
          {upcomingInterviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentUpcomingInterviews.map(interview => (
              <InterviewCard 
                key={`upcoming-${interview._id}-${interview.date}-${Date.now()}`}
                interview={interview}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
                onEditInterview={handleEditClick}
                className="border-l-4 border-primary-500 shadow-md hover:shadow-lg bg-white hover:bg-primary-50 transition-all"
              />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-primary-100">
              <UpcomingPagination />
            </div>
          </>
          ) : (
            <div className="text-center py-8 col-span-3">
              <CalendarIcon className="w-12 h-12 mx-auto text-primary-300" />
              <p className="mt-2 text-primary-600">
                No upcoming interviews scheduled
              </p>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Schedule Interview
              </button>
            </div>
          )}
      </div>
      
      {/* All Interviews */}
      <div className="bg-gray-50 rounded-lg shadow p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
            All Interviews {interviews.length > 0 && `(${interviews.length})`}
        </h2>
        
          {interviews.length > interviewsPerAllPage && (
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstAllInterview + 1}-{Math.min(indexOfLastAllInterview, interviews.length)} of {interviews.length}
            </div>
          )}
        </div>
        
          {interviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAllInterviews.map(interview => (
              <InterviewCard 
                key={`all-${interview._id}-${interview.date}-${Date.now()}`}
                interview={interview}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
                onEditInterview={handleEditClick}
                className="border-l-4 border-gray-300 hover:shadow-md bg-white hover:bg-gray-100 transition-all"
              />
              ))}
            </div>
            {/* Pagination section with more prominent styling */}
              <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col items-center space-y-3">
                <div className="text-sm text-gray-600">
                  Showing {interviews.length > 0 ? `${indexOfFirstAllInterview + 1}-${Math.min(indexOfLastAllInterview, interviews.length)} of ${interviews.length}` : '0 results'}
                </div>
                <AllInterviewsPagination />
              </div>
            </div>
          </>
          ) : (
            <p className="text-center text-gray-500 col-span-3">No interviews found matching the current filters.</p>
          )}
      </div>
      
      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Schedule Interview</h2>
                <button 
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal content */}
              <form>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="applicant" className="block text-sm font-medium text-gray-700">
                      Applicant
                    </label>
                    <select
                      id="applicant"
                      name="applicant"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      onChange={handleApplicantSelect}
                      defaultValue="none"
                      required
                    >
                      <option value="none" disabled>Select applicant</option>
                      {applicants.map(applicant => (
                        <option key={applicant._id} value={applicant._id}>
                          {applicant.name} - {applicant.jobTitle || 'No position'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedApplicant && (
                    <>
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={interviewForm.date}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                          Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          id="time"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={interviewForm.time}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          name="duration"
                          id="duration"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          value={interviewForm.duration}
                          onChange={handleFormChange}
                          min="15"
                          step="15"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Interview Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          value={interviewForm.type}
                          onChange={handleFormChange}
                        >
                          <option value="technical">Technical</option>
                          <option value="behavioral">Behavioral</option>
                          <option value="cultural">Cultural Fit</option>
                          <option value="screening">Initial Screening</option>
                          <option value="final">Final Round</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <select
                          id="location"
                          name="location"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          value={interviewForm.location}
                          onChange={handleFormChange}
                        >
                          <option value="Zoom">Zoom</option>
                          <option value="Google Meet">Google Meet</option>
                          <option value="Microsoft Teams">Microsoft Teams</option>
                          <option value="In-office">In-office</option>
                          <option value="Phone">Phone</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows="3"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Add any notes for the interviewers..."
                          value={interviewForm.notes}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsScheduleModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-gray-400"
                    disabled={!selectedApplicant}
                    onClick={() => {
                      // Make sure we have all required data
                      if (!selectedApplicant) {
                        toast.error('Please select an applicant');
                        return;
                      }
                      
                      // Prepare data with proper ID handling
                      const interviewData = {
                      ...interviewForm,
                        applicantId: selectedApplicant._id,
                        jobId: selectedApplicant.jobId || 'default_job_id',
                        // Format date properly - ensure it's in ISO format with time
                        date: interviewForm.date && interviewForm.time ? 
                          new Date(`${interviewForm.date}T${interviewForm.time}:00`).toISOString() : 
                          new Date().toISOString()
                      };
                      
                      console.log('Scheduling interview with prepared data:', interviewData);
                      handleScheduleInterview(interviewData);
                    }}
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Interview Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Interview</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal content */}
              <form>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="applicant-name" className="block text-sm font-medium text-gray-700">
                      Applicant
                    </label>
                    <div className="mt-1 block w-full p-2 bg-gray-100 rounded-md">
                      {editingInterview?.applicantName || 'Unknown Applicant'}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="edit-date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={editForm.date}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-time" className="block text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      id="edit-time"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={editForm.time}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      id="edit-duration"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={editForm.duration}
                      onChange={handleEditFormChange}
                      min="15"
                      step="15"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700">
                      Interview Type
                    </label>
                    <select
                      id="edit-type"
                      name="type"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={editForm.type}
                      onChange={handleEditFormChange}
                    >
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="cultural">Cultural Fit</option>
                      <option value="screening">Initial Screening</option>
                      <option value="final">Final Round</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <select
                      id="edit-location"
                      name="location"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={editForm.location}
                      onChange={handleEditFormChange}
                    >
                      <option value="Zoom">Zoom</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="In-office">In-office</option>
                      <option value="Phone">Phone</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="edit-notes"
                      name="notes"
                      rows="3"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Add any notes for the interviewers..."
                      value={editForm.notes}
                      onChange={handleEditFormChange}
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Interviews