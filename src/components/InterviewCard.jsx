import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { 
  CalendarIcon, 
  VideoCameraIcon,
  BriefcaseIcon,
  ClockIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';

const InterviewCard = ({ interview, onStatusChange, onViewDetails, onEditInterview, className = '' }) => {
  const [key, setKey] = useState(Date.now());
  
  useEffect(() => {
    // Force a re-render when the interview data changes
    setKey(Date.now());
  }, [interview, interview?.date, interview?.status, interview?.applicantName]);

  // Guard clause for invalid data
  if (!interview || !interview.date) {
    console.error('Invalid interview data:', interview);
    return null;
  }

  // Ensure applicant name and job title are never null or undefined
  const applicantName = interview.applicantName || 'Unknown Applicant';
  const jobTitle = interview.jobTitle || 'No Position Specified';
  const formattedDate = dayjs(interview.date).format('MMM D, YYYY');
  const formattedTime = dayjs(interview.date).format('h:mm A');

  return (
    <div 
      key={key}
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {applicantName}
          </h3>
          <p className="text-sm text-gray-500">{jobTitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEditInterview) onEditInterview(interview);
            }}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Edit interview"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <span className={`px-2 py-1 text-xs rounded-full ${
            interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            interview.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {interview.status || 'scheduled'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>{formattedDate} at {formattedTime}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <VideoCameraIcon className="w-4 h-4 mr-2" />
          <span>{interview.location || 'No location set'}</span>
        </div>
        
        {interview.type && (
          <div className="flex items-center text-sm text-gray-500">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            <span className="capitalize">{interview.type} Interview</span>
          </div>
        )}
        
        {interview.duration && (
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{interview.duration} minutes</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => onViewDetails(interview._id)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View Details
        </button>
        
        <select
          value={interview.status || 'scheduled'}
          onChange={(e) => onStatusChange(interview._id, e.target.value)}
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
};

export default InterviewCard; 