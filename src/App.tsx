import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@pages/LoginPage';
import RegisterTypePage from '@pages/RegisterTypePage';
import IndividualRegisterPage from '@pages/IndividualRegisterPage';
import OrganizationRegisterPage from '@pages/OrganizationRegisterPage';
import HomePage from '@pages/HomePage';
import Dashboard from '@pages/Dashboard';
import PricingPage from '@pages/PricingPage';
import VerifyDocument from '@pages/VerifyDocument';
import ScrollToTop from '@components/layout/ScrollToTop';
import './styles/index.css';
import { OCConnect } from '@opencampus/ocid-connect-js';

const opts = {
    clientId: '<Does_Not_Matter_For_Sandbox_mode>',
    redirectUri: 'http://localhost:3001/redirect',
    referralCode: 'PARTNER6',
};

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