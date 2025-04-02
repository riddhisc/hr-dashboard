import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404 - Page Not Found</h1>
      <p className="mt-4 text-xl text-gray-600">
        The page you're looking for doesn't exist.
      </p>
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default NotFound; 