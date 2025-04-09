import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import VerificationRequestDetailView from './VerificationRequestDetailView';

interface VerificationRequest {
  id: string;
  requesterName: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedDate: string;
  documentUrl: string;
  requestDetails: string;
}

interface VerificationRequestsSectionProps {
  requests: VerificationRequest[];
  loadingRequests: boolean;
  rejectRequest: (id: string) => void;
  approveRequest: (id: string) => void;
  reviewRequest: (id: string) => void;
  refreshRequests: () => void;
}

const VerificationRequestsSection: React.FC<VerificationRequestsSectionProps> = ({
  requests,
  loadingRequests,
  rejectRequest,
  approveRequest,
  reviewRequest,
  refreshRequests
}) => {
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showFullScreenDetail, setShowFullScreenDetail] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, searchTerm]);

  const filterRequests = () => {
    let filtered = [...requests];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.id.toLowerCase().includes(term) ||
        req.requesterName.toLowerCase().includes(term) ||
        req.documentType.toLowerCase().includes(term)
      );
    }
    
    setFilteredRequests(filtered);
  };

  const openDetailsModal = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const openFullScreenDetail = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowFullScreenDetail(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => setSelectedRequest(null), 300);
  };

  const closeFullScreenDetail = () => {
    setShowFullScreenDetail(false);
    setTimeout(() => setSelectedRequest(null), 300);
  };

  const handleRejectRequest = (id: string) => {
    setProcessingRequestId(id);
    
    // Call the provided reject function
    try {
      rejectRequest(id);
      toast.success('Request rejected successfully');
    } catch (error) {
      toast.error('Failed to reject request');
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleApproveRequest = (id: string) => {
    setProcessingRequestId(id);
    
    // Call the provided approve function
    try {
      approveRequest(id);
      toast.success('Request approved successfully');
    } catch (error) {
      toast.error('Failed to approve request');
      console.error('Error approving request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReviewRequest = (id: string) => {
    setProcessingRequestId(id);
    
    // Call the provided review function
    try {
      reviewRequest(id);
      toast.success('Request marked for review');
    } catch (error) {
      toast.error('Failed to mark request for review');
      console.error('Error marking request for review:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRefresh = () => {
    refreshRequests();
    toast.success('Refreshing verification requests');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Verification Requests</h2>
            <button
              onClick={handleRefresh}
              disabled={loadingRequests}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              title="Refresh Requests"
              aria-label="Refresh verification requests"
            >
              <svg 
                className={`w-5 h-5 ${loadingRequests ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:border-primary-500"
                aria-label="Search verification requests"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
              aria-label="Filter by status"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        {loadingRequests ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No verification requests found</p>
            <p className="text-sm max-w-md text-center mt-2">
              {statusFilter !== 'all' 
                ? `There are no ${statusFilter} verification requests.`
                : searchTerm 
                  ? 'No requests match your search criteria.' 
                  : 'There are no verification requests at this time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-dark-600">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Requester
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600 bg-dark-800/30">
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id} 
                    className="hover:bg-dark-600/50 transition-colors cursor-pointer"
                    onClick={() => openFullScreenDetail(request)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {request.requesterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {request.documentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {request.submittedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking on action buttons
                    >
                      <div className="flex space-x-3">
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleReviewRequest(request.id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors disabled:text-blue-700 disabled:cursor-not-allowed"
                              title="Review"
                              aria-label="Mark for review"
                              disabled={processingRequestId === request.id}
                            >
                              <svg className={`w-5 h-5 ${processingRequestId === request.id ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            <button 
                              onClick={() => handleApproveRequest(request.id)}
                              className="text-green-400 hover:text-green-300 transition-colors disabled:text-green-700 disabled:cursor-not-allowed"
                              title="Approve"
                              aria-label="Approve request"
                              disabled={processingRequestId === request.id}
                            >
                              <svg className={`w-5 h-5 ${processingRequestId === request.id ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            
                            <button 
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-400 hover:text-red-300 transition-colors disabled:text-red-700 disabled:cursor-not-allowed"
                              title="Reject"
                              aria-label="Reject request"
                              disabled={processingRequestId === request.id}
                            >
                              <svg className={`w-5 h-5 ${processingRequestId === request.id ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Full Screen Detail View */}
      <AnimatePresence>
        {showFullScreenDetail && selectedRequest && (
          <VerificationRequestDetailView
            request={selectedRequest}
            onClose={closeFullScreenDetail}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onReview={handleReviewRequest}
            processingRequestId={processingRequestId}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VerificationRequestsSection; 