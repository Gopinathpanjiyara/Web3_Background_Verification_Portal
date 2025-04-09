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
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : 'V'}
              </span>
            </div>
            <div>
              <p className="text-gray-300 font-semibold">Welcome, <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                {user.name || 'Verifier'}
              </span></p>
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {currentDateTime.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={refreshDashboard}
              disabled={loading}
              className="p-2 rounded-full bg-gradient-to-r from-primary-500/10 to-blue-500/10 hover:from-primary-500/20 hover:to-blue-500/20 border border-primary-500/30 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh Dashboard"
              title="Refresh Dashboard"
            >
              <svg 
                className={`w-6 h-6 text-primary-400 ${loading ? 'animate-spin' : ''}`} 
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
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
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
                className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-dark-700 to-dark-800 rounded-lg shadow-lg border border-dark-600/80 overflow-hidden z-50"
                onClick={(e) => e.stopPropagation()}
                id="notification-panel"
              >
                <div className="p-3 border-b border-dark-600/80 flex justify-between items-center bg-gradient-to-r from-dark-700 to-dark-600">
                  <h3 className="font-medium bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Notifications</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors px-2 py-0.5 rounded-full hover:bg-primary-500/10"
                      disabled={unreadCount === 0}
                    >
                      Mark All as Read
                    </button>
                    <button 
                      onClick={clearNotifications}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-0.5 rounded-full hover:bg-red-500/10"
                      disabled={notifications.length === 0}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-dark-500 scrollbar-track-dark-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="relative w-16 h-16 mx-auto">
                        <svg className="w-16 h-16 mx-auto text-gray-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-dark-600 flex items-center justify-center border-2 border-dark-800">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm font-bold mt-3 bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">No notifications</p>
                      <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 border-b border-dark-600/50 hover:bg-dark-600/50 transition-all ${!notification.read ? 'bg-gradient-to-r from-primary-500/5 to-blue-500/5 border-l-2 border-l-primary-500' : ''}`}
                      >
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-3 flex-shrink-0">
                            {notification.type === 'success' && (
                              <div className="w-9 h-9 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-full flex items-center justify-center shadow-md shadow-green-500/10">
                                <svg className="w-4.5 h-4.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            {notification.type === 'error' && (
                              <div className="w-9 h-9 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-md shadow-red-500/10">
                                <svg className="w-4.5 h-4.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )}
                            {notification.type === 'info' && (
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-full flex items-center justify-center shadow-md shadow-blue-500/10">
                                <svg className="w-4.5 h-4.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className={`text-sm font-medium ${
                                notification.type === 'success' 
                                  ? 'text-green-400' 
                                  : notification.type === 'error'  
                                    ? 'text-red-400' 
                                    : 'text-blue-400'
                              }`}>{notification.title}</p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1 bg-dark-800/70 px-1.5 py-0.5 rounded-full inline-block">{notification.time}</p>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2 space-x-2">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-400 hover:text-primary-300 border border-primary-500/30 transition-all hover:bg-primary-500/20"
                            >
                              Read
                            </button>
                          )}
                          <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-400 hover:text-red-300 border border-red-500/30 transition-all hover:bg-red-500/20"
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
      
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent mb-4 mt-6">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Verifications */}
          <div className="bg-gradient-to-br from-dark-600/70 to-dark-700/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-all hover:shadow-lg hover:shadow-primary-500/5 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-110">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Pending Verifications</h4>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">12</p>
              </div>
            </div>
          </div>
          
          {/* Verified */}
          <div className="bg-gradient-to-br from-dark-600/70 to-dark-700/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/5 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-110">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Verified</h4>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">28</p>
              </div>
            </div>
          </div>
          
          {/* Rejected */}
          <div className="bg-gradient-to-br from-dark-600/70 to-dark-700/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/5 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-110">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Rejected</h4>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">3</p>
              </div>
            </div>
          </div>
          
          {/* Blockchain Certificates */}
          <div className="bg-gradient-to-br from-dark-600/70 to-dark-700/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-110">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Blockchain Certificates</h4>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">15</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Section */}
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('verification-requests')}
            className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-primary-500/20 transform hover:translate-y-[-2px]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="font-medium">Review Pending Verifications</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('verified-documents')}
            className="bg-gradient-to-r from-dark-600 to-dark-700 hover:from-dark-500 hover:to-dark-600 border border-primary-500/30 hover:border-primary-500/50 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-primary-500/10 transform hover:translate-y-[-2px]"
          >
            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">View Verified Documents</span>
          </button>
        </div>
      </div>
      
      {/* Recent Verification Requests Section */}
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Recent Verification Requests</h3>
          <button 
            onClick={() => setActiveTab('verification-requests')}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors px-4 py-1 border border-primary-500/30 rounded-full bg-primary-500/10 hover:bg-primary-500/20"
          >
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-dark-600 shadow-xl bg-gradient-to-b from-dark-800/50 to-dark-900/50">
          <table className="w-full table-fixed">
            <thead className="bg-gradient-to-r from-dark-800 to-dark-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Document ID
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Submitted By
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Document Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/40 bg-dark-800/10">
              {/* Example rows */}
              <tr className="hover:bg-dark-600/40 transition-colors duration-300 cursor-pointer border-l-0 hover:border-l-[3px] hover:border-primary-500 group">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium font-mono">
                  DOC-2023-001
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md mr-2 flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        J
                      </span>
                    </div>
                    John Smith
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/20 mr-2 flex-shrink-0"></div>
                    Employment Certificate
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    2023-04-08
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center shadow-sm bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mr-1"></span>
                    Pending
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button className="text-primary-400 hover:text-primary-300 transition-all p-1.5 rounded-full hover:bg-primary-500/20 hover:shadow-md hover:shadow-primary-500/10 transform hover:scale-110">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-dark-600/40 transition-colors duration-300 cursor-pointer border-l-0 hover:border-l-[3px] hover:border-primary-500 group bg-dark-800/20">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium font-mono">
                  DOC-2023-002
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md mr-2 flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        J
                      </span>
                    </div>
                    Jane Doe
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/20 mr-2 flex-shrink-0"></div>
                    Educational Degree
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    2023-04-07
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center shadow-sm bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1"></span>
                    Verified
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button className="text-primary-400 hover:text-primary-300 transition-all p-1.5 rounded-full hover:bg-primary-500/20 hover:shadow-md hover:shadow-primary-500/10 transform hover:scale-110">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-dark-600/40 transition-colors duration-300 cursor-pointer border-l-0 hover:border-l-[3px] hover:border-primary-500 group">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium font-mono">
                  DOC-2023-003
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md mr-2 flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        R
                      </span>
                    </div>
                    Robert Johnson
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/20 mr-2 flex-shrink-0"></div>
                    Work Experience
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    2023-04-07
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center shadow-sm bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-400 border border-red-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1"></span>
                    Rejected
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button className="text-primary-400 hover:text-primary-300 transition-all p-1.5 rounded-full hover:bg-primary-500/20 hover:shadow-md hover:shadow-primary-500/10 transform hover:scale-110">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
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