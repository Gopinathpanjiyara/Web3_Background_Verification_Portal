import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginButton } from '@opencampus/ocid-connect-js';

const OCIDAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // Parse URL for error messages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('error');
    if (errorMessage) {
      setConnectionError(decodeURIComponent(errorMessage));
    }
  }, [location]);

  // Handle WebSocket and other errors
  useEffect(() => {
    // Mark page as loaded after a delay
    const loadTimer = setTimeout(() => {
      setPageLoaded(true);
    }, 1000);
    
    // Global error handler to catch WebSocket errors
    const handleError = (event: ErrorEvent) => {
      console.error('Error detected:', event);
      if (typeof event.message === 'string' && 
         (event.message.includes('WebSocket') || 
          event.message.toLowerCase().includes('unauthorized') || 
          event.message.toLowerCase().includes('origin not allowed'))) {
        setConnectionError('Connection error with authentication service: Unauthorized origin. Please check your network settings and try again.');
      }
      
      // Also catch getAttribute errors that might be from filter_content.js
      if (typeof event.message === 'string' && 
          event.message.includes('getAttribute') && 
          event.message.includes('undefined')) {
        console.warn('Caught getAttribute error, likely from filter_content.js - this is expected and can be ignored');
        // We don't set a UI error for this as it's likely a non-critical error
      }
    };

    // Listen for unhandled errors
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      clearTimeout(loadTimer);
    };
  }, []);

  // DOM safety wrapper - add this before the component renders to ensure DOM elements are available
  useEffect(() => {
    // Create a fake element with the required attribute to prevent filter_content.js errors
    const preventFilterContentError = () => {
      try {
        // This creates a "safety" element that filter_content.js might be looking for
        const safetyElement = document.createElement('div');
        safetyElement.id = 'filter-content-safety';
        safetyElement.setAttribute('data-filter-content', 'true');
        document.body.appendChild(safetyElement);
        
        return () => {
          if (safetyElement.parentNode) {
            safetyElement.parentNode.removeChild(safetyElement);
          }
        };
      } catch (e) {
        console.warn('Failed to create safety element', e);
        return () => {};
      }
    };
    
    return preventFilterContentError();
  }, []);

  // Provide helpful guidance if there's a connection error
  const handleRetry = () => {
    setConnectionError(null);
    window.location.href = '/ocid-auth';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section (dark background with logo) - fixed */}
      <div className="bg-dark-900 text-white w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden md:fixed md:h-screen md:left-0">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-dark-900 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-800/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-700/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl"></div>
        
        <div className="relative z-10 text-center max-w-lg">
          <div className="w-52 h-52 mx-auto mb-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
              <path fill="#6366f1" d="M96.49649 103.5349C94.317464 107.44894 91.53465299999999 111.0252 89.873611 115.21530999999999C83.058902 132.40616999999997 107.41146 134.95591 105.2919 119.70778999999999C104.94348 117.20169999999999 103.9493 114.75995999999999 102.80172999999999 112.51981999999998C101.13350999999999 109.26313999999998 99.01830999999999 106.16811999999999 96.49649 103.53489999999998zM80.323623 125.99722C81.86939699999999 132.11212 85.242888 135.49681 91.105535 137.67763C89.578384 131.63986 86.088058 128.21289 80.323623 125.99722zM113.56787 126.89572C107.94275 127.98485 104.51737 131.37192 102.78594 136.77917C108.41099 135.6901 111.83646 132.3029 113.56787 126.89572zM75.641606 134.22405C69.29319699999999 134.19395 63.048271 139.29384000000002 57.86127499999999 142.17011L57.86127499999999 143.96713C63.76212099999999 147.23922 72.10509099999999 154.23748 79.339125 151.24981C86.731915 148.19654 85.448319 135.84450999999999 77.61409499999999 134.4048C76.95621799999999 134.28381 76.29835399999999 134.227 75.641606 134.22399zM118.2481 134.22405C117.59137999999999 134.22705 116.93348999999999 134.28385 116.27564 134.40487000000002C108.44140999999999 135.84458 107.15778 148.19661000000002 114.55060999999999 151.24988000000002C121.78464 154.23755000000003 130.12932999999998 147.23929 136.03019 143.96720000000002L136.03019 142.17017C130.84318000000002 139.2939 124.59656000000001 134.19508000000002 118.24810000000001 134.22412000000003zM96.98962 138.47963000000001C96.84089 138.47893000000002 96.68871 138.48663000000002 96.53158 138.49973000000003C91.580782 138.96534000000003 92.501964 146.77359000000004 97.35814 146.24220000000003C102.02469 145.73147000000003 101.59626 138.49986 96.98962 138.47870000000003zM102.78594 148.45958000000002C104.33171999999999 154.57441000000003 107.70521 157.95917000000003 113.56787 160.13998C112.02022 154.02097 108.4701 150.91422 102.78594 148.45958000000002zM91.105535 149.35807000000003C85.480535 150.44711000000004 82.055002 153.83427000000003 80.323623 159.24149000000003C85.948626 158.15238000000002 89.374156 154.76529000000002 91.105535 149.35807000000003zM97.59152 156.34593000000004C91.963654 156.27303000000003 85.976059 161.43079000000003 89.738491 170.92193000000003C91.39711299999999 175.10612000000003 94.318484 178.69027000000003 96.49649 182.60234000000003C99.02655999999999 179.96076000000002 101.13319999999999 176.84656000000004 102.87369 173.61738000000003C104.08700999999999 171.36601000000002 105.00744999999999 168.98146000000003 105.31295 166.42945000000003C106.12769 159.62327000000002 101.96875 156.40255000000002 97.59152 156.34593000000004z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">First Reference</h1>
          <p className="text-lg text-gray-200">Secure document verification with blockchain</p>
        </div>
      </div>
      
      {/* Right section (form) - scrollable */}
      <div className="w-full md:w-1/2 bg-dark-800 p-8 md:p-12 flex items-center justify-center md:ml-[50%] min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-500 mb-4">Connect with Open Campus</h2>
            <p className="text-gray-300">Please authenticate with Open Campus to continue registration</p>
          </div>
          
          {connectionError && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6 text-center">
              <div className="text-red-300 text-xl mb-2">⚠️ Connection Error</div>
              <p>{connectionError}</p>
              <div className="mt-3">
                <button 
                  onClick={handleRetry} 
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}
          
          {/* After page is loaded and no connection error, show WebSocket troubleshooting tips */}
          {pageLoaded && !connectionError && (
            <div className="bg-dark-700 p-4 rounded-lg mb-6 text-center text-gray-400 text-sm">
              <p>If login button doesn't appear or errors occur, ensure your browser allows WebSocket connections.</p>
              <p className="mt-1">Some browsers or corporate networks may block these connections.</p>
            </div>
          )}

          {/* Use the official OCID LoginButton component */}
          <div id="ocid-login-button-container" className="w-full flex justify-center">
            <LoginButton 
              pill={false}
              disabled={false}
              theme={{
                button: "w-full max-w-md py-3 mb-4 rounded-lg bg-dark-700 text-white font-semibold hover:bg-dark-600 transition-colors flex items-center justify-center relative"
              }}
            />
          </div>
          
          {/* Development mode notice */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Development mode enabled: OCID authentication in sandbox mode</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCIDAuthPage; 