import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define interfaces for our verification history data
interface VerificationRecord {
  id: string;
  documentType: string;
  documentName: string;
  verifiedAt: string;
  verifiedBy: string;
  status: 'verified' | 'rejected' | 'pending';
  issuer: string;
  blockchainRecordId?: string;
  thumbnail: string;
}

interface VerificationHistorySectionProps {
  verifications: VerificationRecord[];
  loading: boolean;
  onViewDetails: (id: string) => void;
  onDownload: (id: string) => void;
  onVerificationStatusChange: (id: string, status: 'verified' | 'rejected') => void;
}

const VerificationHistorySection: React.FC<VerificationHistorySectionProps> = ({
  verifications,
  loading,
  onViewDetails,
  onDownload,
  onVerificationStatusChange
}) => {
  const [filter, setFilter] = useState<'all' | 'verified' | 'rejected' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);

  // Filter and sort verifications based on current state
  const filteredVerifications = verifications
    .filter(v => {
      // Apply status filter
      if (filter !== 'all' && v.status !== filter) return false;
      
      // Apply search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          v.documentName.toLowerCase().includes(query) ||
          v.documentType.toLowerCase().includes(query) ||
          v.issuer.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime();
      } else if (sortBy === 'name') {
        comparison = a.documentName.localeCompare(b.documentName);
      } else if (sortBy === 'type') {
        comparison = a.documentType.localeCompare(b.documentType);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (newSortBy: 'date' | 'name' | 'type') => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking on the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to descending for date, ascending for others
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'date' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (column: 'date' | 'name' | 'type') => {
    if (sortBy !== column) return null;
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Handler for clicking on a verification row
  const handleRowClick = (id: string) => {
    setSelectedVerification(selectedVerification === id ? null : id);
  };

  const getStatusStyle = (status: 'verified' | 'rejected' | 'pending') => {
    switch (status) {
      case 'verified':
        return 'bg-green-400/20 text-green-400';
      case 'rejected':
        return 'bg-red-400/20 text-red-400';
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500/30 border-t-4 border-t-primary-500"></div>
          <div className="absolute top-0 left-0 animate-ping h-16 w-16 rounded-full bg-primary-500/10 delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Verification History</h2>
            <p className="text-gray-400 text-sm mt-1">
              View and manage your document verification history
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="bg-dark-800 text-white rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 border border-dark-600 focus:border-primary-500 transition-all shadow-sm"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-dark-800 to-dark-700 rounded-lg p-1 flex shadow-md">
              {(['all', 'verified', 'rejected', 'pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filter === status
                      ? "bg-gradient-to-r from-primary-500/80 to-blue-500/80 text-white shadow-inner shadow-white/5"
                      : "text-gray-400 hover:text-gray-300 hover:bg-dark-600/50"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {filteredVerifications.length === 0 ? (
          <div className="bg-gradient-to-b from-dark-800 to-dark-700 rounded-xl p-12 text-center shadow-inner">
            <div className="w-20 h-20 bg-gradient-to-br from-dark-600 to-dark-700 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg border border-dark-500/30">
              <svg className="w-10 h-10 text-gray-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">No verifications found</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? `No documents matching "${searchQuery}" found.` 
                : `No ${filter !== 'all' ? filter : ''} verifications available.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-dark-600 shadow-xl bg-gradient-to-b from-dark-800/50 to-dark-900/50">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-dark-800 to-dark-700">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg font-medium text-left text-xs text-gray-400 uppercase tracking-wider">Document</th>
                  <th 
                    className="px-4 py-3 font-medium text-left text-xs text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      Type {renderSortIcon('type')}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium text-left text-xs text-gray-400 uppercase tracking-wider">Issuer</th>
                  <th 
                    className="px-4 py-3 font-medium text-left text-xs text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date {renderSortIcon('date')}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium text-left text-xs text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg font-medium text-center text-xs text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/40 bg-dark-800/10">
                {filteredVerifications.map((verification, index) => (
                  <React.Fragment key={verification.id}>
                    <tr 
                      className={`hover:bg-dark-600/40 transition-colors duration-300 cursor-pointer ${
                        selectedVerification === verification.id ? 'bg-dark-600/60' : index % 2 === 0 ? 'bg-dark-800/20' : 'bg-transparent'
                      } border-l-0 hover:border-l-[3px] hover:border-primary-500`}
                      onClick={() => handleRowClick(verification.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded overflow-hidden bg-dark-600 mr-3 flex-shrink-0 transition-all group-hover:ring-2 group-hover:ring-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/20">
                            {verification.thumbnail && (
                              <img 
                                src={verification.thumbnail} 
                                alt="Document thumbnail" 
                                className="w-full h-full object-cover transition-transform hover:scale-110"
                              />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-medium truncate">{verification.documentName}</p>
                            <p className="text-xs text-gray-500 font-mono">ID: {verification.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 truncate">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/20 mr-2 flex-shrink-0"></div>
                          {verification.documentType}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 truncate">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md mr-2 flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {verification.issuer.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {verification.issuer}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(verification.verifiedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center shadow-sm 
                          ${verification.status === 'verified' 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30 shadow-green-500/10' 
                            : verification.status === 'rejected'
                              ? 'bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-400 border border-red-500/30 shadow-red-500/10'
                              : 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/30 shadow-yellow-500/10'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full mr-1 
                            ${verification.status === 'verified' ? 'bg-green-400' : verification.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'}`}
                          ></span>
                          {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(verification.id);
                            }}
                            className="text-primary-400 hover:text-primary-300 transition-all p-1.5 rounded-full hover:bg-primary-500/20 hover:shadow-md hover:shadow-primary-500/10 transform hover:scale-110"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(verification.id);
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-all p-1.5 rounded-full hover:bg-blue-500/20 hover:shadow-md hover:shadow-blue-500/10 transform hover:scale-110"
                            title="Download Document"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          {verification.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerificationStatusChange(verification.id, 'verified');
                                }}
                                className="text-green-400 hover:text-green-300 transition-all p-1.5 rounded-full hover:bg-green-500/20 hover:shadow-md hover:shadow-green-500/10 transform hover:scale-110"
                                title="Verify Document"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerificationStatusChange(verification.id, 'rejected');
                                }}
                                className="text-red-400 hover:text-red-300 transition-all p-1.5 rounded-full hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/10 transform hover:scale-110"
                                title="Reject Document"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {selectedVerification === verification.id && (
                      <tr className="bg-dark-700">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-gradient-to-r from-dark-800/80 to-dark-700/80 rounded-lg p-4 shadow-inner border border-dark-600/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h4 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Document Details</h4>
                                <p className="text-gray-400 text-sm mt-1">Verified by: {verification.verifiedBy}</p>
                                <p className="text-gray-400 text-sm">
                                  Date: {new Date(verification.verifiedAt).toLocaleString()}
                                </p>
                                {verification.blockchainRecordId && (
                                  <div className="mt-2">
                                    <p className="text-gray-400 text-sm">Blockchain Record:</p>
                                    <div className="flex items-center mt-1">
                                      <span className="text-primary-400 text-xs font-mono">{verification.blockchainRecordId}</span>
                                      <button
                                        className="ml-2 text-primary-400 hover:text-primary-300"
                                        title="Copy to clipboard"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(verification.blockchainRecordId || '');
                                        }}
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(verification.id);
                                  }}
                                  className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md hover:shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20"
                                >
                                  View Full Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload(verification.id);
                                  }}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationHistorySection; 