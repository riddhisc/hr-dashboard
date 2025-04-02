/**
 * Global Health Check Disabler
 * This module patches Axios to prevent health check requests from being made
 */

import axios from 'axios';

// Override axios get method to intercept health check calls
const originalGet = axios.get;
axios.get = function(url, config) {
  // Check if this is a health check request
  if (url && (
    url.includes('/health-check') || 
    url.includes('/health_check') ||
    url.includes('/healthcheck')
  )) {
    console.log('Health check request intercepted and blocked:', url);
    
    // Return a fake successful response instead of making the actual request
    return Promise.resolve({
      data: { 
        status: 'ok', 
        message: 'Health check disabled - mock response',
        mockData: true
      },
      status: 200,
      statusText: 'OK (Mock)',
      headers: {},
      config: config || {},
    });
  }
  
  // Otherwise, proceed with the normal request
  return originalGet.apply(this, arguments);
};

// Also patch the create method to ensure all axios instances have this behavior
const originalCreate = axios.create;
axios.create = function(...args) {
  const instance = originalCreate.apply(this, args);
  
  const instanceGet = instance.get;
  instance.get = function(url, config) {
    // Check if this is a health check request
    if (url && (
      url.includes('/health-check') || 
      url.includes('/health_check') ||
      url.includes('/healthcheck')
    )) {
      console.log('Health check request intercepted in axios instance and blocked:', url);
      
      // Return a fake successful response
      return Promise.resolve({
        data: { 
          status: 'ok', 
          message: 'Health check disabled - mock response',
          mockData: true
        },
        status: 200,
        statusText: 'OK (Mock)',
        headers: {},
        config: config || {},
      });
    }
    
    // Otherwise, proceed with the normal request
    return instanceGet.apply(this, arguments);
  };
  
  return instance;
};

// Add a global variable to indicate health checks are disabled
window.HEALTH_CHECKS_DISABLED = true;

console.log('Health check module loaded - all health check requests will be intercepted and mocked');

export default {
  isHealthCheckDisabled: true
}; 