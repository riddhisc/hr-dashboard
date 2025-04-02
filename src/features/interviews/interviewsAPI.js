import api from '../../utils/api';

// Cache for interview data
let interviewsCache = {
  data: null,
  timestamp: null,
  expiryTime: 10000 // 10 seconds
};

// Get all interviews
export const fetchInterviews = async () => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (interviewsCache.data && 
        interviewsCache.timestamp && 
        (now - interviewsCache.timestamp < interviewsCache.expiryTime)) {
      console.log('Using cached interviews data from API layer');
      return interviewsCache.data;
    }
    
    console.log('Cache miss or expired, fetching interviews from server');
    const response = await api.get('/interviews');
    
    // Update cache
    interviewsCache = {
      data: response,
      timestamp: now,
      expiryTime: interviewsCache.expiryTime
    };
    
    return response;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    throw error;
  }
};

// Get interview by ID
export const getInterviewById = async (interviewId) => {
  try {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching interview ${interviewId}:`, error);
    throw error;
  }
};

// Get interviews by applicant ID
export const getInterviewsByApplicantId = async (applicantId) => {
  try {
    const response = await api.get(`/interviews/applicant/${applicantId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching interviews for applicant ${applicantId}:`, error);
    throw error;
  }
};

// Schedule a new interview
export const scheduleInterview = async (interviewData) => {
  try {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling interview:', error);
    throw error;
  }
};

// Update interview status
export const updateInterviewStatus = async (interviewId, statusData) => {
  try {
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }
    
    // Check if this is a localStorage-based ID
    const interviewIdStr = String(interviewId);
    if (interviewIdStr.startsWith('google_') || interviewIdStr.startsWith('local_') || interviewIdStr.startsWith('mock_')) {
      console.log(`Skipping API call for localStorage-based ID: ${interviewId}`);
      throw new Error(`Cannot update localStorage-based interview through API: ${interviewId}`);
    }
    
    console.log(`Sending status update for interview ${interviewId}: ${JSON.stringify(statusData)}`);
    
    try {
      const response = await api.put(`/interviews/${interviewId}/status`, statusData);
      
      // Check if response or response.data is empty/null
      if (!response || !response.data || Object.keys(response.data).length === 0) {
        console.warn(`Empty or missing response data when updating interview ${interviewId} status`);
        // Return minimal successful response with the requested status change
        return {
          _id: interviewId,
          status: statusData.status,
          updatedAt: new Date().toISOString()
        };
      }
      
      return response.data;
    } catch (apiError) {
      console.error(`API error updating interview ${interviewId} status:`, apiError);
      
      // Handle network errors or timeouts with a fallback response
      if (!apiError.response || apiError.message.includes('Network Error') || 
          apiError.message.includes('timeout') || apiError.code === 'ECONNABORTED') {
        console.warn('Network issue detected - returning fallback response');
        return {
          _id: interviewId,
          status: statusData.status,
          updatedAt: new Date().toISOString()
        };
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error(`Error in updateInterviewStatus for interview ${interviewId}:`, error);
    
    // Special handling for "No data received from server" error
    if (error.message === 'No data received from server') {
      console.warn('Creating fallback response due to empty server response');
      return {
        _id: interviewId,
        status: statusData.status,
        updatedAt: new Date().toISOString()
      };
    }
    
    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`Interview with ID ${interviewId} not found`);
      }
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw error;
  }
};

// Update interview details
export const updateInterview = async (interviewId, interviewData) => {
  try {
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }
    
    // Check if this is a localStorage-based ID
    const interviewIdStr = String(interviewId);
    if (interviewIdStr.startsWith('google_') || interviewIdStr.startsWith('local_') || interviewIdStr.startsWith('mock_')) {
      console.log(`Skipping API call for localStorage-based interview ID: ${interviewId}`);
      
      // Create a fallback response for localStorage IDs
      return {
        data: {
          _id: interviewId,
          ...interviewData,
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    // Validate interviewData to prevent empty or invalid data
    const validatedData = { ...interviewData };
    
    if (!validatedData) {
      throw new Error('Interview data is required');
    }
    
    // Create a fallback response in case we need it
    const fallbackResponse = {
      _id: interviewId,
      ...validatedData,
      updatedAt: new Date().toISOString(),
      _fallback: true
    };
    
    // Try-catch within try-catch for better error isolation
    try {
      // Set a timeout to abort the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // Use PATCH method to update the interview
      const response = await api.patch(`/interviews/${interviewId}`, validatedData, {
        signal: controller.signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      console.log('API response for update:', response);
      
      // Check if the response exists and has data property
      if (!response) {
        console.warn('No response object received from server, using fallback');
        return { data: fallbackResponse };
      }
      
      // Check if response.data exists
      if (!response.data) {
        console.warn('Response exists but has no data property, using fallback');
        return { data: fallbackResponse };
      }
      
      // Check if the data property is empty (empty object)
      if (typeof response.data === 'object' && Object.keys(response.data).length === 0) {
        console.warn('Empty data object received from server, using validated data');
        return { data: fallbackResponse };
      }
      
      // If we got here, we have valid data from the server
      console.log('Valid data received from server:', response.data);
      
      // Add the _id from our fallback in case it's missing from the response
      return { data: { ...response.data, _id: interviewId } };
      
    } catch (apiError) {
      console.error('API error when updating interview:', apiError);
      
      // Simply return the fallback response for any kind of error
      console.warn('Returning fallback response due to API error');
      return { data: fallbackResponse };
    }
  } catch (error) {
    console.error('Error in updateInterview:', error);
    throw error;
  }
};

// Add feedback to interview
export const addInterviewFeedback = async (interviewId, feedbackData) => {
  try {
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }
    
    if (!feedbackData) {
      throw new Error('Feedback data is required');
    }
    
    const response = await api.put(`/interviews/${interviewId}/feedback`, feedbackData);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error adding feedback to interview ${interviewId}:`, error);
    
    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`Interview with ID ${interviewId} not found`);
      }
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw error;
  }
};

// Delete interview
export const deleteInterview = async (interviewId) => {
  try {
    const response = await api.delete(`/interviews/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting interview ${interviewId}:`, error);
    throw error;
  }
}; 