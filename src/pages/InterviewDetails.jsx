import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  updateInterviewStatus,
  editInterview,
  fetchInterviews,
  setInterviews,
  addInterviewFeedback
} from '../redux/slices/interviewsSlice'
import { 
  ArrowLeftIcon,
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  VideoCameraIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function InterviewDetails() {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  // Update this check to include both Google users and demo credentials users
  const isLocalStorageUser = user?.provider === 'google' || user?.isGoogleUser || user?.isDemo === true
  
  // Get interview from Redux state
  const interviews = useSelector(state => state.interviews.interviews);
  const interviewFromRedux = interviews.find(interview => 
    interview._id === interviewId || 
    String(interview._id) === String(interviewId)
  );
  
  const [localInterview, setLocalInterview] = useState(null);
  // Use local interview state if available, otherwise use from Redux
  const interview = localInterview || interviewFromRedux;
  
  const [feedback, setFeedback] = useState('')
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 3,
    strengths: '',
    weaknesses: '',
    notes: '',
    recommendation: 'consider' // Changed from 'undecided' to 'consider'
  })
  const [loading, setLoading] = useState(!interview)
  const [error, setError] = useState(null)
  const [renderError, setRenderError] = useState(null)
  const [displayFeedback, setDisplayFeedback] = useState('');
  
  // Create a ref for the feedback textarea
  const feedbackRef = useRef(null);
  
  // Function to format feedback from object to displayable string
  const formatFeedbackObject = (feedback) => {
    try {
      if (!feedback || typeof feedback !== 'object') {
        return 'No feedback available';
      }
      
      let formattedFeedback = '';
      
      // Format recommendation with proper capitalization and clear description
      if (feedback.recommendation) {
        let recommendationText = '';
        
        switch(feedback.recommendation) {
          case 'hire':
            recommendationText = 'Hire';
            break;
          case 'reject':
            recommendationText = 'Reject';
            break;
          case 'consider':
            recommendationText = 'Consider';
            break;
          default:
            recommendationText = feedback.recommendation.charAt(0).toUpperCase() + 
                                 feedback.recommendation.slice(1);
        }
        
        formattedFeedback += `Recommendation: ${recommendationText}\n\n`;
      }
      
      // Handle strengths
      if (feedback.strengths && feedback.strengths.trim()) {
        formattedFeedback += `Strengths: ${feedback.strengths}\n\n`;
      }
      
      // Handle weaknesses
      if (feedback.weaknesses && feedback.weaknesses.trim()) {
        formattedFeedback += `Areas for Improvement: ${feedback.weaknesses}\n\n`;
      }
      
      // Handle notes
      if (feedback.notes && feedback.notes.trim()) {
        formattedFeedback += `Additional Notes: ${feedback.notes}\n\n`;
      }
      
      return formattedFeedback.trim() || 'No detailed feedback provided';
    } catch (error) {
      console.error('Error formatting feedback:', error);
      return 'Error formatting feedback';
    }
  };
  
  // Effect to update the displayFeedback when interview changes
  useEffect(() => {
    try {
      // First check if interview exists
      if (!interview) {
        setDisplayFeedback('');
        return;
      }
      
      // Check if feedback exists and is valid
      const feedbackExists = 
        interview.feedback && 
        (
          (typeof interview.feedback === 'object' && Object.keys(interview.feedback).length > 0) || 
          (typeof interview.feedback === 'string' && interview.feedback.trim() !== '')
        );
      
      if (feedbackExists) {
        // Format the feedback
        const formattedFeedback = typeof interview.feedback === 'object'
          ? formatFeedbackObject(interview.feedback)
          : interview.feedback.toString(); // Convert to string in case it's something else
        
        console.log('Setting display feedback to:', formattedFeedback);
        setDisplayFeedback(formattedFeedback);
      } else {
        console.log('No valid feedback found, setting to empty string');
        setDisplayFeedback('');
      }
    } catch (error) {
      console.error('Error updating display feedback:', error);
      setDisplayFeedback('Error displaying feedback');
    }
  }, [interview]); // Use interview instead of localInterview to catch all updates
  
  // Helper function to create and save a placeholder interview
  const createPlaceholderInterview = (useExistingId = true) => {
    // Generate a unique ID - either use the original or create a new one
    const localId = useExistingId ? interviewId : `local_${Date.now()}`;
    
    // Create a placeholder interview
    const placeholderInterview = {
      _id: localId,
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
    
    // Show a notification
    toast.info('Creating a new interview record. This will be saved in your browser.');
    
    // Save to localStorage directly
    try {
      const storageKey = 'google_user_interviews';
      const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
      let storedInterviews = JSON.parse(storedInterviewsJSON);
      
      // Check if interview with this ID already exists
      const existingIndex = storedInterviews.findIndex(i => 
        i._id === localId || 
        String(i._id) === String(localId)
      );
      
      if (existingIndex !== -1) {
        console.log('Interview with this ID already exists in localStorage, using existing');
        placeholderInterview._id = storedInterviews[existingIndex]._id;
        return storedInterviews[existingIndex];
      }
      
      // Add the new interview
      storedInterviews.push(placeholderInterview);
      localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
      
      // Update Redux
      dispatch(setInterviews(storedInterviews));
      console.log('Saved new interview to localStorage:', placeholderInterview);
    } catch (storageError) {
      console.error('Error saving to localStorage:', storageError);
    }
    
    return placeholderInterview;
  };
  
  // Load interview data on component mount
  useEffect(() => {
    const loadInterviewData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Loading interview with ID: ${interviewId}, isLocalStorageUser: ${isLocalStorageUser}`);
        
        // Special case: For localStorage users with MongoDB IDs
        // First check localStorage directly
        if (isLocalStorageUser && interviewId && interviewId.length === 24) {
          try {
            const storageKey = 'google_user_interviews';
            const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
            const storedInterviews = JSON.parse(storedInterviewsJSON);
            
            // Check if this interview already exists in localStorage
            const existingInterview = storedInterviews.find(i => 
              i._id === interviewId || 
              String(i._id) === String(interviewId)
            );
            
            if (existingInterview) {
              console.log('MongoDB-format ID found in localStorage, using that');
              setLocalInterview(existingInterview);
              setLoading(false);
              return;
            }
            
            // If it doesn't exist and we're a demo user,
            // create a placeholder right away for MongoDB-style IDs
            console.log('MongoDB-format ID not found, creating placeholder for demo user');
            const placeholderInterview = createPlaceholderInterview(true);
            setLocalInterview(placeholderInterview);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error checking localStorage:', error);
            // Continue with normal flow
          }
        }
        
        // Normal flow - try to fetch from backend/redux
        const resultAction = await dispatch(fetchInterviews());
        
        if (resultAction.type === fetchInterviews.fulfilled.type) {
          console.log('Fetched interviews successfully');
          
          // Now find the specific interview by ID
          const fetchedInterviews = resultAction.payload;
          const foundInterview = fetchedInterviews.find(i => 
            i._id === interviewId || 
            String(i._id) === String(interviewId)
          );
          
          if (foundInterview) {
            console.log('Found interview in fetched data:', foundInterview);
            setLocalInterview(foundInterview);
          } else {
            console.log('Interview not found in fetched data');
            
            // For localStorage users, create a placeholder
            if (isLocalStorageUser) {
              console.log('Creating placeholder for localStorage user after fetch failure');
              const placeholderInterview = createPlaceholderInterview(true);
              setLocalInterview(placeholderInterview);
            } else {
              // Regular user - show the not found error
              setError(`Interview with ID ${interviewId} doesn't exist. You may create a new interview instead.`);
            }
          }
        } else {
          console.error('Failed to fetch interview:', resultAction.error);
          
          // Check for specific error messages
          const errorMessage = resultAction.error?.message || '';
          
          if (errorMessage.includes('not found in the database')) {
            // For localStorage users, create a placeholder
            if (isLocalStorageUser) {
              console.log('Creating placeholder for localStorage user after fetch failure');
              const placeholderInterview = createPlaceholderInterview(true);
              setLocalInterview(placeholderInterview);
            } else {
              // Regular user - show the not found error
              setError(`Interview with ID ${interviewId} doesn't exist. You may create a new interview instead.`);
            }
          } else {
            // Generic error
            setError(`Error loading interview: ${errorMessage || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Error in loadInterviewData:', error);
        setError(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (interviewId) {
      loadInterviewData();
    }
  }, [dispatch, interviewId, isLocalStorageUser, createPlaceholderInterview]);

  // Add this to ensure the component updates when the interview changes
  useEffect(() => {
    // If the interview loaded after the initial load, clear any errors
    if (interview && error) {
      setError(null);
    }
  }, [interview, error]);

  // Add an effect to refresh the data when returning to the page
  useEffect(() => {
    const refreshInterviewData = async () => {
      if (interviewId) {
        try {
          console.log('Refreshing interview data for ID:', interviewId);
          const resultAction = await dispatch(fetchInterviews());
          
          if (resultAction.type === fetchInterviews.fulfilled.type) {
            console.log('Successfully refreshed interview data');
            // Update local state with the fresh data
            const fetchedInterviews = resultAction.payload;
            const foundInterview = fetchedInterviews.find(i => 
              i._id === interviewId || 
              String(i._id) === String(interviewId)
            );
            
            if (foundInterview) {
              console.log('Found interview in refreshed data:', foundInterview);
              setLocalInterview(foundInterview);
            } else {
              console.log('Interview not found in refreshed data');
              
              // For localStorage users, create a placeholder
              if (isLocalStorageUser) {
                console.log('Creating placeholder for localStorage user after refresh failure');
                const placeholderInterview = createPlaceholderInterview(true);
                setLocalInterview(placeholderInterview);
              } else {
                // Regular user - show the not found error
                setError(`Interview with ID ${interviewId} doesn't exist. You may create a new interview instead.`);
              }
            }
          } else {
            console.error('Failed to refresh interview data:', resultAction.error);
          }
        } catch (error) {
          console.error('Error refreshing interview data:', error);
        }
      }
    };
    
    // Refresh data when the component mounts
    refreshInterviewData();
    
    // Set up interval to refresh data (optional)
    // const intervalId = setInterval(refreshInterviewData, 30000); // every 30 seconds
    
    // Clean up interval on unmount
    // return () => clearInterval(intervalId);
  }, [dispatch, interviewId]);

  // Update form fields when interview feedback changes
  useEffect(() => {
    if (interview?.feedback && typeof interview.feedback === 'object') {
      // If there's feedback in the interview data, update the form fields
      setFeedbackForm({
        rating: interview.feedback.rating || 3,
        strengths: interview.feedback.strengths || '',
        weaknesses: interview.feedback.weaknesses || '',
        notes: interview.feedback.notes || '',
        recommendation: interview.feedback.recommendation || 'consider'
      });
      console.log('Updated form fields from interview feedback:', interview.feedback);
    }
  }, [interview?.feedback]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading interview details...</div>
  }
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-600 mb-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => navigate('/interviews')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Interviews List
          </button>
          {error.includes("doesn't exist") && (
            <button 
              onClick={() => navigate('/interviews/new')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create New Interview
            </button>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-600 mb-4 text-center max-w-md">
          <p className="text-lg font-semibold mb-2">Interview Not Found</p>
          <p>The interview you're looking for could not be found. It may have been deleted or the ID may be incorrect.</p>
        </div>
        <button 
          onClick={() => navigate('/interviews')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Interviews List
        </button>
      </div>
    )
  }

  if (renderError) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-600 mb-4">Error displaying interview: {renderError}</p>
        <button 
          onClick={() => navigate('/interviews')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Back to Interviews
        </button>
      </div>
    )
  }

  try {
    // Add additional defensive checks
    const interviewData = {
      ...interview,
      applicantName: interview.applicantName || 'Unnamed Applicant',
      jobTitle: interview.jobTitle || 'No Position',
      status: interview.status || 'scheduled',
      duration: interview.duration || 60,
      interviewers: Array.isArray(interview.interviewers) ? interview.interviewers : [],
      location: interview.location || 'Not specified',
      type: interview.type || 'technical',
      notes: interview.notes || '',
      feedback: interview.feedback || ''
    };

    // Display Feedback is now managed in state via useEffect

  const handleStatusChange = async (newStatus) => {
      try {
        toast.info(`Updating interview status to ${newStatus}...`);
        
        if (!interview || !interview._id) {
          toast.error("Cannot update status: Invalid interview data");
          return;
        }
        
      setLoading(true);
      
      // For localStorage users, directly update localStorage first as a safety measure
      if (isLocalStorageUser) {
        try {
          // Get current interviews from localStorage
          const storageKey = 'google_user_interviews';
          const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
          const storedInterviews = JSON.parse(storedInterviewsJSON);
          
          // Find the interview in localStorage
          const index = storedInterviews.findIndex(i => 
            i._id === interview._id || 
            String(i._id) === String(interview._id)
          );
          
          if (index !== -1) {
            // Update the interview with new status
            storedInterviews[index] = {
              ...storedInterviews[index],
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
            console.log('Directly updated localStorage interview:', storedInterviews[index]);
            
            // Also update Redux store
            dispatch(setInterviews(storedInterviews));
          } else {
            console.warn('Interview not found in localStorage, will try to add it');
            // Add the interview to localStorage
            const updatedInterview = {
              ...interview,
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
            
            storedInterviews.push(updatedInterview);
            localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
            
            // Update Redux store
            dispatch(setInterviews(storedInterviews));
          }
        } catch (localStorageError) {
          console.error('Error directly updating localStorage:', localStorageError);
        }
      }
      
      // Prepare the payload
      const payload = { 
      id: interview._id, 
        status: newStatus
      };
      
      // Dispatch the action to update status
      const resultAction = await dispatch(updateInterviewStatus(payload));
      
      if (resultAction.type === updateInterviewStatus.fulfilled.type) {
        // Handle successful status update
        const updatedInterview = resultAction.payload;
        console.log('Status updated successfully:', updatedInterview);
        
        // Update the local state with the updated interview
        setLocalInterview(prev => ({
          ...prev,
          ...updatedInterview,
          status: newStatus // Ensure the status is explicitly set
        }));
        
          toast.success(`Interview status updated to ${newStatus}`);
      } else {
        console.error('Failed to update interview status:', resultAction.error);
        
        if (isLocalStorageUser) {
          // For localStorage users, we've already updated localStorage directly
          // so we can still update the local state
          setLocalInterview(prev => ({
            ...prev,
            status: newStatus
          }));
          
          toast.info(`Status saved locally to ${newStatus}`);
        } else {
          toast.error(`Failed to update status: ${resultAction.error?.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Unexpected error in handleStatusChange:', error);
      toast.error('An unexpected error occurred while updating the status');
    } finally {
      setLoading(false);
    }
  };

    const handleSubmitFeedback = async (e) => {
      e.preventDefault();
      
      try {
        // Get feedback data from form or textarea
        let feedbackData;
        
        // Check if the textarea has content
        const feedbackText = feedbackRef.current?.value?.trim() || '';
        
        if (feedbackText) {
          try {
            // Try to parse as JSON if it's in the textarea
            feedbackData = JSON.parse(feedbackText);
            console.log('Using JSON feedback from textarea:', feedbackData);
          } catch (error) {
            // If not valid JSON, use as plain text in the notes field
            console.log('Using plain text feedback in notes field');
            feedbackData = {
              ...feedbackForm,
              notes: feedbackText // Override notes with textarea content
            };
          }
        } else {
          // Use the form data directly
          feedbackData = {
            ...feedbackForm
          };
          console.log('Using form data for feedback:', feedbackData);
        }
        
        // Validate
        if (!feedbackData || (
          !feedbackData.notes && 
          !feedbackData.strengths && 
          !feedbackData.weaknesses
        )) {
          toast.error('Please provide some feedback before submitting');
          return;
        }
        
        setLoading(true);
        console.log(`Submitting feedback for interview ${interviewId}`);
        
        // For localStorage users, directly update localStorage first
        if (isLocalStorageUser) {
          try {
            // Get current interviews from localStorage
            const storageKey = 'google_user_interviews';
            const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
            const storedInterviews = JSON.parse(storedInterviewsJSON);
            
            // Find the interview in localStorage
            const index = storedInterviews.findIndex(i => 
              i._id === interview._id || 
              String(i._id) === String(interview._id)
            );
            
            if (index !== -1) {
              // Update the interview with new feedback
              storedInterviews[index] = {
                ...storedInterviews[index],
                feedback: feedbackData,
                updatedAt: new Date().toISOString()
              };
              
              // Save back to localStorage
              localStorage.setItem(storageKey, JSON.stringify(storedInterviews));
              console.log('Directly updated localStorage interview with feedback:', storedInterviews[index]);
              
              // Also update Redux store
              dispatch(setInterviews(storedInterviews));
              
              // Update local state
              setLocalInterview(prev => ({
                ...prev,
                feedback: feedbackData
              }));
              
              toast.success('Feedback submitted successfully!');
            } else {
              console.warn('Interview not found in localStorage for feedback update');
              toast.error('Could not find the interview to update');
            }
          } catch (localStorageError) {
            console.error('Error directly updating localStorage with feedback:', localStorageError);
            toast.error('Error saving feedback to local storage');
          }
        } else {
          // For non-localStorage users, use the API via Redux
        const feedbackPayload = {
            interviewId: interview._id,
          feedbackData: feedbackData
        };
        
        const resultAction = await dispatch(addInterviewFeedback(feedbackPayload));
        
          if (resultAction.type === addInterviewFeedback.fulfilled.type) {
          console.log('Feedback added successfully, updatedInterview:', resultAction.payload);
          
            // Update local state
            setLocalInterview(prev => ({
              ...prev,
              feedback: feedbackData
            }));
            
            toast.success('Feedback submitted successfully!');
          } else {
            console.error('Error adding feedback:', resultAction.error);
            toast.error(`Failed to submit feedback: ${resultAction.error?.message || 'Unknown error'}`);
          }
        }
          
          // Reset the form fields for next use
          setFeedbackForm({
            rating: 3,
            strengths: '',
            weaknesses: '',
            notes: '',
            recommendation: 'consider'
          });
          
        // Clear the textarea
          if (feedbackRef.current) {
            feedbackRef.current.value = '';
        }
      } catch (error) {
        console.error('Error in handleSubmitFeedback:', error);
        toast.error(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const locationIcons = {
    'Zoom': <VideoCameraIcon className="w-5 h-5 text-blue-500" />,
    'Google Meet': <VideoCameraIcon className="w-5 h-5 text-red-500" />,
    'Microsoft Teams': <VideoCameraIcon className="w-5 h-5 text-purple-500" />,
    'In-office': <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />,
    'Phone': <PhoneIcon className="w-5 h-5 text-gray-500" />
  }

    // Safely format date and time with defensive checks
    const formattedDate = interview.date ? dayjs(interview.date).format('MMMM D, YYYY') : 'Date not set'
    const formattedTime = interview.date ? dayjs(interview.date).format('h:mm A') : 'Time not set'

  // Debug function for localStorage
  const debugLocalStorage = () => {
    try {
      const storageKey = 'google_user_interviews';
      const storedInterviewsJSON = localStorage.getItem(storageKey) || '[]';
      const storedInterviews = JSON.parse(storedInterviewsJSON);
      
      console.group('LocalStorage Debug');
      console.log('All interviews in localStorage:', storedInterviews);
      
      if (interviewId) {
        const interview = storedInterviews.find(i => 
          i._id === interviewId || 
          String(i._id) === String(interviewId)
        );
        
        if (interview) {
          console.log('Current interview in localStorage:', interview);
          console.log('Status:', interview.status);
          console.log('Last updated:', interview.updatedAt);
        } else {
          console.log('Current interview not found in localStorage!');
        }
      }
      
      console.log('Current user:', user);
      console.log('isLocalStorageUser:', isLocalStorageUser);
      console.groupEnd();
      
      toast.info('Check console for localStorage debug info');
    } catch (error) {
      console.error('Error debugging localStorage:', error);
      toast.error('Error debugging localStorage');
    }
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
        <button
          onClick={() => navigate('/interviews')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Interview Details</h1>
        </div>
        <button
          onClick={() => navigate('/question-bank')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
          Question Bank
        </button>
      </div>

      {/* Google user message */}
      {isLocalStorageUser && (
        <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700">
          <div className="flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-2" />
            <div>
              <p className="font-medium">This is a demo account</p>
              <p className="text-sm">Your interview data is stored locally in your browser.</p>
            </div>
          </div>
        </div>
      )}

      {/* Interview details card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
                  <h2 className="text-xl font-semibold text-gray-900">{interviewData.applicantName}</h2>
                  <p className="text-sm text-gray-500 mt-1">{interviewData.jobTitle}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[interviewData.status] || 'bg-gray-100 text-gray-800'}`}>
                  {interviewData.status.charAt(0).toUpperCase() + interviewData.status.slice(1)}
                </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center text-gray-500">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <ClockIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{formattedTime} ({interviewData.duration} min)</span>
              </div>
              <div className="flex items-center text-gray-500">
                <UserIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {interviewData.interviewers && interviewData.interviewers.length > 0 
                        ? (typeof interviewData.interviewers.join === 'function' 
                            ? interviewData.interviewers.join(', ') 
                            : 'No interviewers assigned')
                        : 'No interviewers assigned'}
                    </span>
                </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                    {locationIcons[interviewData.location] || <MapPinIcon className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm text-gray-500 ml-2">{interviewData.location}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 capitalize">
                      {interviewData.type} Interview
                </span>
                </div>
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Notes</h3>
          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                {interviewData.notes || 'No notes provided.'}
            </div>
        </div>

        {/* Status Change Options */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Management</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusChange('scheduled')}
              disabled={interviewData.status === 'scheduled' || loading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${interviewData.status === 'scheduled' 
                  ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              Mark as Scheduled
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={interviewData.status === 'completed' || loading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${interviewData.status === 'completed'
                  ? 'bg-green-100 text-green-400 cursor-not-allowed'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              Mark as Completed
            </button>
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={interviewData.status === 'cancelled' || loading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${interviewData.status === 'cancelled'
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              Mark as Cancelled
            </button>
            
            {isLocalStorageUser && (
              <button
                onClick={debugLocalStorage}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors ml-auto"
              >
                Debug Storage
              </button>
            )}
          </div>
          {loading && (
            <div className="mt-2 text-gray-500 text-sm">
              Updating status...
            </div>
          )}
        </div>

          {/* Feedback Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback</h3>
            
            {displayFeedback ? (
              <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  {interview?.feedback?.rating && (
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg 
                            key={star} 
                            className={`w-6 h-6 ${star <= interview.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap text-base">
                    {displayFeedback}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">No feedback has been provided yet.</p>
            )}
            
            <h4 className="text-lg font-medium mb-3">Add Feedback</h4>
            <form onSubmit={handleSubmitFeedback} className="space-y-5 bg-white rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-1">
                    Strengths
                  </label>
                  <textarea
                    id="strengths"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="What were the candidate's strengths?"
                    onChange={(e) => setFeedbackForm({...feedbackForm, strengths: e.target.value})}
                    value={feedbackForm.strengths}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-700 mb-1">
                    Areas for Improvement
                  </label>
                  <textarea
                    id="weaknesses"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="What areas could the candidate improve?"
                    onChange={(e) => setFeedbackForm({...feedbackForm, weaknesses: e.target.value})}
                    value={feedbackForm.weaknesses}
                  ></textarea>
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Any additional notes or observations about the candidate"
                  onChange={(e) => setFeedbackForm({...feedbackForm, notes: e.target.value})}
                  value={feedbackForm.notes}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-5)
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFeedbackForm({...feedbackForm, rating})}
                        className={`w-10 h-10 rounded-full focus:outline-none text-lg font-medium ${
                          feedbackForm.rating >= rating 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700 mb-1">
                    Recommendation
                  </label>
                  <select
                    id="recommendation"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFeedbackForm({...feedbackForm, recommendation: e.target.value})}
                    value={feedbackForm.recommendation}
                  >
                    <option value="consider">Consider</option>
                    <option value="hire">Hire</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    // Convert form data to JSON in the textarea for submission
                    if (feedbackRef.current) {
                      feedbackRef.current.value = JSON.stringify(feedbackForm);
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
                >
                  Apply to Form
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-1">
                  Raw Feedback (JSON or Plain Text)
                </label>
                <textarea
                  ref={feedbackRef}
                  id="feedbackText"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows="5"
                  placeholder="You can directly enter feedback in JSON format or click 'Apply to Form' to convert the form data to JSON."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Advanced: You can directly enter feedback in JSON format or click 'Apply to Form' to convert the form data to JSON.
                </p>
              </div>
            </form>
          </div>
      </div>

      {/* Interview Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('scheduled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              interview?.status === 'scheduled'
                ? 'bg-green-100 text-green-800 cursor-default'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={interview?.status === 'scheduled'}
          >
            Mark as Scheduled
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              interview?.status === 'completed'
                ? 'bg-blue-100 text-blue-800 cursor-default'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={interview?.status === 'completed'}
          >
            Mark as Completed
          </button>
          <button
            onClick={() => handleStatusChange('canceled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              interview?.status === 'canceled'
                ? 'bg-red-100 text-red-800 cursor-default'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={interview?.status === 'canceled'}
          >
            Mark as Canceled
          </button>
          {/* <button
            onClick={() => navigate('/scheduler')}
            className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Open Scheduler
          </button> */}
          </div>
      </div>
    </div>
  )
  } catch (renderErr) {
    console.error('Error rendering interview details:', renderErr);
    setRenderError(renderErr.message || 'Unknown rendering error');
    
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-600 mb-4">Error displaying interview details</p>
        <button 
          onClick={() => navigate('/interviews')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Back to Interviews
        </button>
      </div>
    )
  }
}

export default InterviewDetails 