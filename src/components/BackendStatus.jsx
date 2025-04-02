import React, { useState, useEffect } from 'react';
import { checkApiHealth } from '../health-check';

/**
 * BackendStatus Component
 * 
 * Shows status of backend server in demo mode or development
 */
const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Check if we're in demo mode by looking at localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isDemoMode = user.email?.includes('demo') || 
                          user.email?.includes('google') || 
                          user.provider === 'google' ||
                          user.demoUser === true ||
                          (localStorage.getItem('token') || '').includes('demo');
        
        // In demo mode, don't show error messages about backend connectivity
        if (isDemoMode) {
          setStatus('healthy');
          setMessage('Cannot connect to backend server. Application is running in demo mode.');
          // Hide message after 5 seconds in demo mode
          setTimeout(() => setVisible(false), 5000);
          return;
        }

        const result = await checkApiHealth();
        
        if (result.status === 'healthy') {
          setStatus('healthy');
          setMessage('Connected to backend server.');
          // Hide success message after 3 seconds
          setTimeout(() => setVisible(false), 3000);
        } else {
          setStatus('unhealthy');
          setMessage('Cannot connect to backend server. Application is running in demo mode.');
        }
      } catch (error) {
        console.error('Backend server check failed:', error.message);
        setStatus('unhealthy');
        setMessage('Cannot connect to backend server. Application is running in demo mode.');
      }
    };

    checkBackend();
  }, []);

  // If the component is hidden, don't render anything
  if (!visible) return null;

  const getStatusClass = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unhealthy':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-md shadow-md border ${getStatusClass()} max-w-md transition-opacity duration-500`}>
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          className="ml-2 text-gray-400 hover:text-gray-600" 
          onClick={() => setVisible(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default BackendStatus; 