import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VerifiedDocument {
  id: string;
  documentType: string;
  verifiedDate: string;
  ownerName: string;
  certificationId: string;
  documentUrl: string;
  blockchainTxHash?: string;
}

interface VerifiedDocumentsSectionProps {
  documents: VerifiedDocument[];
  loadingDocuments: boolean;
  viewDocumentCertificate: (id: string) => void;
  revokeDocument: (id: string) => void;
  verifyOnBlockchain: (id: string) => void;
  refreshDocuments?: () => void;
}

const VerifiedDocumentsSection: React.FC<VerifiedDocumentsSectionProps> = ({
  documents,
  loadingDocuments,
  viewDocumentCertificate,
  revokeDocument,
  verifyOnBlockchain,
  refreshDocuments
}) => {
  const [filteredDocuments, setFilteredDocuments] = useState<VerifiedDocument[]>([]);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDocument, setSelectedDocument] = useState<VerifiedDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
  const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);
  const [revokeReason, setRevokeReason] = useState<string>('');
  const docsPerPage = 10;

  // Get unique document types for the filter dropdown
  const documentTypes = React.useMemo(() => {
    const types = Array.from(new Set(documents.map(doc => doc.documentType)));
    return types.sort();
  }, [documents]);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, documentTypeFilter, searchTerm, sortOrder]);

  const filterAndSortDocuments = () => {
    let filtered = [...documents];
    
    // Apply document type filter
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === documentTypeFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.id.toLowerCase().includes(term) ||
        doc.ownerName.toLowerCase().includes(term) ||
        doc.certificationId.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.verifiedDate).getTime();
      const dateB = new Date(b.verifiedDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredDocuments(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Get current documents for pagination
  const indexOfLastDoc = currentPage * docsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(filteredDocuments.length / docsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const openDocumentModal = (document: VerifiedDocument) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setTimeout(() => setSelectedDocument(null), 300);
  };

  const openRevokeModal = (document: VerifiedDocument) => {
    setSelectedDocument(document);
    setShowRevokeModal(true);
  };

  const closeRevokeModal = () => {
    setShowRevokeModal(false);
    setRevokeReason('');
    setTimeout(() => setSelectedDocument(null), 300);
  };

  const handleRevokeConfirm = () => {
    if (selectedDocument) {
      revokeDocument(selectedDocument.id);
      closeRevokeModal();
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to truncate blockchain hash for display
  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Document Preview Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeDocumentModal}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-b from-dark-700 to-dark-800 rounded-xl p-6 shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto z-50 border border-dark-500"
          >
            <button 
              onClick={closeDocumentModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-dark-800/80 hover:bg-dark-700 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">{selectedDocument.documentType}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-dark-900/50 p-1 rounded-lg shadow-xl border border-dark-600 overflow-hidden mb-4 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-primary-500/10">
                  <img 
                    src={selectedDocument.documentUrl} 
                    alt={`${selectedDocument.documentType} preview`} 
                    className="w-full rounded-md shadow-inner object-contain max-h-80"
                  />
                </div>
                
                <div className="bg-dark-800 p-4 rounded-lg shadow-lg border border-dark-600">
                  <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Certificate Details
                  </h4>
                  <div className="divide-y divide-dark-600">
                    <div className="py-2">
                      <p className="text-sm"><span className="text-gray-400">ID:</span> <span className="font-mono font-medium text-primary-300">{selectedDocument.certificationId}</span></p>
                    </div>
                    <div className="py-2">
                      <p className="text-sm"><span className="text-gray-400">Owner:</span> <span className="font-medium">{selectedDocument.ownerName}</span></p>
                    </div>
                    <div className="py-2">
                      <p className="text-sm"><span className="text-gray-400">Verified:</span> <span className="font-medium">{formatDate(selectedDocument.verifiedDate)}</span></p>
                    </div>
                  </div>
                  
                  {selectedDocument.blockchainTxHash && (
                    <div className="mt-3 pt-3 border-t border-dark-600">
                      <p className="text-sm mb-1 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-gray-400">Blockchain Verification:</span>
                      </p>
                      <div className="bg-dark-900/70 rounded-lg p-2 font-mono text-sm hover:bg-dark-900 transition-colors">
                        <a 
                          href={`https://etherscan.io/tx/${selectedDocument.blockchainTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-between group"
                        >
                          <span className="break-all">{selectedDocument.blockchainTxHash}</span>
                          <svg className="w-4 h-4 ml-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="bg-dark-800 p-4 rounded-lg shadow-lg border border-dark-600">
                  <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Actions
                  </h4>
                  <div className="space-y-3">
                    <button 
                      onClick={() => viewDocumentCertificate(selectedDocument.id)}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Certificate</span>
                    </button>
                    
                    {!selectedDocument.blockchainTxHash && (
                      <button 
                        onClick={() => verifyOnBlockchain(selectedDocument.id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Verify on Blockchain</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => openRevokeModal(selectedDocument)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Revoke Certificate</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-dark-800 p-4 rounded-lg shadow-lg border border-dark-600">
                  <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 6h1m-7 7v-1m-6-6H4" />
                    </svg>
                    QR Code
                  </h4>
                  <div className="flex justify-center bg-white p-4 rounded-lg shadow-inner transition-transform transform hover:scale-105">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedDocument.certificationId)}`} 
                      alt="Certificate QR Code" 
                      className="w-36 h-36 object-contain hover:animate-pulse"
                    />
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-400 flex items-center justify-center">
                    <svg className="w-3 h-3 mr-1 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Scan to verify certificate authenticity
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeRevokeModal}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-b from-dark-700 to-dark-800 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4 z-50 border border-dark-500"
          >
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 mb-4 shadow-lg shadow-red-500/10">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">Revoke Certificate</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to revoke the certificate for <span className="font-semibold text-white">{selectedDocument.documentType}</span> issued to <span className="font-semibold text-white">{selectedDocument.ownerName}</span>?
              </p>
              
              <div className="mb-4">
                <label className="block text-left text-sm font-medium text-gray-400 mb-1">Reason for Revocation</label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none h-24 transition-all"
                  placeholder="Please provide a reason for revoking this certificate"
                ></textarea>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeRevokeModal}
                  className="flex-1 py-2 px-4 bg-dark-600 hover:bg-dark-500 rounded-lg text-white transition-all shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeConfirm}
                  disabled={!revokeReason.trim()}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-800 disabled:to-red-900 disabled:cursor-not-allowed rounded-lg text-white transition-all shadow-md hover:shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                >
                  Revoke
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Verified Documents</h2>
            {refreshDocuments && (
              <button
                onClick={refreshDocuments}
                disabled={loadingDocuments}
                className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 disabled:from-primary-800 disabled:to-blue-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                title="Refresh Documents"
              >
                <svg 
                  className={`w-5 h-5 ${loadingDocuments ? 'animate-spin' : ''}`} 
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 20.0001C16.4183 20.0001 20 16.4184 20 12.0001C20 7.58187 16.4183 4.00015 12 4.00015C7.58172 4.00015 4 7.58187 4 12.0001C4 13.5759 4.45645 15.0539 5.25 16.3001"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path 
                    d="M9 4.5L4 4L4.5 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative flex-grow max-w-xs">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem' 
              }}
            >
              <option value="all">All Document Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 0.5rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem' 
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        {loadingDocuments ? (
          <div className="flex items-center justify-center h-60">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500/30 border-t-4 border-t-primary-500"></div>
              <div className="absolute top-0 left-0 animate-ping h-16 w-16 rounded-full bg-primary-500/10 delay-150"></div>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <div className="relative">
              <svg className="w-20 h-20 text-gray-600 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-dark-600 flex items-center justify-center border-2 border-dark-800">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-bold mt-4 bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">No verified documents found</p>
            <p className="text-sm max-w-md text-center mt-2 text-gray-500">
              {documentTypeFilter !== 'all' 
                ? `No ${documentTypeFilter} documents have been verified.`
                : searchTerm 
                  ? 'No documents match your search criteria.' 
                  : 'You have not verified any documents yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-dark-600 shadow-xl bg-gradient-to-b from-dark-800/50 to-dark-900/50">
              <table className="min-w-full divide-y divide-dark-600/70 rounded-xl overflow-hidden table-fixed">
                <thead className="bg-gradient-to-r from-dark-800 to-dark-700">
                  <tr>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[80px]">
                      Preview
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Certification ID
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Verified Date
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Blockchain Status
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600/40 bg-dark-800/10">
                  {currentDocuments.map((document, index) => (
                    <tr 
                      key={document.id} 
                      className={`hover:bg-dark-600/40 transition-colors duration-300 cursor-pointer border-l-0 hover:border-l-[3px] hover:border-primary-500 group ${index % 2 === 0 ? 'bg-dark-800/20' : 'bg-transparent'}`}
                      onClick={() => openDocumentModal(document)}
                    >
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div 
                          className="w-10 h-10 rounded overflow-hidden bg-dark-600 cursor-pointer transition-all group-hover:ring-2 group-hover:ring-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/20" 
                          title="Click to view details"
                        >
                          <img 
                            src={document.documentUrl} 
                            alt={document.documentType}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium truncate max-w-[150px]">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-125 transition-all mr-2 flex-shrink-0"></div>
                          <span className="group-hover:text-white transition-colors truncate">{document.documentType}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[150px]">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-110 mr-2 flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {document.ownerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="group-hover:text-white transition-colors truncate">{document.ownerName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-primary-300 group-hover:text-primary-200 transition-colors truncate max-w-[120px]">
                        <span className="font-mono truncate">{document.certificationId}</span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[150px]">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="group-hover:text-white transition-colors truncate">{formatDate(document.verifiedDate)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {document.blockchainTxHash ? (
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30 inline-flex items-center shadow-sm shadow-green-500/10 group-hover:shadow-green-500/20 transition-all">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1"></span>
                              Verified
                            </span>
                            <a 
                              href={`https://etherscan.io/tx/${document.blockchainTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 transition-colors group relative ml-1"
                              title="View on Etherscan"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="font-mono">{truncateHash(document.blockchainTxHash)}</span>
                              <span className="hidden group-hover:block absolute bottom-full left-0 bg-dark-900 text-xs px-2 py-1 rounded mb-1 whitespace-normal w-60 break-all z-10">
                                {document.blockchainTxHash}
                              </span>
                              <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/20 to-gray-600/10 text-gray-400 border border-gray-500/30 inline-flex items-center shadow-sm shadow-gray-500/10 group-hover:shadow-gray-500/20 transition-all">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1"></span>
                            Not on BC
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              viewDocumentCertificate(document.id);
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-all p-1.5 rounded-full hover:bg-blue-500/20 hover:shadow-md hover:shadow-blue-500/10 transform hover:scale-110"
                            title="View Certificate"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          
                          {!document.blockchainTxHash && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyOnBlockchain(document.id);
                              }}
                              className="text-green-400 hover:text-green-300 transition-all p-1.5 rounded-full hover:bg-green-500/20 hover:shadow-md hover:shadow-green-500/10 transform hover:scale-110"
                              title="Verify on Blockchain"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                          )}
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openRevokeModal(document);
                            }}
                            className="text-red-400 hover:text-red-300 transition-all p-1.5 rounded-full hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/10 transform hover:scale-110"
                            title="Revoke Certificate"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination - Enhanced styling */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Showing <span className="text-white font-medium">{indexOfFirstDoc + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastDoc, filteredDocuments.length)}</span> of <span className="text-white font-medium">{filteredDocuments.length}</span> documents
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-dark-800 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    
                    if (totalPages <= 5) {
                      // If we have 5 or fewer pages, just show all pages
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // If we're near the beginning, show pages 1-5
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // If we're near the end, show the last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Otherwise show current page and 2 pages on each side
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm transition-all duration-200 shadow-sm ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20"
                            : "bg-dark-800 text-gray-300 hover:bg-dark-600 hover:text-white hover:shadow"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-dark-800 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default VerifiedDocumentsSection; 