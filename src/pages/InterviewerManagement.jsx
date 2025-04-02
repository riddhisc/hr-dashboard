import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const InterviewerManagement = () => {
  const navigate = useNavigate();
  const [interviewers, setInterviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentInterviewer, setCurrentInterviewer] = useState(null);

  // Form state for adding/editing interviewers
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    expertise: '',
    avatar: ''
  });

  // Load interviewers from localStorage on component mount
  useEffect(() => {
    const loadInterviewers = () => {
      setIsLoading(true);
      try {
        const storedInterviewers = localStorage.getItem('interviewers');
        if (storedInterviewers) {
          setInterviewers(JSON.parse(storedInterviewers));
        } else {
          // Initialize with empty array if no interviewers exist
          setInterviewers([]);
          localStorage.setItem('interviewers', JSON.stringify([]));
        }
      } catch (error) {
        console.error('Error loading interviewers:', error);
        toast.error('Failed to load interviewers');
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviewers();
  }, []);

  // Save interviewers to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('interviewers', JSON.stringify(interviewers));
    }
  }, [interviewers, isLoading]);

  // Form change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'expertise') {
      // Handle expertise as comma-separated values
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Add a new interviewer
  const handleAddInterviewer = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Name, email, and role are required');
      return;
    }

    const newInterviewer = {
      id: `interviewer_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department || 'General',
      expertise: formData.expertise.split(',').map(item => item.trim()).filter(Boolean),
      avatar: formData.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
      calendar: [] // Empty calendar to start
    };

    setInterviewers([...interviewers, newInterviewer]);
    toast.success('Interviewer added successfully');
    setIsAddModalOpen(false);
    resetForm();
  };

  // Edit an existing interviewer
  const handleEditInterviewer = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Name, email, and role are required');
      return;
    }

    const updatedInterviewers = interviewers.map(interviewer => {
      if (interviewer.id === currentInterviewer.id) {
        return {
          ...interviewer,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department || 'General',
          expertise: formData.expertise.split(',').map(item => item.trim()).filter(Boolean),
          avatar: formData.avatar || interviewer.avatar
        };
      }
      return interviewer;
    });

    setInterviewers(updatedInterviewers);
    toast.success('Interviewer updated successfully');
    setIsEditModalOpen(false);
    resetForm();
  };

  // Delete an interviewer
  const handleDeleteInterviewer = (id) => {
    if (window.confirm('Are you sure you want to delete this interviewer?')) {
      const updatedInterviewers = interviewers.filter(interviewer => interviewer.id !== id);
      setInterviewers(updatedInterviewers);
      toast.success('Interviewer deleted successfully');
    }
  };

  // Open edit modal and populate form with interviewer data
  const openEditModal = (interviewer) => {
    setCurrentInterviewer(interviewer);
    setFormData({
      name: interviewer.name,
      email: interviewer.email,
      role: interviewer.role,
      department: interviewer.department,
      expertise: interviewer.expertise.join(', '),
      avatar: interviewer.avatar
    });
    setIsEditModalOpen(true);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      expertise: '',
      avatar: ''
    });
    setCurrentInterviewer(null);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b pb-4 border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interviewer Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Add, edit, and manage interviewers for scheduling
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Interviewer
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interviewers...</p>
        </div>
      ) : (
        <>
          {interviewers.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No interviewers found</h3>
              <p className="mt-2 text-gray-500">
                Add your first interviewer to start scheduling interviews.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Interviewer
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interviewer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expertise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interviewers.map((interviewer) => (
                    <tr key={interviewer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={interviewer.avatar}
                              alt={interviewer.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(interviewer.name);
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {interviewer.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{interviewer.role}</div>
                        <div className="text-sm text-gray-500">{interviewer.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {interviewer.expertise.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {interviewer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(interviewer)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInterviewer(interviewer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Interviewer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-medium text-gray-900">Add New Interviewer</h3>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expertise (comma-separated)</label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="React, JavaScript, Node.js"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Avatar URL (optional)</label>
                    <input
                      type="text"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Leave empty for a random avatar"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddInterviewer}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Interviewer
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Interviewer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsEditModalOpen(false)}></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-medium text-gray-900">Edit Interviewer</h3>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expertise (comma-separated)</label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="React, JavaScript, Node.js"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                    <input
                      type="text"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.avatar && (
                      <div className="mt-2">
                        <img
                          src={formData.avatar}
                          alt="Avatar Preview"
                          className="h-16 w-16 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(formData.name);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditInterviewer}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerManagement; 