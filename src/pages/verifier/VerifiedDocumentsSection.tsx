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
            className="relative bg-dark-700 rounded-xl p-6 shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto z-50"
          >
            <button 
              onClick={closeDocumentModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold mb-4">{selectedDocument.documentType}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={selectedDocument.documentUrl} 
                  alt={`${selectedDocument.documentType} preview`} 
                  className="w-full rounded-lg shadow-md mb-4 bg-dark-800 object-contain max-h-80"
                />
                
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Certificate Details</h4>
                  <p className="text-sm mb-1"><span className="text-gray-400">ID:</span> {selectedDocument.certificationId}</p>
                  <p className="text-sm mb-1"><span className="text-gray-400">Owner:</span> {selectedDocument.ownerName}</p>
                  <p className="text-sm mb-1"><span className="text-gray-400">Verified:</span> {formatDate(selectedDocument.verifiedDate)}</p>
                  {selectedDocument.blockchainTxHash && (
                    <div className="mt-3">
                      <p className="text-sm mb-1"><span className="text-gray-400">Blockchain Verification:</span></p>
                      <a 
                        href={`https://etherscan.io/tx/${selectedDocument.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 transition-colors flex items-center text-sm"
                      >
                        <span className="font-mono break-all">{selectedDocument.blockchainTxHash}</span>
                        <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => viewDocumentCertificate(selectedDocument.id)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Certificate</span>
                    </button>
                    
                    {!selectedDocument.blockchainTxHash && (
                      <button 
                        onClick={() => verifyOnBlockchain(selectedDocument.id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Verify on Blockchain</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => openRevokeModal(selectedDocument)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Revoke Certificate</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-dark-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">QR Code</h4>
                  <div className="flex justify-center bg-white p-4 rounded-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedDocument.certificationId)}`} 
                      alt="Certificate QR Code" 
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-400">Scan to verify certificate authenticity</p>
                </div>
              </div>
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
            className="relative bg-dark-700 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4 z-50"
          >
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold mb-2">Revoke Certificate</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to revoke the certificate for {selectedDocument.documentType} issued to {selectedDocument.ownerName}?
              </p>
              
              <div className="mb-4">
                <label className="block text-left text-sm font-medium text-gray-400 mb-1">Reason for Revocation</label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary-500 resize-none h-24"
                  placeholder="Please provide a reason for revoking this certificate"
                ></textarea>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeRevokeModal}
                  className="flex-1 py-2 px-4 bg-dark-600 hover:bg-dark-500 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeConfirm}
                  disabled={!revokeReason.trim()}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
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
            <h2 className="text-2xl font-bold">Verified Documents</h2>
            {refreshDocuments && (
              <button
                onClick={refreshDocuments}
                disabled={loadingDocuments}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-800 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
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
                className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:border-primary-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Document Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        {loadingDocuments ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No verified documents found</p>
            <p className="text-sm max-w-md text-center mt-2">
              {documentTypeFilter !== 'all' 
                ? `No ${documentTypeFilter} documents have been verified.`
                : searchTerm 
                  ? 'No documents match your search criteria.' 
                  : 'You have not verified any documents yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-600">
                <thead>
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Preview
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Certification ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Verified Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Blockchain Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600 bg-dark-800/30">
                  {currentDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div 
                          className="w-12 h-12 rounded overflow-hidden bg-dark-600 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all" 
                          onClick={() => openDocumentModal(document)}
                          title="Click to view details"
                        >
                          <img 
                            src={document.documentUrl} 
                            alt={document.documentType}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {document.documentType}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {document.ownerName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        <span className="font-mono">{document.certificationId}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(document.verifiedDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {document.blockchainTxHash ? (
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 mr-2">
                              Verified
                            </span>
                            <a 
                              href={`https://etherscan.io/tx/${document.blockchainTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 transition-colors group relative"
                              title="View on Etherscan"
                            >
                              <span className="font-mono">{truncateHash(document.blockchainTxHash)}</span>
                              <span className="hidden group-hover:block absolute bottom-full left-0 bg-dark-900 text-xs px-2 py-1 rounded mb-1 whitespace-normal w-60 break-all">
                                {document.blockchainTxHash}
                              </span>
                              <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-400">
                            Not on Blockchain
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => openDocumentModal(document)}
                            className="text-primary-400 hover:text-primary-300 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <button 
                            onClick={() => viewDocumentCertificate(document.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Certificate"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          
                          {!document.blockchainTxHash && (
                            <button 
                              onClick={() => verifyOnBlockchain(document.id)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Verify on Blockchain"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => openRevokeModal(document)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Revoke Certificate"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Showing <span className="text-white font-medium">{indexOfFirstDoc + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastDoc, filteredDocuments.length)}</span> of <span className="text-white font-medium">{filteredDocuments.length}</span> documents
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-dark-800 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-800 text-gray-300 hover:bg-dark-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-dark-800 text-gray-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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