import { useState, useEffect } from 'react';
import { runAllHealthChecks } from '../health-check';

/**
 * Health Check Component
 * 
 * Displays the health status of various application dependencies
 */
const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const healthResult = await runAllHealthChecks();
        setHealthStatus(healthResult);
      } catch (err) {
        console.error('Failed to run health checks:', err);
        setError(err.message || 'Failed to run health checks');
      } finally {
        setLoading(false);
      }
    };

    // Run health check immediately
    checkHealth();

    // Set up interval to run health check every 60 seconds
    const intervalId = setInterval(checkHealth, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Health status badge colors
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !healthStatus) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">System Health</h2>
        <div className="flex justify-center">
          <div className="animate-pulse">Loading health status...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">System Health</h2>
        <div className="p-3 bg-red-100 text-red-800 rounded-md">
          Error: {error}
        </div>
      </div>
    );
  }

  // Display demo mode notice if applicable
  const isDemoMode = healthStatus?.demoMode;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">System Status</h2>
        {isDemoMode ? (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Demo Mode
          </span>
        ) : (
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(healthStatus?.overall)}`}>
            {healthStatus?.overall || 'Unknown'}
          </span>
        )}
      </div>

      {isDemoMode && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
          <div className="font-semibold mb-1">Demo Mode Active</div>
          <div className="text-sm">
            Application is running with local data only. No backend connection required.
            <br/>
            All data is stored in your browser's localStorage.
          </div>
        </div>
      )}

      <div className="space-y-3">
        {healthStatus?.checks && Object.entries(healthStatus.checks).map(([name, check]) => (
          <div key={name} className={`border rounded-md p-3 ${isDemoMode && name === 'api' ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-center">
              <div className="font-medium capitalize">{name}</div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(check.status)}`}>
                {check.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{check.message}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last checked: {healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

export default HealthCheck; 