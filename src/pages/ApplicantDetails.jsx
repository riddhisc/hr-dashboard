import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  selectApplicantById, 
  updateApplicantStatus,
  addApplicantNote,
  deleteApplicant
} from '../features/applicants/applicantsSlice'
import { 
  ArrowLeftIcon,
  EnvelopeIcon, 
  PhoneIcon, 
  DocumentTextIcon,
  LinkIcon,
  CalendarIcon,
  PaperClipIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

function ApplicantDetails() {
  const { applicantId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const applicant = useSelector(state => selectApplicantById(state, applicantId))
  const [note, setNote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  useEffect(() => {
    if (!applicant) {
      // Applicant not found, redirect to applicants list
      navigate('/applicants')
    }
  }, [applicant, navigate])

  if (!applicant) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  const handleStatusChange = (newStatus) => {
    dispatch(updateApplicantStatus({ id: applicant._id, status: newStatus }))
  }

  const handleAddNote = (e) => {
    e.preventDefault()
    if (note.trim()) {
      dispatch(addApplicantNote({ id: applicant._id, note: note.trim() }))
      setNote('')
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }
  
  const handleDeleteConfirm = () => {
    dispatch(deleteApplicant(applicant._id))
      .unwrap()
      .then(() => {
        toast.success('Applicant deleted successfully')
        navigate('/applicants')
      })
      .catch((error) => {
        toast.error(`Failed to delete applicant: ${error}`)
      })
  }
  
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  const handleSourceRedirect = () => {
    // In a real app, this would redirect to the source platform
    alert(`Redirecting to ${applicant.source} profile...`)
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    shortlisted: 'bg-blue-100 text-blue-800',
    interview: 'bg-yellow-100 text-yellow-800',
    hired: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const sourceIcons = {
    linkedin: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNzdiNSI+PHBhdGggZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzdjLTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjIgMGguMDAzeiIvPjwvc3ZnPg==',
    indeed: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMDAzMmE1Ij48cGF0aCBkPSJNNjYuOCwzOC44Yy0zLjksMC03LjIsMy4yLTcuMiw3LjJzMy4yLDcuMiw3LjIsNy4yYzMuOSwwLDcuMi0zLjIsNy4yLTcuMlM3MC44LDM4LjgsNjYuOCwzOC44eiIvPjxwb2x5Z29uIHBvaW50cz0iNzQsNjEuMiA1OS43LDYxLjIgNTkuNyw0Ni45IDc0LDQ2LjkiLz48cGF0aCBkPSJNODUuOCwxNkgxNC4yQzYuNiwxNiwwLDIyLjYsMCwzMC4ydjM5LjdjMCw3LjYsNi42LDE0LjIsMTQuMiwxNC4yaDcxLjdjNy42LDAsMTQuMi02LjYsMTQuMi0xNC4yVjMwLjJDMTAwLDIyLjYsOTMuNCwxNiw4NS44LDE2eiBNMzAuMiw2OC41SDIydi00N2g4LjJWNjguNXogTTQ5LjUsNjguNUgzOS44VjIxLjVoOS43VjY4LjV6Ii8+PC9zdmc+',
    company: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZiN2M5MyI+PHBhdGggZD0iTTIxIDJIMWExIDEgMCAwIDAtMSAxdjE2YTEgMSAwIDAgMCAxIDFoMjBhMSAxIDAgMCAwIDEtMVYzYTEgMSAwIDAgMC0xLTF6TTh2MTMuOTFINFY5aDR2Ny45MXptNiAwSDEwVjloNHY3Ljkxem02IDBoLTRWOWg0djcuOTF6TTggN0g0VjRoNHYzem02IDRWM2g0djRoLTR2NHptLTIgMFY0aC00djNoNHY0eiIvPjwvc3ZnPg==',
    referral: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZiN2M5MyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHY0aDE2di00YzAtMi42Ni01LjMzLTQtOC00eiIvPjxwYXRoIGQ9Ik0xOC43MiA4LjI3TDE4LjcyIDguMjdDMTkuMzUgOS4xNiAyMC4yOCAxMCAyMSAxMEMyMi42NiAxMCAyNCAxMS4zNCAyNCAxM0MyNiAxNC42NiAyNC42NiAxNiAyMyAxNkMyMS4yNyAxNiAxOS4yMyAxMy42IDE4LjYyIDEzTDEzLjA3IDE1LjA3QzEzLjA3IDE1LjA3IDEzLjAzIDE1LjU1IDEzLjAzIDE2QzEzLjAzIDE3LjExIDEyLjgyIDE4IDE1IDE4QzE3LjE5IDE4IDE4IDIwLjM2IDE4IDIwLjM2VjIySDFWMjAuMzZDMSAyMC4zNiAxLjgxIDE4IDQgMThDNi4yIDE4IDUuOTcgMTcuMTEgNi4wNCAxNkM2LjA1IDE1LjQzIDYgMTUuMDcgNS45MyAxNUM0LjQgMTUgMCAxMyAwIDEzQzAgMTMgNCAxMy42NiA2IDE0QzggMTQuMzQgOC40IDE0IDguNDEgMTRMMTMgMTIuMzFMMTggOC4yN1oiLz48L3N2Zz4=',
    other: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZiN2M5MyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTBjNS41MiAwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem02Ljg5IDE0Ljg5TDEyIDE0bC02Ljg5IDIuODlMMTIgNmw2Ljg5IDEwLjg5eiIvPjwvc3ZnPg=='
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
        <button
          onClick={() => navigate('/applicants')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Applicant Details</h1>
        </div>
        
        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
        >
          <TrashIcon className="w-4 h-4 mr-1" />
          <span>Delete</span>
        </button>
      </div>

      {/* Applicant details card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{applicant.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{applicant.jobTitle}</p>
            </div>
            <div className="flex space-x-2">
              <select
                value={applicant.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[applicant.status]}`}
              >
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center text-gray-500">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                <a href={`mailto:${applicant.email}`} className="text-sm hover:text-primary-600">
                  {applicant.email}
                </a>
              </div>
              <div className="flex items-center text-gray-500">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <a href={`tel:${applicant.phone}`} className="text-sm hover:text-primary-600">
                  {applicant.phone}
                </a>
              </div>
              <div className="flex items-center text-gray-500">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">Applied on {dayjs(applicant.appliedDate).format('MMMM D, YYYY')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <img 
                  src={sourceIcons[applicant.source]} 
                  alt={applicant.source} 
                  className="w-4 h-4 object-contain" 
                  style={{ maxWidth: '16px', maxHeight: '16px', display: 'inline-block' }}
                />
                <span className="text-sm text-gray-500 capitalize ml-2">Applied via {applicant.source}</span>
              </div>
              <button
                onClick={handleSourceRedirect}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">View on {applicant.source}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resume section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resume</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium">{applicant.name} - Resume.pdf</span>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700">
                  View
                </button>
                <button className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700">
                  Download
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Resume preview would be displayed here using react-pdf.
          </p>
        </div>

        {/* Notes section */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">HR Notes</h3>
          
          {/* Existing notes */}
          {applicant.notes ? (
            <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-line">
              {applicant.notes}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md mb-4 text-gray-500 text-center">
              No notes yet.
            </div>
          )}
          
          {/* Add note form */}
          <form onSubmit={handleAddNote}>
            <div className="mt-4">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Add Note
              </label>
              <div className="mt-1">
                <textarea
                  id="note"
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add a note about this applicant..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={!note.trim()}
              >
                Add Note
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Applicant?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-medium">{applicant.name || 'this applicant'}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

export default ApplicantDetails 