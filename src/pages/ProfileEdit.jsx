import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, getUserProfile } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const ProfileEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bio: '',
    skills: [],
    experience: [],
    education: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Fetch user profile when component mounts
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    // Update local state when user data is fetched
    if (user && user.profile) {
      setProfileData(user.profile);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleAddSkill = () => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddExperience = () => {
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
    setNewExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const handleAddEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    setNewEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile({ profile: profileData })).unwrap();
      toast.success('Profile updated successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profileData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
            <input
              type="text"
              id="street"
              name="street"
              value={profileData.address.street}
              onChange={handleAddressChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={profileData.address.city}
              onChange={handleAddressChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={profileData.address.state}
              onChange={handleAddressChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={profileData.address.zipCode}
              onChange={handleAddressChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={profileData.address.country}
              onChange={handleAddressChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={profileData.bio}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Skills</label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="ml-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {profileData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 text-primary-500 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Experience</label>
          {profileData.experience.map((exp, index) => (
            <div key={index} className="mt-2 p-4 border rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={newExperience.position}
                onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddExperience}
            className="mt-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Experience
          </button>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Education</label>
          {profileData.education.map((edu, index) => (
            <div key={index} className="mt-2 p-4 border rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                value={newEducation.institution}
                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <input
                type="text"
                value={newEducation.degree}
                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddEducation}
            className="mt-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Education
          </button>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`w-full px-4 py-2 text-white rounded-md ${
              status === 'loading' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {status === 'loading' ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit; 