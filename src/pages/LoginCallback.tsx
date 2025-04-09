import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSdk } from "../sdk";

const LoginCallback = () => {
  const authSdk = getSdk();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing login...');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setStatus('Starting login redirect handling...');
        console.log('Starting login redirect handling...');
        
        // Check if we're authenticated before handling redirect
        const isAuthBefore = authSdk.isAuthenticated();
        console.log('Is authenticated before redirect:', isAuthBefore);
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        const code = urlParams.get('code');
        
        console.log('URL parameters:', { state, code });
        
        // If we have a code, handle the login redirect
        if (code) {
          await authSdk.handleLoginRedirect();
          console.log('Redirect handled successfully');
        } else {
          console.log('No code parameter found, redirecting to home');
          // If we don't have a code, redirect to home
          navigate('/');
          return;
        }
        
        // Check if we're authenticated after handling redirect
        const isAuthAfter = authSdk.isAuthenticated();
        console.log('Is authenticated after redirect:', isAuthAfter);
        
        if (isAuthAfter && authSdk.OCId) {
          console.log('OCID obtained:', authSdk.OCId);
          setStatus('Login successful! Redirecting...');
          localStorage.setItem('ocid', authSdk.OCId);
          setTimeout(() => navigate('/'), 1000);
        } else {
          console.log('No OCID after redirect');
          setError('Authentication failed. No OCID received.');
          setStatus('Authentication failed');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Login redirect error:', error);
        setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
        setStatus('Error occurred');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleRedirect();
  }, [navigate, authSdk]);

  const handleDebug = () => {
    const isAuth = authSdk.isAuthenticated();
    const ocId = authSdk.OCId;
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const code = urlParams.get('code');
    
    const debugData = {
      isAuthenticated: isAuth,
      ocId: ocId,
      state: state,
      code: code,
      url: window.location.href
    };
    
    setDebugInfo(JSON.stringify(debugData, null, 2));
    console.log('Debug info:', debugData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">{status}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        <button 
          onClick={handleDebug}
          className="mt-4 px-4 py-2 bg-dark-700 text-white rounded hover:bg-dark-600"
        >
          Debug Info
        </button>
        
        {debugInfo && (
          <pre className="mt-4 p-4 bg-dark-800 text-white text-left rounded text-xs overflow-auto max-w-md">
            {debugInfo}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LoginCallback; 