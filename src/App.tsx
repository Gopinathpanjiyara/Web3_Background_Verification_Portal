import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@pages/LoginPage';
import RegisterTypePage from '@pages/RegisterTypePage';
import IndividualRegisterPage from '@pages/IndividualRegisterPage';
import OrganizationRegisterPage from '@pages/OrganizationRegisterPage';
import OCIDAuthPage from '@pages/OCIDAuthPage';
import HomePage from '@pages/HomePage';
import Dashboard from '@pages/Dashboard';
import PricingPage from '@pages/PricingPage';
import VerifyDocument from '@pages/VerifyDocument';
import VerifierLoginPage from '@pages/verifier/VerifierLoginPage';
import VerifierDashboard from '@pages/verifier/VerifierDashboard';
import EducationVerification from '@pages/dashboard/services/EducationVerification';
import EmploymentVerification from '@pages/dashboard/services/EmploymentVerification';
import IdentityVerification from '@pages/dashboard/services/IdentityVerification';
import AddressVerification from '@pages/dashboard/services/AddressVerification';
import ScrollToTop from '@components/layout/ScrollToTop';
import './styles/index.css';
import { OCConnect, LoginCallBack } from '@opencampus/ocid-connect-js';

const domain = typeof window !== 'undefined' ? window.location.origin : '';

// Include all potential origins that might be used during development and production
const allowedOrigins = [
  domain,
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5001',
  'http://127.0.0.1:5002',
  'https://opencampus.in',
  'https://*.opencampus.in',
  // Add your production domains if needed
];

const opts = {
  storageType: 'cookie',
  domain: '',  // Empty string to allow cookies on any domain during development
  redirectUri: `${domain}/redirect`,
  sameSite: false,
  clientId: '<Does_Not_Matter_For_Sandbox_mode>',
  referralCode: 'PARTNER6',
  allowedWebSocketOrigins: allowedOrigins,
  allowedOrigins: allowedOrigins,
  skipRecaptcha: true, // Skip reCAPTCHA to avoid unauthorized errors
  devMode: true, // Enable development mode for easier debugging
};

const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Processing login...</p>
    </div>
  </div>
);

const ErrorComponent = ({ error }: { error: any }) => (
  <div className="flex items-center justify-center min-h-screen bg-dark-900">
    <div className="text-center">
      <div className="text-red-500 mb-4 text-4xl">⚠️</div>
      <p className="text-white text-lg">Login failed</p>
      <p className="text-red-400 mt-2">{error?.message || 'An error occurred'}</p>
      <pre className="mt-2 bg-dark-700 p-3 rounded text-xs text-gray-300 max-w-md mx-auto overflow-auto">
        {JSON.stringify(error, null, 2)}
      </pre>
      <div className="mt-4">
        <button 
          onClick={() => window.location.href = '/ocid-auth'} 
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

function App() {
  const handleLoginSuccess = () => {
    console.log('Login successful, navigating to registration page');
    // Use setTimeout to ensure cookies are properly set before redirect
    setTimeout(() => {
      window.location.href = '/register/individual';
    }, 300);
  };

  const handleLoginError = (error: any) => {
    console.error('Login error:', error);
    setTimeout(() => {
      window.location.href = '/ocid-auth?error=' + encodeURIComponent(error?.message || 'Unknown error');
    }, 2000);
  };

  return (
    <>
      <ScrollToTop />
      <OCConnect opts={opts} sandboxMode="development">
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterTypePage />} />
        <Route path="/register/individual" element={<IndividualRegisterPage />} />
        <Route path="/register/organization" element={<OrganizationRegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/services/education" element={<EducationVerification />} />
        <Route path="/dashboard/services/employment" element={<EmploymentVerification />} />
        <Route path="/dashboard/services/identity" element={<IdentityVerification />} />
        <Route path="/dashboard/services/address" element={<AddressVerification />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/verify" element={<VerifyDocument />} />
        <Route path="/verifier-login" element={<VerifierLoginPage />} />
        <Route path="/verifier/dashboard" element={<VerifierDashboard />} />
          <Route 
            path="/redirect" 
            element={
              <LoginCallBack
                successCallback={handleLoginSuccess}
                errorCallback={handleLoginError}
                customLoadingComponent={LoadingComponent}
                customErrorComponent={ErrorComponent}
              />
            } 
          />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OCConnect>
    </>
  );
}

export default App; 