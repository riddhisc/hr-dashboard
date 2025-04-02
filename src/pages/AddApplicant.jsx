import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { createApplicant } from '../features/applicants/applicantsSlice'
import { fetchJobs, selectAllJobs } from '../features/jobs/jobsSlice'
import { 
  ArrowLeftIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

function AddApplicant() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const jobs = useSelector(selectAllJobs)
  const { user } = useSelector((state) => state.auth)
  const isGoogleUser = user && user.isGoogleUser
  
  const [resumeFile, setResumeFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicant, setApplicant] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: '',
    jobTitle: '',
    status: 'pending',
    source: 'linkedin',
    notes: '',
    appliedDate: dayjs().format('YYYY-MM-DD'),
    applicationCategory: 'specific-job' // Default to specific job application
  })

  useEffect(() => {
    // Fetch jobs if not already loaded
    if (jobs.length === 0) {
      dispatch(fetchJobs())
    }
  }, [dispatch, jobs.length])

  useEffect(() => {
    // If application type is general, clear the jobId field
    if (applicant.applicationCategory === 'general') {
      setApplicant(prev => ({
        ...prev,
        jobId: 'general'
      }))
    }
  }, [applicant.applicationCategory])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'jobId' && value) {
      // Find the selected job to get its title
      if (value === 'other') {
        // For "Other" option, clear the job title to let user enter manually
        setApplicant(prev => ({
          ...prev,
          [name]: value,
          jobTitle: '' // Clear the job title for manual entry
        }))
      } else {
        // For existing jobs, get the title from the selected job
        const selectedJob = jobs.find(job => job._id === value)
        if (selectedJob) {
          setApplicant(prev => ({
            ...prev,
            [name]: value,
            jobTitle: selectedJob.title
          }))
          return
        }
      }
    }

    // If changing to general application type, set jobId to 'general'
    if (name === 'applicationCategory' && value === 'general') {
      setApplicant(prev => ({
        ...prev,
        [name]: value,
        jobId: 'general'
      }))
      return
    }
    
    setApplicant(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validate form
      if (!applicant.name || !applicant.email) {
        toast.error('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      // Validate job selection for specific job applications
      if (applicant.applicationCategory === 'specific-job' && (!applicant.jobId || applicant.jobId === 'general')) {
        toast.error('Please select a job position for specific job application')
        setIsSubmitting(false)
        return
      }
      
      // Validate job title for "Other" option
      if (applicant.jobId === 'other' && !applicant.jobTitle) {
        toast.error('Please enter a job title')
        setIsSubmitting(false)
        return
      }
      
      // For non-Google users, we'll still request a resume but make it optional
      if (!resumeFile && !isGoogleUser) {
        toast.warning('No resume selected - applicant will be created without a resume')
      }
      
      // Format phone number if it's just digits
      let formattedPhone = applicant.phone
      if (applicant.phone && /^\d{10}$/.test(applicant.phone)) {
        formattedPhone = `(${applicant.phone.substring(0, 3)}) ${applicant.phone.substring(3, 6)}-${applicant.phone.substring(6)}`
      }
      
      // Prepare the JSON version of applicant data in all cases for fallback
      const jsonApplicantData = {
        ...applicant,
        phone: formattedPhone || '',
        appliedDate: dayjs(applicant.appliedDate).toISOString(),
        resumeUrl: '/dummy-resume.pdf'
      }
      
      // Use FormData if we have a resume file, otherwise send as JSON
      let applicantData
      
      if (resumeFile) {
        // Use FormData for file upload
        applicantData = new FormData()
        
        // Add all applicant data to FormData
        Object.keys(applicant).forEach(key => {
          if (key === 'phone') {
            applicantData.append(key, formattedPhone || '')
          } else if (key === 'appliedDate') {
            // Ensure date is in ISO format
            applicantData.append(key, dayjs(applicant[key]).toISOString())
          } else {
            // Make sure to convert object values to strings for FormData
            const value = typeof applicant[key] === 'object' 
              ? JSON.stringify(applicant[key]) 
              : applicant[key]
            applicantData.append(key, value || '')
          }
        })
        
        // Add resume file
        applicantData.append('resume', resumeFile)
        
        // Log FormData keys for debugging
        console.log('FormData keys:')
        for (const pair of applicantData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`)
        }
      } else {
        // No file, use regular JSON
        applicantData = jsonApplicantData
      }
      
      console.log('Submitting applicant data:', 
        resumeFile ? 'With file upload (FormData)' : 'Without file (JSON)',
        resumeFile ? applicantData.get('name') : applicantData.name
      )
      
      try {
        // First try to dispatch with the prepared data
        const resultAction = await dispatch(createApplicant(applicantData))
        
        if (createApplicant.fulfilled.match(resultAction)) {
          toast.success(`${applicant.name} has been added as an applicant`)
          navigate('/applicants')
          return
        }
        throw new Error(resultAction.error?.message || 'Failed to add applicant')
      } catch (dispatchError) {
        console.error('Error with initial dispatch:', dispatchError)
        
        // If FormData fails, try again with plain JSON as a fallback
        if (resumeFile) {
          console.log('FormData submission failed, trying with JSON fallback')
          toast.info('Trying alternative submission method...')
          
          const fallbackAction = await dispatch(createApplicant(jsonApplicantData))
          
          if (createApplicant.fulfilled.match(fallbackAction)) {
            toast.success(`${applicant.name} has been added as an applicant (without resume)`)
            navigate('/applicants')
            return
          }
          throw new Error(fallbackAction.error?.message || 'Failed with both submission methods')
        } else {
          throw dispatchError
        }
      }
    } catch (error) {
      console.error('Error adding applicant:', error)
      toast.error(`Failed to add applicant: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Applicant</h1>
        <p className="text-gray-500 mt-1">Create a new job applicant record</p>
      </div>

      {/* Google user message */}
      {isGoogleUser && (
        <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700">
          <p>
            You are adding an applicant as a demo user. This applicant will only be visible to you.
          </p>
        </div>
      )}

      {/* Application Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={applicant.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={applicant.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={applicant.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="(123) 456-7890"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: (123) 456-7890 or 1234567890
              </p>
            </div>
            
            {/* Application Details */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Application Details</h2>
            </div>
            
            {/* Application Category */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Type
              </label>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    id="specific-job"
                    name="applicationCategory"
                    type="radio"
                    value="specific-job"
                    checked={applicant.applicationCategory === 'specific-job'}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="specific-job" className="ml-2 block text-sm text-gray-700">
                    Specific Job Position
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="general"
                    name="applicationCategory"
                    type="radio"
                    value="general"
                    checked={applicant.applicationCategory === 'general'}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="general" className="ml-2 block text-sm text-gray-700">
                    General/Future Positions
                  </label>
                </div>
              </div>
              
              <p className="mt-1 text-xs text-gray-500">
                Select "General/Future Positions" for applicants not applying to a specific job post
              </p>
            </div>
            
            {applicant.applicationCategory === 'specific-job' && (
              <div className="md:col-span-2">
                <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">
                  Select Job Position *
                </label>
                {jobs.length > 0 ? (
                  <select
                    id="jobId"
                    name="jobId"
                    value={applicant.jobId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required={applicant.applicationCategory === 'specific-job'}
                  >
                    <option value="">Select a job position</option>
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>
                        {job.title}
                      </option>
                    ))}
                    <option value="other">Other (specify below)</option>
                  </select>
                ) : (
                  <div className="mt-1 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-700">
                    No jobs available. Please <Link to="/jobs/new" className="text-blue-600 hover:text-blue-800">create a job post</Link> first or select "Other" below.
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                {applicant.applicationCategory === 'general' ? 'Position of Interest' : (applicant.jobId === 'other' ? 'Specify Job Title' : 'Job Title')} *
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={applicant.jobTitle}
                onChange={handleInputChange}
                placeholder={applicant.applicationCategory === 'general' ? "General Application" : (applicant.jobId === 'other' ? "Enter custom job title" : "Enter job position")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
              {jobs.length > 0 && applicant.applicationCategory === 'specific-job' && applicant.jobId !== 'other' && (
                <p className="mt-1 text-xs text-gray-500">
                  This field will be filled automatically when selecting a job position above
                </p>
              )}
              {applicant.applicationCategory === 'specific-job' && applicant.jobId === 'other' && (
                <p className="mt-1 text-xs text-gray-500">
                  Please enter a custom job title for this applicant
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Application Source
              </label>
              <select
                id="source"
                name="source"
                value={applicant.source}
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={applicant.status}
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
              <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700">
                Applied Date
              </label>
              <input
                type="date"
                id="appliedDate"
                name="appliedDate"
                value={applicant.appliedDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                Resume {isGoogleUser ? '(Optional)' : '(Recommended, PDF/DOC/DOCX)'}
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
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {resumeFile 
                  ? `File size: ${(resumeFile.size / 1024).toFixed(2)} KB` 
                  : 'Max 5MB. If no resume is provided, a placeholder will be used.'}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={applicant.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Additional information about the applicant..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/applicants')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Applicant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddApplicant 