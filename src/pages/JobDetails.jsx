import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  selectJobById, 
  updateJob,
  deleteJob,
  fetchJobById,
  fetchJobs
} from '../features/jobs/jobsSlice'
import { 
  MapPinIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import JobForm from '../components/JobForm'

function JobDetails() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const job = useSelector(state => selectJobById(state, jobId))
  const { user } = useSelector((state) => state.auth)
  const isGoogleUser = user?.isGoogleUser || false
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // First ensure we have all jobs loaded
    dispatch(fetchJobs())
      .unwrap()
      .then(() => {
        if (jobId) {
          // Then fetch the specific job details
          dispatch(fetchJobById(jobId))
            .unwrap()
            .catch(error => {
              console.error('Error fetching job details:', error)
              navigate('/jobs')
            })
            .finally(() => {
              setIsLoading(false)
            })
        } else {
          navigate('/jobs')
        }
      })
      .catch(error => {
        console.error('Error fetching jobs:', error)
        setIsLoading(false)
      })
  }, [jobId, dispatch, navigate])
  
  useEffect(() => {
    if (!isLoading && !job && jobId) {
      // Job not found after loading, redirect to jobs list
      navigate('/jobs')
    }
  }, [job, jobId, navigate, isLoading])

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!job) {
    return <div className="flex justify-center items-center h-64">Job not found. Redirecting...</div>
  }

  const handleStatusChange = (newStatus) => {
    console.log(`Changing job status from ${job.status} to ${newStatus}`);
    
    if (isGoogleUser) {
      // For Google users, update job status in localStorage
      const googleJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
      try {
        const googleJobs = JSON.parse(googleJobsJSON);
        const jobIndex = googleJobs.findIndex(j => j._id === job._id);
        
        if (jobIndex !== -1) {
          googleJobs[jobIndex].status = newStatus;
          googleJobs[jobIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('google_user_jobs', JSON.stringify(googleJobs));
          
          // Refresh jobs to see the update
          dispatch(fetchJobs());
          
          // Also refresh this specific job
          dispatch(fetchJobById(job._id));
        }
      } catch (error) {
        console.error('Error updating job status in localStorage:', error);
      }
      return;
    }
    
    // For regular users
    dispatch(updateJob({ id: job._id, jobData: { status: newStatus } }))
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }
  
  const confirmDelete = () => {
    dispatch(deleteJob(job._id))
      .unwrap()
      .then(() => {
        navigate('/jobs')
      })
      .catch((error) => {
        console.error('Failed to delete job:', error)
      })
  }
  
  const handleUpdateJob = (updatedJobData) => {
    dispatch(updateJob({ id: job._id, jobData: updatedJobData }))
      .unwrap()
      .then(() => {
        setIsEditing(false)
        // Refresh job details
        dispatch(fetchJobById(job._id))
      })
      .catch((error) => {
        console.error('Failed to update job:', error)
      })
  }

  const statusColors = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800'
  }

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => setIsEditing(false)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <JobForm 
            initialData={job} 
            onSubmit={handleUpdateJob} 
            onCancel={() => setIsEditing(false)} 
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/jobs')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
      </div>

      {/* Job details card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <div className="flex items-center mt-2 text-gray-500">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">{job.location}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center text-gray-500">
              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">${job.salary?.min?.toLocaleString() || 0} - ${job.salary?.max?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">{job.applications || 0} applicants</span>
            </div>
            <div className="flex items-center text-gray-500">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span className="text-sm">Posted {dayjs(job.createdAt || new Date()).format('MMM D, YYYY')}</span>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Description</h3>
          <div className="prose max-w-none text-gray-700">
            <p>{job.description}</p>
          </div>
        </div>

        {/* Requirements section */}
        {job.requirements && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
            <div className="prose max-w-none text-gray-700">
              <p>{job.requirements}</p>
            </div>
          </div>
        )}

        {/* Skills section */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills?.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-sm font-medium bg-primary-50 text-primary-700 rounded-full"
              >
                {skill}
              </span>
            )) || (
              <p className="text-gray-500">No specific skills required</p>
            )}
          </div>
        </div>

        {/* Applicants section */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Applicants</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          {job.applications > 0 ? (
            <div className="space-y-4">
              {/* This would be a list of applicants in a real app */}
              <div className="p-4 bg-white rounded-md shadow-sm">
                <p className="text-gray-500 text-sm">Applicant data would be displayed here</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No applicants yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete this job posting? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails 