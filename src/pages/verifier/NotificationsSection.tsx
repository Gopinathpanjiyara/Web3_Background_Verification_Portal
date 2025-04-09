import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'error' | 'info';
}

interface NotificationsSectionProps {
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: number) => void;
  refreshNotifications: () => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  notifications,
  loading,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  removeNotification,
  refreshNotifications
}) => {
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    filterNotifications();
  }, [notifications, statusFilter, typeFilter, searchTerm]);

  const filterNotifications = () => {
    let filtered = [...notifications];
    
    // Apply read status filter
    if (statusFilter === 'read') {
      filtered = filtered.filter(notification => notification.read);
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(term) ||
        notification.message.toLowerCase().includes(term)
      );
    }
    
    setFilteredNotifications(filtered);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Notifications</h2>
            <button
              onClick={refreshNotifications}
              disabled={loading}
              className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 disabled:from-primary-800 disabled:to-blue-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Refresh Notifications"
            >
              <svg 
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
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
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem' 
              }}
            >
              <option value="all">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem' 
              }}
            >
              <option value="all">All Types</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
            className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 disabled:from-primary-800 disabled:to-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md hover:shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20"
          >
            Mark All as Read
          </button>
          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-800 disabled:to-red-900 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md hover:shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
          >
            Clear All Notifications
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500/30 border-t-4 border-t-primary-500"></div>
              <div className="absolute top-0 left-0 animate-ping h-16 w-16 rounded-full bg-primary-500/10 delay-150"></div>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <div className="relative">
              <svg className="w-20 h-20 text-gray-600 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-dark-600 flex items-center justify-center border-2 border-dark-800">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-bold mt-4 bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">No notifications found</p>
            <p className="text-sm max-w-md text-center mt-2 text-gray-500">
              {statusFilter !== 'all' || typeFilter !== 'all' || searchTerm ? 
                'No notifications match your search criteria.' : 
                'You have no notifications at this time.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNotifications.map((notification) => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-5 rounded-lg border transition-all duration-300 backdrop-blur-sm shadow-lg ${
                  !notification.read 
                    ? 'bg-gradient-to-r from-dark-700/80 to-dark-700/60 border-primary-500/40 shadow-primary-500/5' 
                    : 'bg-gradient-to-r from-dark-800/70 to-dark-800/50 border-dark-600 hover:border-dark-500'
                }`}
              >
                <div className="flex items-start">
                  <div className="mt-0.5 mr-4 flex-shrink-0">
                    {notification.type === 'success' && (
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-full flex items-center justify-center shadow-md shadow-green-500/10">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'error' && (
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-md shadow-red-500/10">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'info' && (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-full flex items-center justify-center shadow-md shadow-blue-500/10">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className={`text-lg font-semibold ${
                        notification.type === 'success' 
                          ? 'text-green-400' 
                          : notification.type === 'error'  
                            ? 'text-red-400' 
                            : 'text-blue-400'
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="inline-flex ml-2 w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-400 bg-dark-800/70 px-2 py-1 rounded-full">{notification.time}</span>
                    </div>
                    <p className="text-gray-300 mt-2">{notification.message}</p>
                    
                    <div className="flex justify-end mt-4 space-x-3">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-400 hover:text-primary-300 border border-primary-500/30 transition-all hover:bg-primary-500/20 hover:shadow-sm hover:shadow-primary-500/10"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => removeNotification(notification.id)}
                        className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-400 hover:text-red-300 border border-red-500/30 transition-all hover:bg-red-500/20 hover:shadow-sm hover:shadow-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationsSection; 