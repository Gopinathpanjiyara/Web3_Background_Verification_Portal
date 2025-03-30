import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { logo } from '../../assets';

// Import dashboard sections
import ProfileSection from './ProfileSection';
import VerifyDocumentSection from './VerifyDocumentSection';
import ServiceSection from './ServiceSection';
import StatusSection from './StatusSection';
import NftCertificateSection from './NftCertificateSection';
import SettingsSection from './SettingsSection';

// API URL
const API_URL = 'http://localhost:5001/api';

// User interface definition
interface User {
  id: string;
  username: string; 
  name: string;
  phone?: string;
  email?: string;
  userType?: string;
  dob?: string;
}

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  // Check authentication and load user data
  useEffect(() => {
    const loadUserData = async () => {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn || !token) {
        // Redirect to login if not logged in
        navigate('/login');
        return;
      }

      try {
        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to get user data from API
        const response = await axios.get<User>(`${API_URL}/user`);
        const userData = response.data;
        setUser(userData);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // If API request fails, try to use locally stored user data
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData) as User;
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            // If all fails, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            navigate('/login');
          }
        } else {
          // If no stored user data, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    // Redirect to login
    navigate('/login');
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user, show empty state
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Error</h2>
          <p className="mb-6">Unable to load user data. Please try logging in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 text-white flex">
      {/* Sidebar with improved styling - collapsed by default, expands on hover */}
      <nav className="transition-all duration-500 ease-in-out bg-dark-800/80 backdrop-blur-sm min-h-screen flex flex-col border-r border-dark-600 group hover:w-72 w-20 px-4 py-6 overflow-hidden">
        <div className="flex items-center justify-center mb-10 transition-all duration-300">
          <img src={logo} alt="BlockVerify Logo" className="h-12 drop-shadow-glow transition-transform duration-300 group-hover:scale-100 scale-75" />
        </div>
        
        <div className="flex flex-col space-y-2.5 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3.5 rounded-xl text-left flex items-center transition-all duration-300 ${activeTab === 'dashboard' 
              ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500 pl-3' 
              : 'hover:bg-dark-700 border-l-4 border-transparent pl-3'}`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('verify')}
            className={`p-3.5 rounded-xl text-left flex items-center transition-all duration-300 ${activeTab === 'verify' 
              ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500 pl-3' 
              : 'hover:bg-dark-700 border-l-4 border-transparent pl-3'}`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">Verify Document</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-3.5 rounded-xl text-left flex items-center transition-all duration-300 ${activeTab === 'profile' 
              ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500 pl-3' 
              : 'hover:bg-dark-700 border-l-4 border-transparent pl-3'}`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">Profile</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('service')}
            className={`p-3.5 rounded-xl text-left flex items-center transition-all duration-300 ${activeTab === 'service' 
              ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500 pl-3' 
              : 'hover:bg-dark-700 border-l-4 border-transparent pl-3'}`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">Services</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('status')}
            className={`p-3.5 rounded-xl text-left flex items-center transition-all duration-300 ${activeTab === 'status' 
              ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500 pl-3' 
              : 'hover:bg-dark-700 border-l-4 border-transparent pl-3'}`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">System Status</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('nft')}
            className={`p-3.5 rounded-xl text-left flex items-center transition-all duration-300 ${activeTab === 'nft' 
              ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500 pl-3' 
              : 'hover:bg-dark-700 border-l-4 border-transparent pl-3'}`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">NFT Certificates</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3.5 rounded-xl text-left flex items-center transition-all duration-300 ${activeTab === 'settings' 
              ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500 pl-3' 
              : 'hover:bg-dark-700 border-l-4 border-transparent pl-3'}`}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">Settings</span>
          </button>
          
          <div className="flex-grow"></div>
          
          <button 
            onClick={handleLogout}
            className="p-3.5 rounded-xl text-left flex items-center hover:bg-dark-700 border-l-4 border-transparent pl-3 transition-all duration-300 mt-auto text-red-400 hover:text-red-300"
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-20px] group-hover:translate-x-0">Log out</span>
          </button>
        </div>
        
        <div className="border-t border-dark-600 pt-6 mt-6">
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-500 mb-2">
            <div className="w-10 h-10 rounded-full bg-dark-600 flex-shrink-0 mr-3"></div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-gray-400">{user?.email || 'No email'}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-dark-600 flex-shrink-0 group-hover:hidden flex items-center justify-center mx-auto">
            <span className="text-sm font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1 py-8 px-6 md:px-12 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-700 rounded-xl p-6 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <p className="text-gray-300 mb-4">Welcome back, {user.name || 'User'}!</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Verify Documents</h3>
                    <p className="text-gray-400 text-sm">Verify blockchain documents</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('verify')}
                  className="w-full py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-lg transition-colors text-sm mt-2"
                >
                  Go to Verification
                </button>
              </div>
              
              <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Create Certificate</h3>
                    <p className="text-gray-400 text-sm">Generate new blockchain certificates</p>
                  </div>
                </div>
                <button 
                  className="w-full py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-lg transition-colors text-sm mt-2"
                >
                  Coming Soon
                </button>
              </div>
              
              <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Settings</h3>
                    <p className="text-gray-400 text-sm">Configure your account</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-full py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-lg transition-colors text-sm mt-2"
                >
                  Go to Settings
                </button>
              </div>
            </div>
            
            <div className="mt-8 bg-dark-600/70 backdrop-blur-sm p-6 rounded-xl border border-dark-500">
              <h3 className="font-semibold text-lg mb-4 text-primary-400">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white">Document verification completed</p>
                    <p className="text-gray-400 text-sm">A document was successfully verified using blockchain technology</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'profile' && (
          <ProfileSection 
            user={user} 
            loadingSection={loadingSection} 
            setLoadingSection={setLoadingSection} 
          />
        )}
        
        {activeTab === 'verify' && (
          <VerifyDocumentSection />
        )}
        
        {activeTab === 'service' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ServiceSection />
          </motion.div>
        )}
        
        {activeTab === 'status' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatusSection />
          </motion.div>
        )}
        
        {activeTab === 'nft' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NftCertificateSection />
          </motion.div>
        )}
        
        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SettingsSection />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout; 