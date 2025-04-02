/**
 * Health Check Utility for Frontend
 * --------------------------------
 * This utility no longer makes network requests
 * All functions return mock successful responses
 */

// Always consider the app to be in demo mode
const isDemoMode = () => true;

// Pre-compute demo mode status (always true)
const RUNNING_IN_DEMO_MODE = true;
console.log('Health Check: Running in demo mode: true (forced)');

/**
 * Check API connectivity - never makes a real request
 * @returns {Promise<{status: string, message: string}>}
 */
export const checkApiHealth = async () => {
  console.log('Health check: Demo mode active - all API health checks are disabled');
  return { 
    status: 'healthy', 
    message: 'Application is running in demo mode with local data only (no backend required)'
  };
};

/**
 * Check localStorage functionality
 * @returns {{status: string, message: string}}
 */
export const checkLocalStorageHealth = () => {
  try {
    // Try to write to localStorage
    localStorage.setItem('health_check_test', 'ok');
    localStorage.removeItem('health_check_test');
    return { status: 'healthy', message: 'localStorage is working correctly' };
  } catch (error) {
    console.error('localStorage health check failed:', error);
    return { status: 'degraded', message: 'localStorage not available - some features may not work' };
  }
};

/**
 * Run all health checks
 * @returns {Promise<{overall: string, checks: Object}>}
 */
export const runAllHealthChecks = async () => {
  const apiHealth = { 
    status: 'healthy', 
    message: 'Application is running in demo mode with local data only (no backend required)'
  };
  
  const localStorageHealth = checkLocalStorageHealth();
  
  const checks = {
    api: apiHealth,
    localStorage: localStorageHealth,
  };
  
  // In demo mode, only localStorage matters for health
  const overallStatus = localStorageHealth.status;
  
  return {
    timestamp: new Date().toISOString(),
    demoMode: true,
    overall: overallStatus,
    checks,
  };
}; 