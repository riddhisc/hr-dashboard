import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  fetchApplicants, 
  fetchApplicantsWithFilters,
  updateApplicantStatus,
  deleteApplicant,
  setApplicantFilter,
  clearApplicantFilters,
  selectFilteredApplicants,
  selectApplicantsStatus,
  selectApplicantsError,
  selectApplicantsFilters
} from '../features/applicants/applicantsSlice'
import { 
  selectAllJobs,
  fetchJobs
} from '../features/jobs/jobsSlice'
import ApplicantCard from '../components/ApplicantCard'
import { FunnelIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

function Applicants() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const applicants = useSelector(selectFilteredApplicants)
  const status = useSelector(selectApplicantsStatus)
  const error = useSelector(selectApplicantsError)
  const filters = useSelector(selectApplicantsFilters)
  const jobs = useSelector(selectAllJobs)
  const [searchTerm, setSearchTerm] = useState('')
  // Get user info to check if it's a Google user
  const { user } = useSelector((state) => state.auth)
  const isGoogleUser = user && user.isGoogleUser
  const searchTimeoutRef = React.useRef(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchApplicants())
    }
  }, [status, dispatch])

  // Add a forced refresh when component mounts to ensure we have latest data
  useEffect(() => {
    console.log('Applicants component mounted - forcing data refresh');
    dispatch(fetchApplicants());
    dispatch(fetchJobs()); // Make sure to fetch jobs data
    
    // Set up periodic refresh every minute while on the page
    const refreshInterval = setInterval(() => {
      console.log('Periodic applicant data refresh');
      dispatch(fetchApplicants());
    }, 60000); // 60 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Add console logging for debugging
  useEffect(() => {
    console.log('Current filters:', filters);
    console.log('Current applicants:', applicants);
  }, [filters, applicants]);

  // Handle search term changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update the search filter in Redux
    dispatch(setApplicantFilter({ search: value }));
    
    // Use fetchApplicantsWithFilters for both regular users and Google users
    // This ensures consistent behavior with other filters
    const updatedFilters = {
      ...filters,
      search: value
    };
    
    // Use a small debounce for search to avoid too many updates
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(fetchApplicantsWithFilters(updatedFilters));
    }, 300);
  }

  const handleStatusChange = (applicantId, newStatus) => {
    dispatch(updateApplicantStatus({ id: applicantId, status: newStatus }))
  }

  const handleDeleteApplicant = (applicantId) => {
    dispatch(deleteApplicant(applicantId))
      .unwrap()
      .then(() => {
        toast.success('Applicant deleted successfully')
        // Refresh the applicants list
        dispatch(fetchApplicants())
      })
      .catch((error) => {
        toast.error(`Failed to delete applicant: ${error}`)
      })
  }

  const handleFilterChange = async (filterType, value) => {
    try {
      const newFilters = { ...filters, [filterType]: value };
      setSearchTerm(filterType === 'search' ? value : searchTerm);
      dispatch(setApplicantFilter(newFilters));
      await dispatch(fetchApplicantsWithFilters(newFilters)).unwrap();
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Error filtering applicants. Using default view instead.');
      // Reset to default view on error
      const defaultFilters = { status: 'all', jobId: 'all', source: 'all', search: '' };
      setSearchTerm('');
      dispatch(setApplicantFilter(defaultFilters));
      dispatch(fetchApplicants());
    }
  };

  const handleViewDetails = (applicantId) => {
    navigate(`/applicants/${applicantId}`)
  }

  // Handle clearing all filters
  const handleClearFilters = () => {
    // Clear the search term
    setSearchTerm('');
    
    // Clear all filters in the Redux store
    dispatch(clearApplicantFilters());
    
    // Fetch all applicants without filters
    dispatch(fetchApplicants());
  }

  // We don't need to filter locally anymore since filtering is handled in the thunk
  // Just use the applicants directly as they're already filtered
  const filteredApplicants = applicants;

  if (status === 'loading' && applicants.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (status === 'failed') {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-500 mt-1">Manage and track all job applicants</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/compare-candidates')}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
            Compare Candidates
          </button>
          <button
            onClick={() => navigate('/add-applicant')}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Applicant
          </button>
        </div>
      </div>

      {/* Google user message */}
      {isGoogleUser && (
        <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700">
          <p>
            This is a demo account. You can add your own applicants, but you won't see the demo data.
          </p>
        </div>
      )}

      {/* No jobs message */}
      {jobs && jobs.length === 0 && (
        <div className="mb-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700">
          <p>
            No job postings found in the system. <button 
              onClick={() => navigate('/jobs/create')} 
              className="text-primary-600 underline font-medium hover:text-primary-800"
            >
              Create a job posting
            </button> to better organize your applicants.
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
              <select
                className="form-select rounded-md border-gray-300 text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <select
              className="form-select rounded-md border-gray-300 text-sm"
              value={filters.jobId}
              onChange={(e) => handleFilterChange('jobId', e.target.value)}
            >
              <option value="all">All Jobs</option>
              {jobs && jobs.length > 0 ? (
                jobs
                  .filter(job => {
                    // Filter out jobs with closed status for both demo and Google users
                    const jobStatus = job.status?.toLowerCase();
                    const isOpen = jobStatus !== 'closed';
                    console.log(`Job "${job.title}" has status "${jobStatus}" - including in dropdown: ${isOpen}`);
                    return isOpen;
                  })
                  .map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))
              ) : (
                <option value="" disabled>No job postings found</option>
              )}
              <option value="other">Other</option>
              <option value="general">General/Future Positions</option>
            </select>
            <select
              className="form-select rounded-md border-gray-300 text-sm"
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="company">Company Website</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
            
            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Applicants</p>
          <p className="text-2xl font-semibold">{applicants.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Shortlisted</p>
          <p className="text-2xl font-semibold text-blue-600">
            {applicants.filter(a => a.status === 'shortlisted').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Interviews</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {applicants.filter(a => a.status === 'interview').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Hired</p>
          <p className="text-2xl font-semibold text-green-600">
            {applicants.filter(a => a.status === 'hired').length}
          </p>
        </div>
      </div>

      {/* Applicant Cards Grid */}
      {filteredApplicants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant._id}
              applicant={applicant}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteApplicant}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">
            {isGoogleUser 
              ? "You haven't added any applicants yet. Click 'Add Applicant' to get started." 
              : "No applicants found matching your criteria."}
          </p>
          {isGoogleUser && (
            <button
              onClick={() => navigate('/add-applicant')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <PlusIcon className="w-5 h-5 inline-block mr-2" />
              Add Your First Applicant
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Applicants 