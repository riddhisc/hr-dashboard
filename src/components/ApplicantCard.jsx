import { useState } from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'

function ApplicantCard({ applicant, onStatusChange, onViewDetails, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'shortlisted': return 'bg-blue-100 text-blue-800'
      case 'interview': return 'bg-yellow-100 text-yellow-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceIcon = (source) => {
    switch(source?.toLowerCase()) {
      case 'linkedin':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNzdiNSI+PHBhdGggZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzdjLTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjIgMGguMDAzeiIvPjwvc3ZnPg==';
      case 'indeed':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMDAzMmE1Ij48cGF0aCBkPSJNNjYuOCwzOC44Yy0zLjksMC03LjIsMy4yLTcuMiw3LjJzMy4yLDcuMiw3LjIsNy4yYzMuOSwwLDcuMi0zLjIsNy4yLTcuMlM3MC44LDM4LjgsNjYuOCwzOC44eiIvPjxwb2x5Z29uIHBvaW50cz0iNzQsNjEuMiA1OS43LDYxLjIgNTkuNyw0Ni45IDc0LDQ2LjkiLz48cGF0aCBkPSJNODUuOCwxNkgxNC4yQzYuNiwxNiwwLDIyLjYsMCwzMC4ydjM5LjdjMCw3LjYsNi42LDE0LjIsMTQuMiwxNC4yaDcxLjdjNy42LDAsMTQuMi02LjYsMTQuMi0xNC4yVjMwLjJDMTAwLDIyLjYsOTMuNCwxNiw4NS44LDE2eiBNMzAuMiw2OC41SDIydi00N2g4LjJWNjguNXogTTQ5LjUsNjguNUgzOS44VjIxLjVoOS43VjY4LjV6Ii8+PC9zdmc+';
      case 'company':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZiN2M5MyI+PHBhdGggZD0iTTIxIDJIMWExIDEgMCAwIDAtMSAxdjE2YTEgMSAwIDAgMCAxIDFoMjBhMSAxIDAgMCAwIDEtMVYzYTEgMSAwIDAgMC0xLTF6TTh2MTMuOTFINFY5aDR2Ny45MXptNiAwSDEwVjloNHY3Ljkxem02IDBoLTRWOWg0djcuOTF6TTggN0g0VjRoNHYzem02IDRWM2g0djRoLTR2NHptLTIgMFY0aC00djNoNHY0eiIvPjwvc3ZnPg==';
      case 'referral':
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZiN2M5MyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHY0aDE2di00YzAtMi42Ni01LjMzLTQtOC00eiIvPjxwYXRoIGQ9Ik0xOC43MiA4LjI3TDE4LjcyIDguMjdDMTkuMzUgOS4xNiAyMC4yOCAxMCAyMSAxMEMyMi42NiAxMCAyNCAxMS4zNCAyNCAxM0MyNiAxNC42NiAyNC42NiAxNiAyMyAxNkMyMS4yNyAxNiAxOS4yMyAxMy42IDE4LjYyIDEzTDEzLjA3IDE1LjA3QzEzLjA3IDE1LjA3IDEzLjAzIDE1LjU1IDEzLjAzIDE2QzEzLjAzIDE3LjExIDEyLjgyIDE4IDE1IDE4QzE3LjE5IDE4IDE4IDIwLjM2IDE4IDIwLjM2VjIySDFWMjAuMzZDMSAyMC4zNiAxLjgxIDE4IDQgMThDNi4yIDE4IDUuOTcgMTcuMTEgNi4wNCAxNkM2LjA1IDE1LjQzIDYgMTUuMDcgNS45MyAxNUM0LjQgMTUgMCAxMyAwIDEzQzAgMTMgNCAxMy42NiA2IDE0QzggMTQuMzQgOC40IDE0IDguNDEgMTRMMTMgMTIuMzFMMTggOC4yN1oiLz48L3N2Zz4=';
      default:
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZiN2M5MyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTBjNS41MiAwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem02Ljg5IDE0Ljg5TDEyIDE0bC02Ljg5IDIuODlMMTIgNmw2Ljg5IDEwLjg5eiIvPjwvc3ZnPg==';
    }
  }

  const handleStatusChange = (e) => {
    e.stopPropagation()
    const newStatus = e.target.value
    if (newStatus !== (applicant.status || 'pending')) {
      onStatusChange(applicant._id, newStatus)
    }
    setIsMenuOpen(false)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDelete(applicant._id)
    setShowDeleteConfirm(false)
    setIsMenuOpen(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setIsMenuOpen(false)
  }

  return (
    <div 
      className="relative bg-white shadow rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetails(applicant._id)}
    >
      {/* Card Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div>
          <h3 className="font-medium text-gray-900">{applicant.name || 'Unnamed Applicant'}</h3>
          <div className="flex items-center">
            <p className="text-sm text-gray-500">{applicant.jobTitle || 'No Job Position Specified'}</p>
            {(applicant.applicationCategory === 'general' || applicant.jobId === 'general') && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                General
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status || 'pending')}`}>
            {(applicant.status ? applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1) : 'Pending')}
          </span>
          <div className="relative ml-2">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
            >
              <EllipsisHorizontalIcon className="h-6 w-6" />
            </button>
            {isMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 text-xs text-gray-500">Change Status</div>
        <select
                    value={applicant.status || 'pending'}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete Applicant
                  </button>
                </div>
      </div>
            )}
        </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <EnvelopeIcon className="h-4 w-4 mr-1" />
          <span className="truncate">{applicant.email || 'No email provided'}</span>
        </div>
        {applicant.phone && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <PhoneIcon className="h-4 w-4 mr-1" />
            <span>{applicant.phone}</span>
          </div>
        )}
        {applicant.resumeUrl && (
          <div className="flex items-center text-sm text-blue-500 mb-2">
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            <span className="hover:underline">Resume</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-xs text-gray-500">
            <span>Applied: {applicant.appliedDate ? dayjs(applicant.appliedDate).format('MMM D, YYYY') : 'Unknown date'}</span>
          </div>
          {applicant.source && (
        <div className="flex items-center">
          <img 
                src={getSourceIcon(applicant.source)} 
                alt={applicant.source} 
                className="h-4 w-4 object-contain" 
                style={{ maxWidth: '16px', maxHeight: '16px', display: 'inline-block' }}
              />
              <span className="ml-1 text-xs text-gray-500 capitalize">{applicant.source}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Applicant?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-medium">{applicant.name || 'this applicant'}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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

export default ApplicantCard 