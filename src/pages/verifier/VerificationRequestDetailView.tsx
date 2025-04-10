import React, { useState } from 'react';
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
  requests: VerificationRequest[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReview: (id: string) => void;
  processingRequestId: string | null;
}

const VerificationRequestDetailView: React.FC<VerificationRequestDetailViewProps> = ({
  requests,
  onClose,
  onApprove,
  onReject,
  onReview,
  processingRequestId
}) => {
  const [activeRequestIndex, setActiveRequestIndex] = useState(0);
  const activeRequest = requests[activeRequestIndex];
  
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
      onApprove(activeRequest.id);
      toast.success('Request approved successfully');
    } catch (error) {
      toast.error('Failed to approve request');
      console.error('Error approving request:', error);
    }
  };

  const handleReject = () => {
    try {
      onReject(activeRequest.id);
      toast.success('Request rejected successfully');
    } catch (error) {
      toast.error('Failed to reject request');
      console.error('Error rejecting request:', error);
    }
  };

  const handleReview = () => {
    try {
      onReview(activeRequest.id);
      toast.success('Request marked for review');
    } catch (error) {
      toast.error('Failed to mark request for review');
      console.error('Error marking request for review:', error);
    }
  };

  const nextRequest = () => {
    if (activeRequestIndex < requests.length - 1) {
      setActiveRequestIndex(activeRequestIndex + 1);
    }
  };

  const prevRequest = () => {
    if (activeRequestIndex > 0) {
      setActiveRequestIndex(activeRequestIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-dark-900/95 backdrop-blur-md">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-dark-800 border-b border-dark-600/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 hover:bg-dark-600/30 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {activeRequest.documentType}
              </h1>
              <p className="text-xs text-gray-400">
                From: {activeRequest.requesterName} • {formatDate(activeRequest.submittedDate)}
              </p>
            </div>
          </div>
          
          {/* Document navigation */}
          {requests.length > 1 && (
            <div className="flex items-center gap-2 mx-4">
              <button
                onClick={prevRequest}
                disabled={activeRequestIndex === 0}
                className="p-1.5 rounded-full bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-400">
                {activeRequestIndex + 1} / {requests.length}
              </span>
              <button
                onClick={nextRequest}
                disabled={activeRequestIndex === requests.length - 1}
                className="p-1.5 rounded-full bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
            
          {/* Action buttons */}
          {activeRequest.status === 'pending' && !processingRequestId && (
            <div className="flex gap-2">
                <button 
                  onClick={handleReview}
                className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-sm flex items-center transition-colors"
                disabled={processingRequestId === activeRequest.id}
                >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Review
                </button>
                <button 
                  onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded text-sm flex items-center transition-colors"
                disabled={processingRequestId === activeRequest.id}
                >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                <button 
                  onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded text-sm flex items-center transition-colors"
                disabled={processingRequestId === activeRequest.id}
                >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            )}
          </header>
          
        {/* Content */}
        <div className="flex-grow flex overflow-hidden">
          {/* Document preview - Left side */}
          <div className="w-2/3 h-full bg-dark-900 flex items-center justify-center p-4 overflow-auto">
            {activeRequest.documentUrl.endsWith('.pdf') ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-dark-700 p-8 rounded-lg border border-dark-600">
                  <svg className="w-20 h-20 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                <h3 className="text-lg font-medium mt-4 text-gray-300">PDF Document</h3>
                <p className="text-sm text-gray-500 mb-4">This file requires a PDF viewer</p>
                          <a 
                  href={activeRequest.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                  className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded flex items-center transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                  Open PDF
                          </a>
                        </div>
                      ) : (
              <div className="max-h-full">
                            <img 
                  src={activeRequest.documentUrl} 
                              alt="Document" 
                  className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/800x600/2a2a2a/FFFFFF/png?text=Image+Not+Available';
                              }}
                            />
                          </div>
            )}
          </div>
          
          {/* Request details - Right side */}
          <div className="w-1/3 border-l border-dark-700 h-full overflow-y-auto p-4">
            {/* Request details */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">REQUEST DETAILS</h3>
                <span className={`
                  text-xs font-medium px-2 py-1 rounded-full 
                  ${activeRequest.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  ${activeRequest.status === 'verified' ? 'bg-green-500/20 text-green-400' : ''}
                  ${activeRequest.status === 'rejected' ? 'bg-red-500/20 text-red-400' : ''}
                `}>
                  {activeRequest.status.charAt(0).toUpperCase() + activeRequest.status.slice(1)}
                </span>
              </div>
              
              <div className="bg-dark-800 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Request ID</p>
                    <p className="text-sm font-medium text-primary-300">{activeRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Document Type</p>
                    <p className="text-sm font-medium text-white">{activeRequest.documentType}</p>
                          </div>
                        </div>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-500">Submitted By</p>
                  <div className="flex items-center mt-1">
                    <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-white">
                        {activeRequest.requesterName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white">{activeRequest.requesterName}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Submission Date</p>
                  <p className="text-sm text-white">{formatDate(activeRequest.submittedDate)}</p>
                </div>
              </div>
            </div>
            
            {/* Request notes */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">NOTES</h3>
              <div className="bg-dark-800 rounded-lg p-3 whitespace-pre-line text-sm text-gray-300">
                {activeRequest.requestDetails || "No additional notes provided."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestDetailView; 