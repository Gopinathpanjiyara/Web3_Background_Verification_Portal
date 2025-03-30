import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// API URL
const API_URL = 'http://localhost:5001/api';

// NFT Certificate interface
interface Certificate {
  id: string;
  name: string;
  issueDate: string;
  status: string;
  blockchain: string;
  txHash: string;
}

const NftCertificateSection: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get certificates data from API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get<Certificate[]>(`${API_URL}/dashboard/nft-certificates`);
        setCertificates(response.data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setError('Failed to load certificates. Please try again later.');
        
        // Fallback data for development/demo
        setCertificates([
          {
            id: 'cert-001',
            name: 'Professional Certificate',
            issueDate: '2023-09-15',
            status: 'Active',
            blockchain: 'Ethereum',
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
          },
          {
            id: 'cert-002',
            name: 'Diploma in Blockchain',
            issueDate: '2023-10-22',
            status: 'Active',
            blockchain: 'Polygon',
            txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
          },
          {
            id: 'cert-003',
            name: 'Document Verification Expert',
            issueDate: '2023-11-05',
            status: 'Pending',
            blockchain: 'Ethereum',
            txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Helper function to truncate transaction hash
  const truncateTxHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">Error Loading Certificates</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-xl font-bold mb-2">No Certificates Found</h3>
        <p className="text-gray-400 mb-6">You don't have any NFT certificates yet.</p>
        <button className="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors duration-300">
          Get Your First Certificate
        </button>
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">NFT Certificates</h2>
        <button className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-sm transition-colors duration-300">
          Request New Certificate
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {certificates.map(cert => (
          <div 
            key={cert.id}
            className="bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-1">{cert.name}</h3>
                <p className="text-gray-400">Issued on {formatDate(cert.issueDate)}</p>
              </div>
              
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${
                  cert.status === 'Active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : cert.status === 'Pending' 
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                }`}>
                  {cert.status}
                </span>
                <button className="px-4 py-2 rounded-lg bg-dark-600 hover:bg-dark-500 text-sm transition-colors duration-300">
                  View
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dark-600">
              <div className="flex flex-col sm:flex-row text-sm">
                <div className="mb-3 sm:mb-0 sm:mr-6">
                  <span className="text-gray-400 mr-2">Blockchain:</span>
                  <span>{cert.blockchain}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Transaction:</span>
                  <a 
                    href={`https://etherscan.io/tx/${cert.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 truncate max-w-xs transition-colors duration-300"
                  >
                    {truncateTxHash(cert.txHash)}
                  </a>
                  <button 
                    onClick={() => navigator.clipboard.writeText(cert.txHash)}
                    className="ml-2 text-gray-400 hover:text-white"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default NftCertificateSection; 