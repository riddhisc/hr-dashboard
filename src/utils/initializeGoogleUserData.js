/**
 * Initializes sample data for users to provide a demo experience
 */

// Sample job data
const sampleJobs = [
  {
    _id: 'google_job_1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    status: 'active',
    description: 'We are looking for a senior frontend developer experienced in React...',
    requirements: '5+ years of experience with React, JavaScript, HTML/CSS...',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'google_job_2',
    title: 'UX Designer',
    department: 'Design',
    location: 'New York',
    status: 'active',
    description: 'We are seeking a talented UX Designer to join our team...',
    requirements: '3+ years of experience in UX design, proficiency in Figma...',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'google_job_3',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'San Francisco',
    status: 'active',
    description: 'Seeking a skilled backend engineer to develop and maintain our API...',
    requirements: 'Expertise in Node.js, Express, and MongoDB...',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample applicant data
const sampleApplicants = [
  {
    _id: 'google_applicant_1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    jobId: 'google_job_1',
    status: 'shortlisted',
    resume: 'https://example.com/resume1.pdf',
    coverLetter: 'I am excited to apply for this position...',
    appliedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'google_applicant_2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '555-987-6543',
    jobId: 'google_job_1',
    status: 'interview',
    resume: 'https://example.com/resume2.pdf',
    coverLetter: 'Please consider my application for...',
    appliedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'google_applicant_3',
    name: 'Michael Chen',
    email: 'mike.chen@example.com',
    phone: '555-555-5555',
    jobId: 'google_job_2',
    status: 'pending',
    resume: 'https://example.com/resume3.pdf',
    coverLetter: 'I would like to express my interest in...',
    appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample interview data
const sampleInterviews = [
  {
    _id: 'google_interview_1',
    applicantId: 'google_applicant_2',
    applicantName: 'Sarah Johnson',
    jobId: 'google_job_1',
    jobTitle: 'Senior Frontend Developer',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM',
    duration: 60,
    interviewers: ['Hiring Manager', 'Tech Lead'],
    type: 'technical',
    location: 'Zoom',
    status: 'scheduled',
    notes: 'Focus on React experience',
    feedback: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'google_interview_2',
    applicantId: 'google_applicant_1',
    applicantName: 'John Smith',
    jobId: 'google_job_1',
    jobTitle: 'Frontend Developer',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM',
    duration: 60,
    interviewers: ['Technical Lead', 'Senior Developer'],
    type: 'technical',
    location: 'Microsoft Teams',
    status: 'completed',
    notes: 'Focus on React and state management experience',
    feedback: {
      rating: 3,
      strengths: 'Good understanding of React fundamentals',
      weaknesses: 'Could improve knowledge of state management',
      notes: 'Overall a good candidate with potential',
      recommendation: 'consider'
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Initialize user data in localStorage for demo purposes
 */
export const initializeUserData = (isGoogleUser = false) => {
  try {
    // Store data in localStorage with the right key based on user type
    const jobsKey = isGoogleUser ? 'google_user_jobs' : 'demo_user_jobs';
    const applicantsKey = isGoogleUser ? 'google_user_applicants' : 'demo_user_applicants';
    const interviewsKey = isGoogleUser ? 'google_user_interviews' : 'demo_user_interviews';
    
    // Check if jobs exist in localStorage
    const jobsJSON = localStorage.getItem(jobsKey);
    if (!jobsJSON || jobsJSON === '[]' || jobsJSON === 'null') {
      localStorage.setItem(jobsKey, JSON.stringify(sampleJobs));
      console.log(`Initialized sample jobs for ${isGoogleUser ? 'Google' : 'demo'} user`);
    }
    
    // Check if applicants exist in localStorage
    const applicantsJSON = localStorage.getItem(applicantsKey);
    if (!applicantsJSON || applicantsJSON === '[]' || applicantsJSON === 'null') {
      localStorage.setItem(applicantsKey, JSON.stringify(sampleApplicants));
      console.log(`Initialized sample applicants for ${isGoogleUser ? 'Google' : 'demo'} user`);
    }
    
    // Check if interviews exist in localStorage
    const interviewsJSON = localStorage.getItem(interviewsKey);
    if (!interviewsJSON || interviewsJSON === '[]' || interviewsJSON === 'null') {
      localStorage.setItem(interviewsKey, JSON.stringify(sampleInterviews));
      console.log(`Initialized sample interviews for ${isGoogleUser ? 'Google' : 'demo'} user`);
    }
    
    // If we're initializing for demo users, also ensure the standard localStorage keys have data
    // This ensures the dashboard works correctly for demo credential users
    if (!isGoogleUser) {
      // Check standard non-prefixed localStorage keys used by demo login
      if (!localStorage.getItem('interviews') || localStorage.getItem('interviews') === '[]') {
        localStorage.setItem('interviews', JSON.stringify(sampleInterviews));
        console.log('Initialized sample interviews in standard localStorage key for demo users');
      }
    }
    
    return {
      jobs: localStorage.getItem(jobsKey) ? JSON.parse(localStorage.getItem(jobsKey)) : [],
      applicants: localStorage.getItem(applicantsKey) ? JSON.parse(localStorage.getItem(applicantsKey)) : [],
      interviews: localStorage.getItem(interviewsKey) ? JSON.parse(localStorage.getItem(interviewsKey)) : []
    };
  } catch (error) {
    console.error('Error initializing user data:', error);
    return { jobs: [], applicants: [], interviews: [] };
  }
};

/**
 * Reset all user data in localStorage
 */
export const resetUserData = (isGoogleUser = false) => {
  try {
    // Determine the storage keys based on user type
    const jobsKey = isGoogleUser ? 'google_user_jobs' : 'demo_user_jobs';
    const applicantsKey = isGoogleUser ? 'google_user_applicants' : 'demo_user_applicants';
    const interviewsKey = isGoogleUser ? 'google_user_interviews' : 'demo_user_interviews';

    localStorage.removeItem(jobsKey);
    localStorage.removeItem(applicantsKey);
    localStorage.removeItem(interviewsKey);
    console.log(`Reset all ${isGoogleUser ? 'Google' : 'demo'} user data`);
    
    // Re-initialize with sample data
    initializeUserData(isGoogleUser);
    return true;
  } catch (error) {
    console.error('Error resetting user data:', error);
    return false;
  }
};

// For backward compatibility
export const initializeGoogleUserData = () => initializeUserData(true);
export const resetGoogleUserData = () => resetUserData(true);

export default initializeUserData; 