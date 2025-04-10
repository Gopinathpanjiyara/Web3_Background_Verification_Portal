import React, { useState, useEffect, useCallback } from 'react';
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

interface VerificationRequestGroup {
  requesterName: string;
  requests: VerificationRequest[];
  totalPending: number;
  totalVerified: number;
  totalRejected: number;
  latestSubmission: string;
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
  const [groupedRequests, setGroupedRequests] = useState<VerificationRequestGroup[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showFullScreenDetail, setShowFullScreenDetail] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Memoize the filterRequests function with useCallback to prevent unnecessary re-creation
  const filterRequests = useCallback(() => {
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
    
    // Group requests by requester name
    const grouped: Record<string, VerificationRequest[]> = {};
    filtered.forEach(request => {
      if (!grouped[request.requesterName]) {
        grouped[request.requesterName] = [];
      }
      grouped[request.requesterName].push(request);
    });
    
    // Convert to array format with additional metadata
    const groupedArray: VerificationRequestGroup[] = Object.keys(grouped).map(name => {
      const requestGroup = grouped[name];
      const pending = requestGroup.filter(req => req.status === 'pending').length;
      const verified = requestGroup.filter(req => req.status === 'verified').length;
      const rejected = requestGroup.filter(req => req.status === 'rejected').length;
      
      // Find the latest submission date
      const latestDate = requestGroup.reduce((latest, req) => {
        const current = new Date(req.submittedDate).getTime();
        return current > latest ? current : latest;
      }, 0);
      
      return {
        requesterName: name,
        requests: requestGroup,
        totalPending: pending,
        totalVerified: verified,
        totalRejected: rejected,
        latestSubmission: new Date(latestDate).toISOString()
      };
    });
    
    // Sort groups by name
    groupedArray.sort((a, b) => a.requesterName.localeCompare(b.requesterName));
    
    setGroupedRequests(groupedArray);
  }, [requests, statusFilter, searchTerm]);

  // Use the memoized filterRequests in useEffect
  useEffect(() => {
    filterRequests();
  }, [filterRequests]);

  const openDetailsModal = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const openFullScreenDetail = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowFullScreenDetail(true);
  };

  // Add a new function to open all requests for a requester
  const openRequesterDetailView = (group: VerificationRequestGroup) => {
    setSelectedRequest(group.requests[0]); // Set the first request as selected
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

  const toggleGroup = (requesterName: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(requesterName)) {
      newExpandedGroups.delete(requesterName);
    } else {
      newExpandedGroups.add(requesterName);
    }
    setExpandedGroups(newExpandedGroups);
  };

  // Function to format date to a more readable format
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Verification Requests</h2>
            <button
              onClick={handleRefresh}
              disabled={loadingRequests}
              className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 disabled:from-primary-800 disabled:to-blue-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
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
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
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
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
              aria-label="Filter by status"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem' 
              }}
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
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500/30 border-t-4 border-t-primary-500"></div>
              <div className="absolute top-0 left-0 animate-ping h-16 w-16 rounded-full bg-primary-500/10 delay-150"></div>
            </div>
          </div>
        ) : groupedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <div className="relative">
              <svg className="w-20 h-20 text-gray-600 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-dark-600 flex items-center justify-center border-2 border-dark-800">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-bold mt-4 bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">No verification requests found</p>
            <p className="text-sm max-w-md text-center mt-2 text-gray-500">
              {statusFilter !== 'all' 
                ? `There are no ${statusFilter} verification requests.`
                : searchTerm 
                  ? 'No requests match your search criteria.' 
                  : 'There are no verification requests at this time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-dark-600 shadow-xl bg-gradient-to-b from-dark-800/50 to-dark-900/50">
            <div className="min-w-full">
              {groupedRequests.map((group, groupIndex) => (
                <div key={group.requesterName} className="mb-4 border-b border-dark-600/40 last:border-b-0 hover:bg-dark-700/30 transition-colors">
                  <div 
                    className="flex flex-col md:flex-row md:items-center p-4 cursor-pointer bg-gradient-to-r from-dark-700/80 to-dark-800/80 hover:from-dark-650 hover:to-dark-750 transition-all rounded-t-lg"
                    onClick={() => {
                      if (group.requests.length > 0) {
                        openRequesterDetailView(group);
                      }
                    }}
                  >
                    <div className="flex items-center flex-grow">
                      <div className="mr-4 flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md transition-all transform hover:scale-110">
                          <span className="text-base font-bold text-white">
                            {group.requesterName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white text-lg">{group.requesterName}</h3>
                          <span className="text-sm bg-dark-600 px-2 py-0.5 rounded-full text-gray-300">
                            {group.requests.length} request{group.requests.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Latest: {formatDate(group.latestSubmission)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex mt-3 md:mt-0 gap-4 items-center">
                      <div className="flex gap-2 ml-16 md:ml-0">
                        {group.totalPending > 0 && (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse mr-1.5"></span>
                            {group.totalPending} Pending
                          </span>
                        )}
                        {group.totalVerified > 0 && (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5"></span>
                            {group.totalVerified} Verified
                          </span>
                        )}
                        {group.totalRejected > 0 && (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1.5"></span>
                            {group.totalRejected} Rejected
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center ml-2 p-2 bg-dark-800 rounded-full transition-transform duration-200" style={{ transform: expandedGroups.has(group.requesterName) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {expandedGroups.has(group.requesterName) && (
                    <div className="overflow-x-auto border-t border-dark-600/40 bg-dark-800/40 rounded-b-lg">
                      <table className="min-w-full divide-y divide-dark-600/40">
                        <thead className="bg-gradient-to-r from-dark-800 to-dark-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              <div className="flex items-center space-x-1">
                                <span>Request ID</span>
                                <svg className="w-4 h-4 text-primary-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                </svg>
                              </div>
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
                        <tbody className="divide-y divide-dark-600/40 bg-dark-800/10">
                          {group.requests.map((request, requestIndex) => (
                            <tr 
                              key={request.id} 
                              className={`hover:bg-dark-600/40 backdrop-blur-sm transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-primary-500/5 border-l-0 hover:border-l-[3px] hover:border-primary-500 group ${requestIndex % 2 === 0 ? 'bg-dark-800/20' : 'bg-transparent'}`}
                              onClick={() => openFullScreenDetail(request)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                <div className="text-primary-300 group-hover:text-primary-200 transition-colors">
                      {request.id}
                                </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-125 transition-all mr-2"></div>
                                  <span className="group-hover:text-white transition-colors">{request.documentType}</span>
                                </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="group-hover:text-white transition-colors">{formatDate(request.submittedDate)}</span>
                                </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === 'pending' && (
                                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/30 inline-flex items-center shadow-sm shadow-yellow-500/10 group-hover:shadow-yellow-500/20 transition-all">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse mr-1.5"></span>
                          Pending
                        </span>
                      )}
                      {request.status === 'verified' && (
                                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30 inline-flex items-center shadow-sm shadow-green-500/10 group-hover:shadow-green-500/20 transition-all">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5"></span>
                          Verified
                        </span>
                      )}
                      {request.status === 'rejected' && (
                                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/10 text-red-400 border border-red-500/30 inline-flex items-center shadow-sm shadow-red-500/10 group-hover:shadow-red-500/20 transition-all">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1.5"></span>
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
                                        className="text-blue-400 hover:text-blue-300 transition-all p-2 rounded-full hover:bg-blue-500/20 hover:shadow-md hover:shadow-blue-500/10 transform hover:scale-110"
                              title="Review"
                                        aria-label="Mark for review"
                                        disabled={processingRequestId === request.id}
                            >
                                        <svg className={`w-5 h-5 ${processingRequestId === request.id ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232L18 7M5 19h4m10-11a8 8 0 11-16 0 8 8 0 0116 0z" />
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
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Detail View */}
      <AnimatePresence>
        {showFullScreenDetail && selectedRequest && (
          <VerificationRequestDetailView
            requests={groupedRequests.find(g => g.requesterName === selectedRequest.requesterName)?.requests || [selectedRequest]}
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