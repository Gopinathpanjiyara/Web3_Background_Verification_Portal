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
import ScrollToTop from '@components/layout/ScrollToTop';
import './styles/index.css';
import { OCConnect } from '@opencampus/ocid-connect-js';

const domain = typeof window !== 'undefined' ? window.location.origin : '';

const opts = {
  storageType: 'cookie',
  domain: '',
  redirectUri: `${domain}/register/individual`,
  sameSite: false,
  clientId: '<Does_Not_Matter_For_Sandbox_mode>',
  referralCode: 'PARTNER6',
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
      <div className="text-red-500 mb-4">⚠️</div>
      <p className="text-white text-lg">Login failed</p>
      <p className="text-red-400 mt-2">{error?.message || 'An error occurred'}</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <OCConnect opts={opts} sandboxMode={true}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterTypePage />} />
          <Route path="/register/individual" element={<IndividualRegisterPage />} />
          <Route path="/register/organization" element={<OrganizationRegisterPage />} />
          <Route path="/ocid-auth" element={<OCIDAuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/verify" element={<VerifyDocument />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OCConnect>
    </>
  );
}

export default App; 