import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface VerificationRequest {
  id: string;
  requesterName: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedDate: string;
  documentUrl: string;
  requestDetails: string;
}

interface VerificationRequestDetailViewProps {
  request: VerificationRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReview: (id: string) => void;
  processingRequestId: string | null;
}

const VerificationRequestDetailView: React.FC<VerificationRequestDetailViewProps> = ({
  request,
  onClose,
  onApprove,
  onReject,
  onReview,
  processingRequestId
}) => {
  const handleApprove = () => {
    try {
      onApprove(request.id);
      toast.success('Request approved successfully');
    } catch (error) {
      toast.error('Failed to approve request');
      console.error('Error approving request:', error);
    }
  };

  const handleReject = () => {
    try {
      onReject(request.id);
      toast.success('Request rejected successfully');
    } catch (error) {
      toast.error('Failed to reject request');
      console.error('Error rejecting request:', error);
    }
  };

  const handleReview = () => {
    try {
      onReview(request.id);
      toast.success('Request marked for review');
    } catch (error) {
      toast.error('Failed to mark request for review');
      console.error('Error marking request for review:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999]" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        zIndex: 9999
      }}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 w-full h-full bg-dark-900 overflow-hidden"
      >
        <div className="flex flex-col w-full h-full bg-dark-900 overflow-y-auto">
          {/* Header with back button */}
          <header className="bg-dark-800 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold">Verification Request Details</h1>
            </div>
            
            {request.status === 'pending' && !processingRequestId && (
              <div className="flex space-x-3">
                <button 
                  onClick={handleReview}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
                  disabled={processingRequestId === request.id}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Review
                </button>
                <button 
                  onClick={handleApprove}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
                  disabled={processingRequestId === request.id}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                <button 
                  onClick={handleReject}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
                  disabled={processingRequestId === request.id}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            )}
          </header>
          
          {/* Main content */}
          <div className="flex-grow p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column - Request information */}
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-dark-800 rounded-xl shadow-xl p-6"
                  >
                    <h2 className="text-xl font-bold mb-4 border-b border-dark-600 pb-2">Request Information</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Request ID</p>
                        <p className="font-medium">{request.id}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Requester</p>
                        <p className="font-medium">{request.requesterName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Document Type</p>
                        <p className="font-medium">{request.documentType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Submitted Date</p>
                        <p className="font-medium">{request.submittedDate}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <div className="mt-1">
                          {request.status === 'pending' && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                              Pending
                            </span>
                          )}
                          {request.status === 'verified' && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                              Verified
                            </span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-dark-800 rounded-xl shadow-xl p-6"
                  >
                    <h2 className="text-xl font-bold mb-4 border-b border-dark-600 pb-2">Request Details</h2>
                    <p className="text-gray-300 whitespace-pre-line">
                      {request.requestDetails}
                    </p>
                  </motion.div>
                </div>
                
                {/* Right column - Document preview */}
                <div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-dark-800 rounded-xl shadow-xl p-6 sticky top-24"
                  >
                    <h2 className="text-xl font-bold mb-4 border-b border-dark-600 pb-2">Document Preview</h2>
                    <div className="mt-4 border border-dark-600 rounded-lg overflow-hidden">
                      {request.documentUrl.endsWith('.pdf') ? (
                        <div className="bg-dark-700 p-6 text-center">
                          <svg className="w-24 h-24 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-4 text-lg font-medium">PDF Document</p>
                          <p className="text-sm text-gray-400 mb-4">This document is a PDF file and requires PDF viewer to open.</p>
                          <a 
                            href={request.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View PDF
                          </a>
                        </div>
                      ) : (
                        <div className="bg-dark-700 p-2">
                          <img 
                            src={request.documentUrl} 
                            alt="Document" 
                            className="w-full h-auto max-h-[500px] object-contain rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://placehold.co/800x600/2a2a2a/FFFFFF/png?text=Image+Not+Available';
                            }}
                          />
                          <div className="mt-4 text-center">
                            <a 
                              href={request.documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open Full Image
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationRequestDetailView; 