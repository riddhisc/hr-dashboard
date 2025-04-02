import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectJobsError } from '../features/jobs/jobsSlice';
import { selectApplicantsError } from '../features/applicants/applicantsSlice';
import { selectInterviewsError } from '../features/interviews/interviewsSlice';

const BackendStatus = () => {
  const [isBackendDown, setIsBackendDown] = useState(false);
  const jobsError = useSelector(selectJobsError);
  const applicantsError = useSelector(selectApplicantsError);
  const interviewsError = useSelector(selectInterviewsError);

  useEffect(() => {
    // Only mark backend as down if there are actual connection errors
    const hasConnectionError = 
      (jobsError && jobsError.includes('Network Error')) ||
      (applicantsError && applicantsError.includes('Network Error')) ||
      (interviewsError && interviewsError.includes('Network Error'));
    
    setIsBackendDown(hasConnectionError);
  }, [jobsError, applicantsError, interviewsError]);

  if (!isBackendDown) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-3 text-center z-30">
      <div className="container mx-auto">
        <p className="font-medium">
          <span className="mr-2">⚠️</span>
          Backend server is not available. The application is running with mock data.
          <span className="ml-2">⚠️</span>
        </p>
        <p className="text-sm mt-1">
          Please start the backend server to use real data or set USE_MOCK_DATA to true in api.js to use mock data.
        </p>
      </div>
    </div>
  );
};

export default BackendStatus; 