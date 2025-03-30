import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// API URL
const API_URL = 'http://localhost:5001/api';

// Settings interface
interface Settings {
  notifications: {
    email: boolean;
    sms: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
  };
}

const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get settings data from API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get<Settings>(`${API_URL}/dashboard/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again later.');
        
        // Fallback data for development/demo
        setSettings({
          notifications: {
            email: true,
            sms: false,
          },
          security: {
            twoFactorEnabled: false,
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleNotificationChange = (type: 'email' | 'sms') => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    });
  };
  
  const handleSecurityChange = (setting: 'twoFactorEnabled') => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [setting]: !settings.security[setting]
      }
    });
  };
  
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Send updated settings to API
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.put(`${API_URL}/dashboard/settings`, settings);
      
      // Show success message
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again later.');
      
      // Hide error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">Error Loading Settings</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">No Settings Found</h3>
        <p>User settings information is currently unavailable.</p>
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
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>
      
      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p>Settings saved successfully!</p>
        </div>
      )}
      
      {error && settings && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {/* Notification Settings */}
        <div className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">Notification Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-dark-600">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-gray-400">Receive updates and alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                />
                <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Security Settings */}
        <div className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">Security Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-dark-600">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.security.twoFactorEnabled}
                  onChange={() => handleSecurityChange('twoFactorEnabled')}
                />
                <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium">Reset Password</h4>
                <p className="text-sm text-gray-400">Change your account password</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-dark-600 hover:bg-dark-500 text-sm transition-colors duration-300">
                Change
              </button>
            </div>
          </div>
        </div>
        
        {/* Save Settings Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`px-6 py-3 rounded-lg ${
              isSaving ? 'bg-primary-700 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
            } transition-colors duration-300 flex items-center`}
          >
            {isSaving && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsSection; 