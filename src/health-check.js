/**
 * Health Check Utility for Frontend
 * --------------------------------
 * This utility provides functions to check the health of various app dependencies
 */

import axios from 'axios';
import { API_URL } from './utils/api';

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
  try {
    const response = await axios.get(HEALTH_CHECK_CONFIG.api.endpoint, { 
      timeout: HEALTH_CHECK_CONFIG.api.timeout 
    });
    
    if (response.status === 200 && response.data.status === 'ok') {
      return { status: 'healthy', message: 'API connection successful' };
    } else {
      return { status: 'degraded', message: `API responded with status: ${response.status}` };
    }
  } catch (error) {
    console.error('API health check failed:', error);
    return { 
      status: 'unhealthy', 
      message: `API connection failed: ${error.message || 'Unknown error'}` 
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
  const apiHealth = await checkApiHealth();
  const localStorageHealth = checkLocalStorageHealth();
  
  const checks = {
    api: apiHealth,
    localStorage: localStorageHealth,
  };
  
  // Determine overall status - unhealthy if any check is unhealthy
  let overallStatus = 'healthy';
  for (const check of Object.values(checks)) {
    if (check.status === 'unhealthy') {
      overallStatus = 'unhealthy';
      break;
    } else if (check.status === 'degraded' && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    overall: overallStatus,
    checks,
  };
}; 