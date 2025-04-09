import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

// MetaMask image URL
const METAMASK_LOGO = 'https://cdn.iconscout.com/icon/free/png-256/free-metamask-2728406-2261817.png';

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
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState<string>('');
  const [networkColor, setNetworkColor] = useState<string>('gray');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Document Verified',
      message: 'Your document has been successfully verified on the blockchain.',
      time: new Date(Date.now() - 30 * 60000).toLocaleString(),
      read: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'New Certificate Available',
      message: 'A new blockchain certificate is available for your account.',
      time: new Date(Date.now() - 2 * 3600000).toLocaleString(),
      read: false,
      type: 'info'
    },
    {
      id: 3,
      title: 'Wallet Connected',
      message: 'Your MetaMask wallet has been successfully connected.',
      time: new Date(Date.now() - 1 * 86400000).toLocaleString(),
      read: true,
      type: 'success'
    },
    {
      id: 4,
      title: 'Verification Failed',
      message: 'Document verification failed. Please check your document and try again.',
      time: new Date(Date.now() - 2 * 86400000).toLocaleString(),
      read: true,
      type: 'error'
    }
  ]);

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
  
  // Map chain IDs to network names and colors
  const getNetworkInfo = (chainId: string) => {
    const networks: {[key: string]: {name: string, color: string}} = {
      '0x1': { name: 'Ethereum Mainnet', color: '#3b82f6' }, // blue-500
      '0x3': { name: 'Ropsten Testnet', color: '#ef4444' },  // red-500
      '0x4': { name: 'Rinkeby Testnet', color: '#eab308' },  // yellow-500
      '0x5': { name: 'Goerli Testnet', color: '#8b5cf6' },   // purple-500
      '0x2a': { name: 'Kovan Testnet', color: '#8b5cf6' },   // purple-500
      '0x89': { name: 'Polygon Mainnet', color: '#8b5cf6' }, // purple-500
      '0x13881': { name: 'Polygon Mumbai', color: '#8b5cf6' }, // purple-500
      '0xa86a': { name: 'Avalanche Mainnet', color: '#ef4444' }, // red-500
      '0xa869': { name: 'Avalanche Fuji', color: '#ef4444' }, // red-500
      '0x38': { name: 'BSC Mainnet', color: '#eab308' },    // yellow-500
      '0x61': { name: 'BSC Testnet', color: '#eab308' },    // yellow-500
    };
    
    return networks[chainId] || { name: 'Unknown Network', color: '#6b7280' }; // gray-500
  };

  // Update network information
  const updateNetworkInfo = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const { name, color } = getNetworkInfo(chainId);
        setNetworkName(name);
        setNetworkColor(color);
      } catch (error) {
        console.error('Error getting network:', error);
        setNetworkName('Unknown Network');
        setNetworkColor('gray');
      }
    }
  };

  // Check if wallet was previously connected and get network info
  useEffect(() => {
    const savedWalletAddress = localStorage.getItem('walletAddress');
    if (savedWalletAddress) {
      setWalletAddress(savedWalletAddress);
      setWalletConnected(true);
      updateNetworkInfo();
    }
  }, []);

  // Get unread notifications count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Add a new notification
  const addNotification = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      time: new Date().toLocaleString(),
      read: false,
      type
    };
    
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
  };

  // Handle MetaMask connection
  const connectMetaMask = async () => {
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask to connect your wallet!');
        window.open('https://metamask.io/download/', '_blank');
        setIsConnecting(false);
        return;
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      setWalletAddress(address);
      setWalletConnected(true);
      
      // Save connected address to localStorage
      localStorage.setItem('walletAddress', address);
      
      // Get network information
      await updateNetworkInfo();
      
      // Add a notification
      addNotification(
        'Wallet Connected', 
        `MetaMask wallet (${formatWalletAddress(address)}) connected successfully.`,
        'success'
      );
      
      // Add event listener for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setWalletConnected(false);
          setWalletAddress(null);
          localStorage.removeItem('walletAddress');
          addNotification('Wallet Disconnected', 'Your MetaMask wallet has been disconnected.', 'info');
        } else {
          // Account changed
          const newAddress = accounts[0];
          setWalletAddress(newAddress);
          localStorage.setItem('walletAddress', newAddress);
          addNotification(
            'Wallet Changed', 
            `MetaMask wallet switched to ${formatWalletAddress(newAddress)}.`,
            'info'
          );
        }
      });
      
      // Add event listener for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        // Update network information when chain changes
        updateNetworkInfo();
        const { name } = getNetworkInfo(chainId);
        addNotification(
          'Network Changed', 
          `Blockchain network switched to ${name}.`,
          'info'
        );
      });
      
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
      addNotification('Connection Failed', 'Failed to connect to MetaMask. Please try again.', 'error');
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
    addNotification('Wallet Disconnected', 'Your MetaMask wallet has been disconnected.', 'info');
  };
  
  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        const target = event.target as HTMLElement;
        const notificationPanel = document.getElementById('notification-panel');
        const notificationButton = document.getElementById('notification-button');
        
        if (
          notificationPanel && 
          !notificationPanel.contains(target) && 
          notificationButton && 
          !notificationButton.contains(target)
        ) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

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
      <main className="flex-1 relative flex flex-col">
        {/* Dashboard content */}
        <div className="flex-1 overflow-y-auto py-8 px-6 md:px-12">
        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-2xl font-bold">Dashboard Home</h2>
                    <p className="text-gray-300">Welcome, {user.name || 'User'}</p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-full hover:bg-dark-600 transition-colors relative"
                      aria-label="Notifications"
                      id="notification-button"
                    >
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <AnimatePresence>
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
                                Mark all read
                              </button>
                              <button 
                                onClick={clearNotifications}
                                className="text-xs text-red-400 hover:text-red-300"
                                disabled={notifications.length === 0}
                              >
                                Clear all
                              </button>
                            </div>
                          </div>
                          
                          <div className="max-h-96 overflow-y-auto">
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
                                  onClick={() => markAsRead(notification.id)}
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
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-primary-400 mb-4 mt-6">Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Verifications */}
                  <div className="bg-dark-600/70 backdrop-blur-sm p-5 rounded-xl border border-dark-500 hover:border-primary-500/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-400 text-sm">📊 Total Verifications</h4>
                        <p className="text-2xl font-bold">24</p>
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
                        <p className="text-2xl font-bold">18</p>
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
                        <p className="text-2xl font-bold">6</p>
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
                        <p className="text-2xl font-bold">12</p>
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
                    onClick={() => setActiveTab('verify')}
                    className="bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-primary-500/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">+ New Verification</span>
                  </button>
                  
                  {!walletConnected ? (
                    <button 
                      onClick={connectMetaMask}
                      disabled={isConnecting}
                      className="bg-dark-600 hover:bg-dark-500 border border-primary-500/30 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-primary-500/10"
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-medium">Connecting...</span>
                        </>
                      ) : (
                        <>
                          <img src={METAMASK_LOGO} alt="MetaMask" className="w-6 h-6" />
                          <span className="font-medium">Connect MetaMask</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-dark-600 border border-green-500/30 text-white py-4 px-6 rounded-xl flex items-center justify-between shadow-lg">
                      <div className="flex items-center space-x-3">
                        <img src={METAMASK_LOGO} alt="MetaMask" className="w-6 h-6" />
                        <div className="flex flex-col">
                          <span className="font-medium text-green-400 relative group cursor-pointer">
                            {formatWalletAddress(walletAddress!)}
                            <span className="absolute -top-10 left-0 bg-dark-800 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 border border-dark-600">
                              {walletAddress}
                            </span>
                          </span>
                          <div className="flex items-center mt-1">
                            <span className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: networkColor }}></span>
                            <span className="text-xs text-gray-400">{networkName}</span>
                  </div>
                  </div>
                </div>
                <button 
                        onClick={disconnectWallet}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Disconnect wallet"
                >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                </button>
                    </div>
                  )}
              </div>
            </div>
            
              {/* Recent Activity Section */}
              <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-primary-400 mb-4">Recent Activity</h3>
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
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white">Certificate generated</p>
                      <p className="text-gray-400 text-sm">New blockchain certificate created and stored</p>
                      <p className="text-gray-500 text-xs mt-1">{new Date(Date.now() - 86400000).toLocaleString()}</p>
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
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 