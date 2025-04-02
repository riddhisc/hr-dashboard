// Test helper to create a job in localStorage for Google users

/**
 * Creates a test job and saves it to localStorage for testing Google user functionality
 */
export function createTestJob() {
  try {
    // Create a test job with explicit status: 'open'
    const testJob = { 
      _id: `test-job-${new Date().getTime()}`, 
      title: 'Test Job', 
      status: 'open', // Explicitly set to lowercase 'open'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: 'Remote',
      salary: { min: 30000, max: 50000 }, 
      applications: 0, 
      skills: ['JavaScript', 'React']
    };

    // Get existing jobs or initialize an empty array
    const existingJobsJSON = localStorage.getItem('google_user_jobs') || '[]';
    console.log('Current jobs string:', existingJobsJSON);
    const existingJobs = JSON.parse(existingJobsJSON);
    
    // Add the test job
    existingJobs.push(testJob);
    
    // Save back to localStorage
    const jobsToSave = JSON.stringify(existingJobs);
    localStorage.setItem('google_user_jobs', jobsToSave);
    
    console.log('Test job created with status:', testJob.status);
    console.log('Saved data to localStorage:', jobsToSave);
    
    return testJob;
  } catch (error) {
    console.error('Error creating test job:', error);
    return null;
  }
}

/**
 * Displays the current job count and status of jobs in localStorage
 */
export function checkJobsInLocalStorage() {
  try {
    const jobsJSON = localStorage.getItem('google_user_jobs') || '[]';
    const jobs = JSON.parse(jobsJSON);
    
    console.log('Total jobs in localStorage:', jobs.length);
    
    // Count jobs by status
    const openJobs = jobs.filter(job => job.status === 'open').length;
    const closedJobs = jobs.filter(job => job.status === 'closed').length;
    const draftJobs = jobs.filter(job => job.status === 'draft').length;
    
    console.log('Jobs by status:', {
      open: openJobs,
      closed: closedJobs,
      draft: draftJobs
    });
    
    // Log each job's details
    jobs.forEach((job, index) => {
      console.log(`Job ${index + 1}:`, {
        id: job._id,
        title: job.title,
        status: job.status
      });
    });
    
    return jobs;
  } catch (error) {
    console.error('Error checking jobs in localStorage:', error);
    return [];
  }
}

/**
 * Reset all Google user jobs in localStorage
 */
export function resetUserJobs() {
  try {
    // Remove current data
    localStorage.removeItem('google_user_jobs');
    
    // Initialize with empty array
    localStorage.setItem('google_user_jobs', '[]');
    
    console.log('Google user jobs reset in localStorage');
    return true;
  } catch (error) {
    console.error('Error resetting Google user jobs:', error);
    return false;
  }
} 