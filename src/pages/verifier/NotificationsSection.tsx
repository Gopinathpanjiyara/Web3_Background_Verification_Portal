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
            <h2 className="text-2xl font-bold">Notifications</h2>
            <button
              onClick={refreshNotifications}
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
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
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:border-primary-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
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
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Mark All as Read
          </button>
          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Clear All Notifications
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-sm max-w-md text-center mt-2">
              {statusFilter !== 'all' || typeFilter !== 'all' || searchTerm ? 
                'No notifications match your search criteria.' : 
                'You have no notifications at this time.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 rounded-lg border ${!notification.read ? 'bg-dark-600/50 border-primary-500/30' : 'bg-dark-800/30 border-dark-600'}`}
              >
                <div className="flex items-start">
                  <div className="mt-0.5 mr-4 flex-shrink-0">
                    {notification.type === 'success' && (
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'error' && (
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'info' && (
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">{notification.title}</h3>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                    <p className="text-gray-300 mt-1">{notification.message}</p>
                    
                    <div className="flex justify-end mt-4 space-x-3">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => removeNotification(notification.id)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationsSection; 