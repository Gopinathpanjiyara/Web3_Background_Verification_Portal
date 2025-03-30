import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// API URL
const API_URL = 'http://localhost:5001/api';

// Status interface
interface Status {
  blockchain: { status: string; latency: number };
  verification: { status: string; latency: number };
  storage: { status: string; latency: number };
}

const StatusSection: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get status data from API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get<Status>(`${API_URL}/dashboard/status`);
        setSystemStatus(response.data);
      } catch (error) {
        console.error('Error fetching system status:', error);
        setError('Failed to load system status. Please try again later.');
        
        // Fallback data for development/demo
        setSystemStatus({
          blockchain: { status: 'operational', latency: 253 },
          verification: { status: 'operational', latency: 112 },
          storage: { status: 'operational', latency: 89 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    
    // Poll for status updates every minute
    const intervalId = setInterval(fetchStatus, 60000);
    
    // Clean up on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Render status indicator based on status value
  const renderStatusIndicator = (status: string, latency: number) => {
    let color, text;
    
    if (status === 'operational') {
      color = 'green';
      text = 'Operational';
    } else if (status === 'degraded') {
      color = 'yellow';
      text = 'Degraded';
    } else if (status === 'outage') {
      color = 'red';
      text = 'Outage';
    } else {
      color = 'gray';
      text = 'Unknown';
    }
    
    return (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full bg-${color}-500 mr-2.5`}></div>
        <span className="mr-2">{text}</span>
        <span className="text-gray-400 text-sm">{latency}ms</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">Error Loading System Status</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!systemStatus) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">No Status Data</h3>
        <p>System status information is currently unavailable.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Status</h2>
        <button 
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 1000);
          }}
          className="px-4 py-2 rounded-lg bg-dark-700/50 hover:bg-dark-700 text-sm flex items-center transition-colors duration-300"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Current Services Status</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-dark-600">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Blockchain Network</span>
              </div>
              {renderStatusIndicator(systemStatus.blockchain.status, systemStatus.blockchain.latency)}
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-dark-600">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Verification Service</span>
              </div>
              {renderStatusIndicator(systemStatus.verification.status, systemStatus.verification.latency)}
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Storage System</span>
              </div>
              {renderStatusIndicator(systemStatus.storage.status, systemStatus.storage.latency)}
            </div>
          </div>
        </div>
        
        <div className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">System Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-600/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-1">API Version</h4>
                <p className="text-lg font-mono">v1.2.3</p>
              </div>
              
              <div className="bg-dark-600/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-1">Blockchain Network</h4>
                <p className="text-lg font-mono">Ethereum (Sepolia)</p>
              </div>
              
              <div className="bg-dark-600/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-1">Last Updated</h4>
                <p className="text-lg font-mono">{new Date().toLocaleTimeString()}</p>
              </div>
              
              <div className="bg-dark-600/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-1">Active Sessions</h4>
                <p className="text-lg font-mono">1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusSection; 