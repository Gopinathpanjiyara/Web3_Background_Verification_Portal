import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface OrganizationWarningProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrganizationWarning: React.FC<OrganizationWarningProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="bg-red-900/30 p-3 rounded-full mr-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Organization Registration Required</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          Individual accounts within organizations must be created by your organization administrator. Please contact your organization administrator to setup your account with FirstReference.
        </p>
        
        <div className="flex justify-between">
          <button
            onClick={() => {
              onClose();
              navigate('/register/organization');
            }}
            className="px-4 py-2 text-primary-500 hover:text-primary-400 transition-colors"
          >
            Register Organization
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrganizationWarning; 