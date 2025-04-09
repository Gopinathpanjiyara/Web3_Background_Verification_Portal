import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { logo } from '../../assets';
import VerificationMetricsSection from './VerificationMetricsSection';
import VerificationHistorySection from './VerificationHistorySection';
import DashboardSection from './DashboardSection';
import VerificationRequestsSection from './VerificationRequestsSection';
import VerifiedDocumentsSection from './VerifiedDocumentsSection';
import OrganizationProfileSection from './OrganizationProfileSection';
import NotificationsSection from './NotificationsSection';
import { Toaster } from 'react-hot-toast';

const API_URL = 'http://localhost:5002/api';

// MetaMask image URL
const METAMASK_LOGO = 'https://cdn.iconscout.com/icon/free/png-256/free-metamask-2728406-2261817.png';

interface VerifierUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  email?: string;
  [key: string]: any;
}

// Add the TypeScript interface for the window object to support ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// ... keep existing mock data ...

// Mock verification metrics data
const mockMetricsData = [
  { name: 'Pending Verifications', value: 24, change: 12, trend: 'up' },
  { name: 'Completed Today', value: 32, change: -5, trend: 'down' },
  { name: 'Average Time', value: '1.4h', change: -15, trend: 'down' },
  { name: 'Success Rate', value: '94%', change: 2, trend: 'up' },
];

// Mock chart data
const mockChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Verifications',
      data: [65, 59, 80, 81, 56, 55],
    },
    {
      label: 'Rejections',
      data: [12, 15, 18, 14, 9, 8],
    },
  ],
};

// Mock verification history data
const mockVerifications = [
  {
    id: 'ver123456789',
    documentType: 'Passport',
    documentName: 'International Passport',
    verifiedAt: '2023-05-12T14:32:00',
    verifiedBy: 'John Verifier',
    status: 'verified' as const,
    issuer: 'Government of Canada',
    blockchainRecordId: '0x1234567890abcdef1234567890abcdef',
    thumbnail: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Passport',
  },
  {
    id: 'ver987654321',
    documentType: 'Driver License',
    documentName: 'State Driver License',
    verifiedAt: '2023-05-11T10:15:00',
    verifiedBy: 'Jane Approver',
    status: 'rejected' as const,
    issuer: 'Department of Motor Vehicles',
    thumbnail: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=License',
  },
  {
    id: 'ver456789123',
    documentType: 'Birth Certificate',
    documentName: 'Birth Certificate',
    verifiedAt: '2023-05-10T09:45:00',
    verifiedBy: 'System',
    status: 'pending' as const,
    issuer: 'City Records Office',
    thumbnail: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Certificate',
  },
  {
    id: 'ver789123456',
    documentType: 'Bank Statement',
    documentName: 'Annual Bank Statement',
    verifiedAt: '2023-05-09T16:20:00',
    verifiedBy: 'John Verifier',
    status: 'verified' as const,
    issuer: 'Global Banking Corp',
    blockchainRecordId: '0xabcdef1234567890abcdef1234567890',
    thumbnail: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Statement',
  },
];

// Define a Notification type that matches the one in NotificationsSection
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'error' | 'info';
}

const VerifierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<VerifierUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metrics' | 'history' | 'verification-requests' | 'verified-documents' | 'organization-profile' | 'notifications'>('dashboard');
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Document Verified',
      message: 'A document was successfully verified on the blockchain.',
      time: new Date(Date.now() - 30 * 60000).toLocaleString(),
      read: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'New Verification Request',
      message: 'You have a new document verification request.',
      time: new Date(Date.now() - 2 * 3600000).toLocaleString(),
      read: false,
      type: 'info'
    },
    {
      id: 3,
      title: 'System Update',
      message: 'The verification system has been updated with new features.',
      time: new Date(Date.now() - 1 * 86400000).toLocaleString(),
      read: true,
      type: 'info'
    }
  ]);

  // Mock data for verification requests
  const [mockVerificationRequests, setMockVerificationRequests] = useState([
    {
      id: 'req12345',
      requesterName: 'John Smith',
      documentType: 'Employment Certificate',
      status: 'pending' as const,
      submittedDate: '2023-04-08',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Certificate',
      requestDetails: 'Please verify my employment certificate from Company XYZ.'
    },
    {
      id: 'req12346',
      requesterName: 'Jane Doe',
      documentType: 'Educational Degree',
      status: 'pending' as const,
      submittedDate: '2023-04-07',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Degree',
      requestDetails: 'This is my bachelor degree from University of Technology.'
    },
    {
      id: 'req12347',
      requesterName: 'Michael Brown',
      documentType: 'Identity Document',
      status: 'pending' as const,
      submittedDate: '2023-04-06',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Identity',
      requestDetails: 'Personal identification document for verification.'
    },
    {
      id: 'req12348',
      requesterName: 'Sarah Wilson',
      documentType: 'Property Deed',
      status: 'verified' as const,
      submittedDate: '2023-04-05',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Deed.pdf',
      requestDetails: 'Property deed verification for real estate transaction.'
    },
    {
      id: 'req12349',
      requesterName: 'Robert Johnson',
      documentType: 'Medical License',
      status: 'rejected' as const,
      submittedDate: '2023-04-04',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=License',
      requestDetails: 'Medical practitioner license verification request.'
    }
  ]);

  // Mock data for verified documents
  const mockVerifiedDocuments = [
    {
      id: 'doc12345',
      documentType: 'Employment Certificate',
      verifiedDate: '2023-04-05T14:30:00',
      ownerName: 'John Smith',
      certificationId: 'CERT-EMP-001',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Certificate',
      blockchainTxHash: '0x1234567890abcdef1234567890abcdef'
    },
    {
      id: 'doc12346',
      documentType: 'Educational Degree',
      verifiedDate: '2023-04-04T10:15:00',
      ownerName: 'Jane Doe',
      certificationId: 'CERT-EDU-001',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Degree'
    },
    {
      id: 'doc12347',
      documentType: 'Medical License',
      verifiedDate: '2023-04-03T09:45:00',
      ownerName: 'Dr. Robert Chen',
      certificationId: 'CERT-MED-003',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=License',
      blockchainTxHash: '0x2345678901abcdef2345678901abcdef'
    },
    {
      id: 'doc12348',
      documentType: 'Property Deed',
      verifiedDate: '2023-04-02T16:20:00',
      ownerName: 'Michael Johnson',
      certificationId: 'CERT-PROP-005',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Deed'
    },
    {
      id: 'doc12349',
      documentType: 'Birth Certificate',
      verifiedDate: '2023-04-01T11:10:00',
      ownerName: 'Emma Williams',
      certificationId: 'CERT-BIRTH-002',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Birth',
      blockchainTxHash: '0x3456789012abcdef3456789012abcdef'
    },
    {
      id: 'doc12350',
      documentType: 'Marriage Certificate',
      verifiedDate: '2023-03-30T15:45:00',
      ownerName: 'David & Sarah Brown',
      certificationId: 'CERT-MAR-008',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Marriage'
    },
    {
      id: 'doc12351',
      documentType: 'Patent Certificate',
      verifiedDate: '2023-03-28T13:25:00',
      ownerName: 'Innovative Tech Inc.',
      certificationId: 'CERT-PAT-012',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Patent',
      blockchainTxHash: '0x4567890123abcdef4567890123abcdef'
    },
    {
      id: 'doc12352',
      documentType: 'Driving License',
      verifiedDate: '2023-03-25T10:30:00',
      ownerName: 'Thomas Garcia',
      certificationId: 'CERT-DRV-015',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Driving'
    },
    {
      id: 'doc12353',
      documentType: 'Passport',
      verifiedDate: '2023-03-22T09:15:00',
      ownerName: 'Jennifer Lee',
      certificationId: 'CERT-PASS-018',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Passport',
      blockchainTxHash: '0x5678901234abcdef5678901234abcdef'
    },
    {
      id: 'doc12354',
      documentType: 'Educational Degree',
      verifiedDate: '2023-03-20T14:50:00',
      ownerName: 'Alex Martinez',
      certificationId: 'CERT-EDU-021',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Degree'
    },
    {
      id: 'doc12355',
      documentType: 'Employment Certificate',
      verifiedDate: '2023-03-18T16:40:00',
      ownerName: 'Sophia Taylor',
      certificationId: 'CERT-EMP-024',
      documentUrl: 'https://placehold.co/200x150/2a2a2a/FFFFFF/png?text=Certificate',
      blockchainTxHash: '0x6789012345abcdef6789012345abcdef'
    }
  ];

  // Mock organization profile
  const mockOrgProfile = {
    id: 'org12345',
    name: 'Verification Authority Inc.',
    verifierCode: 'VAI-2023',
    logo: 'https://placehold.co/200x200/2a2a2a/FFFFFF/png?text=VAI',
    industry: 'Certification',
    website: 'https://verificationauthority.com',
    address: '123 Verification Street, Authentication City',
    country: 'United States',
    numberOfVerifiers: 12,
    activeDate: '2021-06-15',
    totalDocumentsVerified: 1458,
    blockchainAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
  };

  // Handler functions for verification requests
  const handleRejectRequest = (id: string) => {
    console.log(`Reject request ${id}`);
    
    // Update the mock data to simulate API behavior
    setMockVerificationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === id ? { ...req, status: 'rejected' as const } : req
      )
    );
    
    // Add a notification
    const newNotification = {
      id: Date.now(),
      title: 'Request Rejected',
      message: `Verification request ${id} has been rejected.`,
      time: new Date().toLocaleString(),
      read: false,
      type: 'error' as const
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleApproveRequest = (id: string) => {
    console.log(`Approve request ${id}`);
    
    // Update the mock data to simulate API behavior
    setMockVerificationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === id ? { ...req, status: 'verified' as const } : req
      )
    );
    
    // Add a notification
    const newNotification = {
      id: Date.now(),
      title: 'Request Approved',
      message: `Verification request ${id} has been approved.`,
      time: new Date().toLocaleString(),
      read: false,
      type: 'success' as const
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleReviewRequest = (id: string) => {
    console.log(`Review request ${id}`);
    
    // Add a notification for review
    const newNotification = {
      id: Date.now(),
      title: 'Request Marked for Review',
      message: `Verification request ${id} has been marked for further review.`,
      time: new Date().toLocaleString(),
      read: false,
      type: 'info' as const
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleRefreshRequests = () => {
    console.log('Refreshing verification requests');
    setLoadingSection('verification-requests');
    // Simulate fetching new data
    setTimeout(() => {
      setLoadingSection(null);
      // In a real app, you would fetch updated requests from the API here
    }, 1000);
  };

  const handleRefreshDashboard = () => {
    console.log('Refreshing dashboard data');
    setLoadingSection('dashboard');
    // Simulate fetching new data
    setTimeout(() => {
      setLoadingSection(null);
      // In a real app, you would fetch updated dashboard data from the API here
    }, 1000);
  };

  const handleRefreshNotifications = () => {
    console.log('Refreshing notifications');
    setLoadingSection('notifications');
    // Simulate fetching new data
    setTimeout(() => {
      setLoadingSection(null);
      // In a real app, you would fetch updated notifications from the API here
    }, 1000);
  };

  const handleRefreshDocuments = () => {
    console.log('Refreshing verified documents');
    setLoadingSection('verified-documents');
    // Simulate fetching new data
    setTimeout(() => {
      setLoadingSection(null);
      // In a real app, you would fetch updated documents from the API here
    }, 1000);
  };

  // Handler functions for verified documents
  const handleViewDocumentCertificate = (id: string) => {
    console.log(`View certificate for document ${id}`);
    // Implement view certificate logic
  };

  const handleRevokeDocument = (id: string) => {
    console.log(`Revoke document ${id}`);
    // Implement revoke logic
  };

  const handleVerifyOnBlockchain = (id: string) => {
    console.log(`Verify document ${id} on blockchain`);
    // Implement blockchain verification logic
  };

  // Handler function for updating organization profile
  const handleUpdateOrganizationProfile = async (profile: Partial<typeof mockOrgProfile>) => {
    console.log('Update organization profile', profile);
    // Implement update profile logic
  };

  useEffect(() => {
    // Check if user is logged in
    const verifierData = localStorage.getItem('verifier');
    const verifierToken = localStorage.getItem('verifierToken');
    
    if (!verifierData || !verifierToken) {
      navigate('/verifier-login');
      return;
    }

    try {
      const userData = JSON.parse(verifierData);
      setUser(userData);
      
      // Set auth header for API requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${verifierToken}`;
      
      // Fetch dashboard data
      loadDashboardData();
    } catch (err) {
      console.error('Error loading user data', err);
      localStorage.removeItem('verifier');
      localStorage.removeItem('verifierToken');
      localStorage.removeItem('isVerifierLoggedIn');
      navigate('/verifier-login');
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with your actual API call to fetch verifier dashboard data
      // const response = await axios.get(`${API_URL}/verifier/dashboard`);
      // Process response data here
      
      // For now, we'll just simulate a loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading dashboard data');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('verifier');
    localStorage.removeItem('verifierToken');
    localStorage.removeItem('isVerifierLoggedIn');
    navigate('/verifier-login');
  };

  // Handle notifications
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 text-white flex">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto my-auto"></div>
      </div>
    );
  }

  // If no user, show empty state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 text-white flex">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Error</h2>
          <p className="mb-6">Unable to load verifier data. Please try logging in again.</p>
          <button
            onClick={() => navigate('/verifier-login')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 text-white">
      {/* Add Toaster for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      
      {/* Notification Popup with Blur Effect */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div 
            className="absolute top-16 right-4 w-80 md:w-96 bg-dark-700 rounded-xl shadow-2xl border border-dark-600 overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-dark-600 flex justify-between items-center">
              <h3 className="font-medium">Recent Notifications</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300"
                  disabled={unreadCount === 0}
                >
                  Mark All as Read
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
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
              {notifications.length > 5 && (
                <div className="p-3 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    View All {notifications.length} Notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-dark-600 shadow-xl sticky top-0 z-30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 mr-8">
                <img src={logo} alt="Logo" className="h-9 w-auto" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">Verifier Portal</span>
                  <span className="text-xs text-gray-400">Blockchain Verification System</span>
                </div>
            </div>
            
              <nav className="hidden lg:flex">
                <div className="flex bg-dark-700/50 backdrop-blur-sm rounded-xl p-1 shadow-inner">
              <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setShowNotifications(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'dashboard'
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                        : "text-gray-300 hover:bg-dark-600/70 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
              </button>
              <button
                    onClick={() => {
                      setActiveTab('verification-requests');
                      setShowNotifications(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'verification-requests'
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                        : "text-gray-300 hover:bg-dark-600/70 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>Requests</span>
                    </div>
              </button>
              <button
                    onClick={() => {
                      setActiveTab('verified-documents');
                      setShowNotifications(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'verified-documents'
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                        : "text-gray-300 hover:bg-dark-600/70 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Documents</span>
                    </div>
              </button>
              <button
                    onClick={() => {
                      setActiveTab('history');
                      setShowNotifications(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'history'
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                        : "text-gray-300 hover:bg-dark-600/70 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>History</span>
          </div>
              </button>
            <button 
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'notifications'
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                        : "text-gray-300 hover:bg-dark-600/70 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
                      <span>Notifications</span>
              {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 inline-flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
                    </div>
            </button>
                </div>
              </nav>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Mobile menu button */}
              <button className="lg:hidden p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* User dropdown */}
            <div className="relative">
              <button 
                  onClick={() => {
                    setActiveTab('organization-profile');
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium shadow-md shadow-primary-500/20">
                  {user.firstName?.charAt(0) || 'V'}
                </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-700"></div>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user.name || 'Verifier'}</p>
                    <p className="text-xs text-gray-400">Verified User</p>
                  </div>
              </button>
            </div>
            
              {/* Logout button */}
            <button
                onClick={() => {
                  handleLogout();
                  setShowNotifications(false);
                }}
                className="p-2 rounded-lg bg-dark-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors"
              aria-label="Logout"
                title="Logout"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            </div>
          </div>
          
          {/* Mobile navigation - hidden by default, shown when menu button is clicked */}
          <div className="hidden">
            <div className="pt-4 pb-2 border-t border-dark-600 mt-4">
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setShowNotifications(false);
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                    activeTab === 'dashboard'
                      ? "bg-primary-500 text-white"
                      : "text-gray-300 hover:bg-dark-700"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Dashboard</span>
                </button>
                {/* Additional mobile menu items would go here */}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className={`container mx-auto px-4 py-8 max-w-7xl ${showNotifications ? 'blur-sm pointer-events-none' : ''}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <DashboardSection
              key="dashboard"
              user={user}
              notifications={notifications}
              unreadCount={unreadCount}
              setActiveTab={(tab: any) => setActiveTab(tab as any)}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              clearNotifications={clearNotifications}
              removeNotification={removeNotification}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              refreshDashboard={handleRefreshDashboard}
              loading={loadingSection === 'dashboard'}
            />
          )}
          
          {activeTab === 'metrics' && (
            <VerificationMetricsSection
              key="metrics"
              metrics={mockMetricsData.map(item => ({
                id: item.name.toLowerCase().replace(/\s+/g, '-'),
                title: item.name,
                value: typeof item.value === 'string' ? parseFloat(item.value.replace(/[^0-9.]/g, '')) : item.value,
                change: item.change,
                changeType: item.trend === 'up' ? 'increase' : item.trend === 'down' ? 'decrease' : 'neutral',
                icon: <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }))}
              loading={loadingSection === 'metrics'}
              timeRange="week"
              onTimeRangeChange={() => {}}
              documentVerificationsChart={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Verifications',
                  data: [65, 59, 80, 81, 56, 55],
                  backgroundColor: '#3b82f6',
                  borderColor: '#3b82f6',
                  borderWidth: 2
                }]
              }}
              documentTypeDistribution={{
                labels: ['Passports', 'Licenses', 'Certificates', 'Degrees'],
                datasets: [{
                  label: 'Document Types',
                  data: [30, 25, 15, 30],
                  backgroundColor: '#3b82f6',
                  borderColor: '#1f2937',
                  borderWidth: 1
                }]
              }}
            />
          )}
          
          {activeTab === 'history' && (
            <VerificationHistorySection
              key="history"
              verifications={mockVerifications}
              loading={loadingSection === 'history'}
              onViewDetails={() => {}}
              onDownload={() => {}}
              onVerificationStatusChange={(id, status) => {}}
            />
          )}
          
          {activeTab === 'verification-requests' && (
            <VerificationRequestsSection
              key="verification-requests"
              requests={mockVerificationRequests}
              loadingRequests={loadingSection === 'verification-requests'}
              rejectRequest={handleRejectRequest}
              approveRequest={handleApproveRequest}
              reviewRequest={handleReviewRequest}
              refreshRequests={handleRefreshRequests}
            />
          )}
          
          {activeTab === 'verified-documents' && (
            <VerifiedDocumentsSection
              key="verified-documents"
              documents={mockVerifiedDocuments}
              loadingDocuments={loadingSection === 'verified-documents'}
              viewDocumentCertificate={handleViewDocumentCertificate}
              revokeDocument={handleRevokeDocument}
              verifyOnBlockchain={handleVerifyOnBlockchain}
              refreshDocuments={handleRefreshDocuments}
            />
          )}
          
          {activeTab === 'organization-profile' && (
            <OrganizationProfileSection
              key="organization-profile"
              profile={mockOrgProfile}
              loading={loadingSection === 'organization-profile'}
              updateOrganizationProfile={handleUpdateOrganizationProfile}
            />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationsSection
              key="notifications"
              notifications={notifications}
              loading={loadingSection === 'notifications'}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              clearNotifications={clearNotifications}
              removeNotification={removeNotification}
              refreshNotifications={handleRefreshNotifications}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default VerifierDashboard;