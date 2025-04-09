import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DashboardSectionProps {
  user: any;
  notifications: any[];
  unreadCount: number;
  setActiveTab: (tab: string) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: number) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  refreshDashboard: () => void;
  loading: boolean;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  user,
  notifications,
  unreadCount,
  setActiveTab,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  removeNotification,
  showNotifications,
  setShowNotifications,
  refreshDashboard,
  loading
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-gray-300">Welcome, {user.name || 'Verifier'}</p>
              <p className="text-xs text-gray-400 mt-1">{currentDateTime.toLocaleString()}</p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={refreshDashboard}
              disabled={loading}
              className="p-2 rounded-full hover:bg-dark-600 transition-colors relative"
              aria-label="Refresh Dashboard"
              title="Refresh Requests"
            >
              <svg 
                className={`w-6 h-6 text-gray-300 ${loading ? 'animate-spin' : ''}`} 
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 20.0001C16.4183 20.0001 20 16.4184 20 12.0001C20 7.58187 16.4183 4.00015 12 4.00015C7.58172 4.00015 4 7.58187 4 12.0001C4 13.5759 4.45645 15.0539 5.25 16.3001"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path 
                  d="M9 4.5L4 4L4.5 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {loading && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  ↻
                </span>
              )}
            </button>
            
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-dark-700 rounded-lg shadow-lg border border-dark-600 overflow-hidden z-50"
                onClick={(e) => e.stopPropagation()}
                id="notification-panel"
              >
                <div className="p-3 border-b border-dark-600 flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary-400 hover:text-primary-300"
                      disabled={unreadCount === 0}
                    >
                      Mark All as Read
                    </button>
                    <button 
                      onClick={clearNotifications}
                      className="text-xs text-red-400 hover:text-red-300"
                      disabled={notifications.length === 0}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <svg className="w-12 h-12 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 border-b border-dark-600 hover:bg-dark-600 transition-colors ${!notification.read ? 'bg-dark-600/50' : ''}`}
                      >
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-3">
                            {notification.type === 'success' && (
                              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            {notification.type === 'error' && (
                              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )}
                            {notification.type === 'info' && (
                              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-1"></div>
                          )}
                        </div>
                        <div className="flex justify-end mt-2 space-x-2">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary-400 hover:text-primary-300"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      
        <h3 className="text-lg font-semibold text-primary-400 mb-4 mt-6">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Verifications */}
          <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">⏳ Pending Verifications</h4>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </div>
          
          {/* Verified */}
          <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">✅ Verified</h4>
                <p className="text-2xl font-bold">28</p>
              </div>
            </div>
          </div>
          
          {/* Rejected */}
          <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">❌ Rejected</h4>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </div>
          
          {/* Blockchain Certificates */}
          <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">🎓 Blockchain Certificates</h4>
                <p className="text-2xl font-bold">15</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Section */}
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-primary-400 mb-4">🔘 Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('verification-requests')}
            className="bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-primary-500/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="font-medium">Review Pending Verifications</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('verified-documents')}
            className="bg-dark-600 hover:bg-dark-500 border border-primary-500/30 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-primary-500/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">View Verified Documents</span>
          </button>
        </div>
      </div>
      
      {/* Recent Verification Requests Section */}
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary-400">Recent Verification Requests</h3>
          <button 
            onClick={() => setActiveTab('verification-requests')}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-dark-600">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Document ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Submitted By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Document Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600 bg-dark-800/30">
              {/* Example rows */}
              <tr className="hover:bg-dark-600/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  DOC-2023-001
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  John Smith
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Employment Certificate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  2023-04-08
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button className="text-primary-400 hover:text-primary-300 transition-colors">
                    Review
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-dark-600/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  DOC-2023-002
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Jane Doe
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Educational Degree
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  2023-04-07
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                    Verified
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button className="text-primary-400 hover:text-primary-300 transition-colors">
                    View
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-dark-600/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  DOC-2023-003
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Robert Johnson
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Work Experience
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  2023-04-07
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400">
                    Rejected
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button className="text-primary-400 hover:text-primary-300 transition-colors">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardSection; 