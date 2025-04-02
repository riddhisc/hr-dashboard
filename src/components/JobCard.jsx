import { MapPinIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'

function JobCard({ job, onStatusChange }) {
  const { user } = useSelector((state) => state.auth)
  const isGoogleUser = user?.isGoogleUser || false

  if (!job) {
    return null;
  }

  console.log('Rendering JobCard for job:', job.title, 'with status:', job.status);

  const { 
    title, 
    location, 
    status, 
    salary = { min: 0, max: 0 }, 
    applications = 0, 
    createdAt, 
    skills = [] 
  } = job

  // Ensure we have a valid lowercase status string for comparison
  const normalizedStatus = (status || 'open').toString().toLowerCase();
  
  // Map 'published' status to 'open' for display purposes
  const displayStatus = normalizedStatus === 'published' ? 'open' : normalizedStatus;
  
  console.log('Normalized status:', normalizedStatus, 'Display status:', displayStatus);

  const handleStatusChange = (e) => {
    e.stopPropagation();
    const newStatus = e.target.value.toLowerCase();
    console.log(`JobCard changing status to: ${newStatus}`);
    onStatusChange(job._id, newStatus);
  }

  // Determine status color class
  const getStatusColorClass = () => {
    if (normalizedStatus === 'open' || normalizedStatus === 'published') {
      return 'bg-green-50 text-green-800 border-green-200';
    } else if (normalizedStatus === 'draft') {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    } else {
      return 'bg-red-50 text-red-800 border-red-200';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          <div className="flex items-center mt-2 text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{location}</span>
          </div>
        </div>
        <div className="flex-shrink-0 min-w-[100px]">
          <select
            value={displayStatus}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className={`w-full px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 capitalize ${getStatusColorClass()}`}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
            <option value="published" className="hidden">Published</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center text-gray-500 flex-shrink-0">
          <CurrencyDollarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm">${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-gray-500 flex-shrink-0">
          <UsersIcon className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm">{applications} applicants</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 overflow-hidden">
        {job.skills?.map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded"
          >
            {skill}
          </span>
        )) || (
          <p className="text-gray-500 text-sm">No specific skills required</p>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className="truncate mr-2">Posted {dayjs(createdAt).format('MMM D, YYYY')}</span>
        <button className="text-primary-600 hover:text-primary-700 whitespace-nowrap flex-shrink-0">
          View Details
        </button>
      </div>
    </div>
  )
}

export default JobCard 