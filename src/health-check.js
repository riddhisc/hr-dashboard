/**
 * Health Check Utility for Frontend
 * --------------------------------
 * This utility provides functions to check the health of various app dependencies
 */

import axios from 'axios';

// Detect demo mode as early as possible - even before any checks run
const isDemoMode = () => {
  try {
    // First check for demo_mode flag
    if (localStorage.getItem('demo_mode') === 'true') {
      console.log('Demo mode flag found in localStorage');
      return true;
    }
    
    // Then check user object
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email?.includes('demo') || 
           user.email?.includes('google') || 
           user.provider === 'google' ||
           user.demoUser === true ||
           user.isGoogleUser === true ||
           // Add additional check for demo token pattern
           (localStorage.getItem('token') || '').includes('demo') ||
           (localStorage.getItem('token') || '').includes('mock');
  } catch (e) {
    console.error('Error checking demo mode:', e);
    return false;
  }
};

// Pre-compute demo mode status
const RUNNING_IN_DEMO_MODE = isDemoMode();
console.log('Health Check: Running in demo mode:', RUNNING_IN_DEMO_MODE);

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  api: {
    endpoint: `${import.meta.env.VITE_API_URL || '/api'}/health-check`,
    timeout: 5000, // 5 seconds timeout
  },
  localStorage: {
    testKey: 'health_check_test',
    testValue: 'ok',
  },
};

/**
 * Check API connectivity
 * @returns {Promise<{status: string, message: string}>}
 */
export const checkApiHealth = async () => {
  // In demo mode, always return healthy without making API calls
  if (RUNNING_IN_DEMO_MODE || isDemoMode()) {
    console.log('Health check: Demo mode active - skipping actual API health check');
    return { 
      status: 'healthy', 
      message: 'Application is running in demo mode with local data only (no backend required)'
    };
  }

  // Only try to connect to API if not in demo mode
  try {
    console.log('Health check: Checking API health at:', HEALTH_CHECK_CONFIG.api.endpoint);
    // Try to use a relative path if the configured endpoint fails
    try {
      const response = await axios.get(HEALTH_CHECK_CONFIG.api.endpoint, { 
        timeout: HEALTH_CHECK_CONFIG.api.timeout 
      });
      
      if (response.status === 200 && response.data.status === 'ok') {
        return { status: 'healthy', message: 'API connection successful' };
      } else {
        return { status: 'degraded', message: `API responded with status: ${response.status}` };
      }
    } catch (primaryError) {
      // If the primary endpoint fails, try a fallback
      console.warn('Primary API endpoint failed, trying fallback:', primaryError.message);
      try {
        // Try the direct relative path as fallback
        const fallbackResponse = await axios.get('/api/health-check', { 
          timeout: HEALTH_CHECK_CONFIG.api.timeout 
        });
        
        if (fallbackResponse.status === 200) {
          return { status: 'healthy', message: 'API connection successful (via fallback)' };
        }
      } catch (fallbackError) {
        // Both attempts failed, throw the original error
        throw primaryError;
      }
    }
  } catch (error) {
    console.error('API health check failed:', error);
    
    // If API check fails, check if it's due to a 404 Not Found error
    if (error.response && error.response.status === 404) {
      console.warn('Health check endpoint not found. App may still work if other endpoints are available.');
      return { 
        status: 'degraded', 
        message: 'Health check endpoint not found, but application may still function'
      };
    }
    
    // If API check fails but we detect we're in demo mode now, still return healthy
    if (isDemoMode()) {
      return { 
        status: 'healthy', 
        message: 'Demo mode detected - application is running with local data only'
      };
    }
    
    // For complete failures, suggest demo mode
    return { 
      status: 'unhealthy', 
      message: `API connection failed: ${error.message || 'Unknown error'} - Try logging in with demo account`
    };
  }
};

/**
 * Check localStorage functionality
 * @returns {{status: string, message: string}}
 */
export const checkLocalStorageHealth = () => {
  try {
    // Try to write to localStorage
    localStorage.setItem(HEALTH_CHECK_CONFIG.localStorage.testKey, HEALTH_CHECK_CONFIG.localStorage.testValue);
    
    // Try to read from localStorage
    const storedValue = localStorage.getItem(HEALTH_CHECK_CONFIG.localStorage.testKey);
    
    // Clean up
    localStorage.removeItem(HEALTH_CHECK_CONFIG.localStorage.testKey);
    
    if (storedValue === HEALTH_CHECK_CONFIG.localStorage.testValue) {
      return { status: 'healthy', message: 'localStorage is working correctly' };
    } else {
      return { status: 'degraded', message: 'localStorage read/write mismatch' };
    }
  } catch (error) {
    console.error('localStorage health check failed:', error);
    return { 
      status: 'unhealthy', 
      message: `localStorage failed: ${error.message || 'Unknown error'}` 
    };
  }
};

/**
 * Run all health checks
 * @returns {Promise<{overall: string, checks: Object}>}
 */
export const runAllHealthChecks = async () => {
  const demoMode = RUNNING_IN_DEMO_MODE || isDemoMode();
  
  // Set up correct status based on demo mode
  let apiHealth;
  if (demoMode) {
    apiHealth = { 
      status: 'healthy', 
      message: 'Application is running in demo mode with local data only (no backend required)'
    };
  } else {
    apiHealth = await checkApiHealth();
  }
  
  const localStorageHealth = checkLocalStorageHealth();
  
  const checks = {
    api: apiHealth,
    localStorage: localStorageHealth,
  };
  
  // In demo mode, only localStorage matters for health
  let overallStatus = 'healthy';
  
  if (demoMode) {
    overallStatus = localStorageHealth.status;
  } else {
    // Determine overall status - unhealthy if any check is unhealthy
    for (const check of Object.values(checks)) {
      if (check.status === 'unhealthy') {
        overallStatus = 'unhealthy';
        break;
      } else if (check.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    demoMode: demoMode,
    overall: overallStatus,
    checks,
  };
}; 