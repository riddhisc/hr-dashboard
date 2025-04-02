import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  fetchJobs, 
  createJob,
  selectFilteredJobs, 
  selectJobsStatus, 
  selectJobsError,
  updateJob,
  setJobFilter,
  deleteJob
} from '../features/jobs/jobsSlice'
import JobCard from '../components/JobCard'
import JobForm from '../components/JobForm'
import { PlusIcon, FunnelIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline'

function JobPostings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const jobs = useSelector(selectFilteredJobs)
  const status = useSelector(selectJobsStatus)
  const error = useSelector(selectJobsError)
  const { user } = useSelector((state) => state.auth)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Check if user is a Google user
  const isGoogleUser = user?.isGoogleUser || false;

  useEffect(() => {
    // Always fetch jobs when the component mounts to ensure we have the latest data
    dispatch(fetchJobs())
  }, [dispatch])

  const handleStatusChange = (jobId, newStatus) => {
    console.log(`Changing job status: jobId=${jobId}, newStatus=${newStatus}, isGoogleUser=${isGoogleUser}`);
    
    if (isGoogleUser) {
      // For Google users, update job status in localStorage
      const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
      try {
        const googleJobs = JSON.parse(googleJobsJSON);
        console.log('Current jobs in localStorage:', googleJobs);
        
        const jobIndex = googleJobs.findIndex(job => job._id === jobId);
        console.log('Found job at index:', jobIndex);
        
        if (jobIndex !== -1) {
          // Make sure status is lowercase to match what Dashboard is checking for
          googleJobs[jobIndex].status = newStatus.toLowerCase();
          googleJobs[jobIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('google_user_jobs', JSON.stringify(googleJobs));
          console.log('Updated localStorage with new status:', googleJobs[jobIndex].status);
          
          // Refresh jobs list
          dispatch(fetchJobs());
        }
      } catch (error) {
        console.error('Error updating job status in localStorage:', error);
      }
      return;
    }
    dispatch(updateJob({ id: jobId, jobData: { status: newStatus } }))
  }

  const handleFilterChange = (filterType, value) => {
    console.log(`Setting ${filterType} filter to ${value}`);
    
    // Create the filter object
    const filterObj = {};
    filterObj[filterType] = value;
    
    console.log('Dispatching filter object:', filterObj);
    
    // Dispatch the action
    dispatch(setJobFilter(filterObj));
    
    console.log('Filter updated');
  }

  const handleJobSubmit = (jobData) => {
    // Ensure status is lowercase for consistency
    const formattedJobData = {
      ...jobData,
      status: (jobData.status || 'open').toLowerCase()
    };
    
    console.log('Submitting job with data:', formattedJobData);
    
    dispatch(createJob(formattedJobData))
      .unwrap()
      .then((createdJob) => {
        setIsCreateModalOpen(false)
        // Navigate to the newly created job details page
        if (createdJob && createdJob._id) {
          navigate(`/jobs/${createdJob._id}`)
        }
      })
      .catch((error) => {
        console.error('Failed to create job:', error)
      })
  }

  const handleJobCardClick = (jobId) => {
    if (jobId) {
      navigate(`/jobs/${jobId}`)
    }
  }

  if (status === 'loading' && jobs.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (status === 'failed') {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 mt-1">Manage and track all job positions</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <div className="min-w-[180px]">
            <div className="flex items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white">
              <FunnelIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <select
                className="appearance-none bg-transparent border-0 w-full pr-8 text-sm focus:ring-0 focus:outline-none"
                onChange={(e) => {
                  console.log('Selected status:', e.target.value);
                  handleFilterChange('status', e.target.value);
                }}
                defaultValue="all"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="min-w-[180px]">
            <div className="flex items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white">
              <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <select
                className="appearance-none bg-transparent border-0 w-full pr-8 text-sm focus:ring-0 focus:outline-none"
                onChange={(e) => handleFilterChange('location', e.target.value)}
                defaultValue="all"
              >
                <option value="all">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="Onsite">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} onClick={() => handleJobCardClick(job._id)} className="cursor-pointer relative">
              <JobCard
                job={job}
                onStatusChange={(id, status) => {
                  handleStatusChange(id, status);
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <p>No job postings found. Create your first job posting!</p>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create New Job</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <JobForm 
              onSubmit={handleJobSubmit} 
              onCancel={() => setIsCreateModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default JobPostings 