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
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

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
        className="absolute inset-0 w-full h-full bg-dark-900/95 backdrop-blur-sm overflow-hidden"
      >
        <div className="flex flex-col w-full h-full overflow-y-auto">
          {/* Header with back button */}
          <header className="bg-gradient-to-r from-dark-800/90 to-dark-700/90 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10 border-b border-dark-600/50">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-dark-600/30 rounded-full"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                Verification Request Details
              </h1>
            </div>
            
            {request.status === 'pending' && !processingRequestId && (
              <div className="flex space-x-3">
                <button 
                  onClick={handleReview}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all flex items-center shadow-md hover:shadow-blue-500/20"
                  disabled={processingRequestId === request.id}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Review
                </button>
                <button 
                  onClick={handleApprove}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg transition-all flex items-center shadow-md hover:shadow-green-500/20"
                  disabled={processingRequestId === request.id}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                <button 
                  onClick={handleReject}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-2 px-4 rounded-lg transition-all flex items-center shadow-md hover:shadow-red-500/20"
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
                    className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-xl p-6 border border-dark-600/30"
                  >
                    <h2 className="text-xl font-bold mb-4 border-b border-dark-600/50 pb-2 flex items-center text-primary-300">
                      <svg className="w-5 h-5 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Request Information
                    </h2>
                    <div className="space-y-4">
                      <div className="p-3 bg-dark-900/30 rounded-lg hover:bg-dark-900/50 transition-colors">
                        <p className="text-sm text-gray-400">Request ID</p>
                        <p className="font-medium text-primary-300">{request.id}</p>
                      </div>
                      
                      <div className="p-3 bg-dark-900/30 rounded-lg hover:bg-dark-900/50 transition-colors">
                        <p className="text-sm text-gray-400">Requester</p>
                        <div className="flex items-center mt-1">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md mr-2">
                            <span className="text-sm font-bold text-white">
                              {request.requesterName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium">{request.requesterName}</p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-dark-900/30 rounded-lg hover:bg-dark-900/50 transition-colors">
                        <p className="text-sm text-gray-400">Document Type</p>
                        <p className="font-medium flex items-center mt-1">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/20 mr-2"></div>
                          {request.documentType}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-dark-900/30 rounded-lg hover:bg-dark-900/50 transition-colors">
                        <p className="text-sm text-gray-400">Submitted Date</p>
                        <p className="font-medium flex items-center mt-1">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(request.submittedDate)}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-dark-900/30 rounded-lg hover:bg-dark-900/50 transition-colors">
                        <p className="text-sm text-gray-400">Status</p>
                        <div className="mt-1">
                          {request.status === 'pending' && (
                            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/30 inline-flex items-center shadow-sm shadow-yellow-500/10">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse mr-1.5"></span>
                              Pending
                            </span>
                          )}
                          {request.status === 'verified' && (
                            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30 inline-flex items-center shadow-sm shadow-green-500/10">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5"></span>
                              Verified
                            </span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/10 text-red-400 border border-red-500/30 inline-flex items-center shadow-sm shadow-red-500/10">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1.5"></span>
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
                    className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-xl p-6 border border-dark-600/30"
                  >
                    <h2 className="text-xl font-bold mb-4 border-b border-dark-600/50 pb-2 flex items-center text-blue-300">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Request Details
                    </h2>
                    <p className="text-gray-300 whitespace-pre-line bg-dark-900/30 p-4 rounded-lg border border-dark-600/30">
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
                    className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl shadow-xl p-6 sticky top-24 border border-dark-600/30"
                  >
                    <h2 className="text-xl font-bold mb-4 border-b border-dark-600/50 pb-2 flex items-center text-green-300">
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Document Preview
                    </h2>
                    <div className="mt-4 border border-dark-600/60 rounded-lg overflow-hidden bg-dark-900/40 shadow-lg hover:shadow-xl transition-shadow">
                      {request.documentUrl.endsWith('.pdf') ? (
                        <div className="bg-dark-700/50 p-6 text-center">
                          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 p-5 rounded-lg border border-red-500/20 mb-4">
                            <svg className="w-24 h-24 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="mt-4 text-lg font-medium bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">PDF Document</p>
                          <p className="text-sm text-gray-400 mb-4">This document is a PDF file and requires PDF viewer to open.</p>
                          <a 
                            href={request.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-primary-500/20"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View PDF
                          </a>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-b from-dark-700/50 to-dark-800/50 p-4">
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                            <img 
                              src={request.documentUrl} 
                              alt="Document" 
                              className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md group-hover:shadow-lg group-hover:shadow-primary-500/10 transition-all"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/800x600/2a2a2a/FFFFFF/png?text=Image+Not+Available';
                              }}
                            />
                          </div>
                          <div className="mt-4 text-center">
                            <a 
                              href={request.documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-primary-500/20"
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