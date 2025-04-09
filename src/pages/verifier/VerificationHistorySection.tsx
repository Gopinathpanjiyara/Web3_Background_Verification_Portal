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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
            <h2 className="text-2xl font-bold">Verification History</h2>
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
                className="bg-dark-800 text-white rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            </div>
            
            <div className="bg-dark-800 rounded-lg p-1 flex">
              {(['all', 'verified', 'rejected', 'pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === status
                      ? "bg-dark-600 text-white"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {filteredVerifications.length === 0 ? (
          <div className="bg-dark-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-dark-700 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No verifications found</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? `No documents matching "${searchQuery}" found.` 
                : `No ${filter !== 'all' ? filter : ''} verifications available.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg font-medium text-left">Document</th>
                  <th 
                    className="px-4 py-3 font-medium text-left cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      Type {renderSortIcon('type')}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium text-left">Issuer</th>
                  <th 
                    className="px-4 py-3 font-medium text-left cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date {renderSortIcon('date')}
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium text-left">Status</th>
                  <th className="px-4 py-3 rounded-r-lg font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredVerifications.map((verification) => (
                  <React.Fragment key={verification.id}>
                    <tr 
                      className={`hover:bg-dark-800/50 transition-colors cursor-pointer ${
                        selectedVerification === verification.id ? 'bg-dark-800/50' : ''
                      }`}
                      onClick={() => handleRowClick(verification.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-dark-600 mr-3 overflow-hidden">
                            {verification.thumbnail && (
                              <img 
                                src={verification.thumbnail} 
                                alt="Document thumbnail" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{verification.documentName}</p>
                            <p className="text-xs text-gray-500">ID: {verification.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{verification.documentType}</td>
                      <td className="px-4 py-3 text-gray-300">{verification.issuer}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(verification.verifiedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(verification.status)}`}>
                          {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 flex justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(verification.id);
                          }}
                          className="p-1.5 bg-dark-600 rounded-lg hover:bg-dark-500 transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(verification.id);
                          }}
                          className="p-1.5 bg-dark-600 rounded-lg hover:bg-dark-500 transition-colors"
                          title="Download"
                        >
                          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    
                    {selectedVerification === verification.id && (
                      <tr className="bg-dark-800/30">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-400">Verification Details</h4>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500">Verified By</p>
                                  <p>{verification.verifiedBy}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Date & Time</p>
                                  <p>{new Date(verification.verifiedAt).toLocaleString()}</p>
                                </div>
                                {verification.blockchainRecordId && (
                                  <div>
                                    <p className="text-xs text-gray-500">Blockchain Record</p>
                                    <p className="text-primary-400">
                                      {verification.blockchainRecordId.substring(0, 18)}...
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-400">Document Preview</h4>
                              <div className="h-40 bg-dark-700 rounded-lg flex items-center justify-center overflow-hidden">
                                {verification.thumbnail ? (
                                  <img 
                                    src={verification.thumbnail} 
                                    alt="Document preview" 
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : (
                                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            
                            {verification.status === 'pending' && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-400">Verification Actions</h4>
                                <div className="flex space-x-3">
                                  <button 
                                    onClick={() => onVerificationStatusChange(verification.id, 'verified')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => onVerificationStatusChange(verification.id, 'rejected')}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                                <textarea 
                                  placeholder="Add verification notes (optional)" 
                                  className="w-full bg-dark-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  rows={3}
                                />
                              </div>
                            )}
                            
                            {verification.status !== 'pending' && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-400">Verification Notes</h4>
                                <div className="bg-dark-700 rounded-lg p-4 h-40 overflow-y-auto">
                                  <p className="text-gray-400 text-sm italic">
                                    No verification notes available.
                                  </p>
                                </div>
                              </div>
                            )}
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
        
        {filteredVerifications.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
            <div>
              Showing {filteredVerifications.length} of {verifications.length} verifications
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1 bg-dark-800 rounded hover:bg-dark-600 disabled:opacity-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span>Page 1 of 1</span>
              <button className="p-1 bg-dark-800 rounded hover:bg-dark-600 disabled:opacity-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerificationHistorySection; 