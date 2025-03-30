import React, { ChangeEvent, useState, useRef, DragEvent } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ethers } from 'ethers';
import { getProvider, hashFunctions, CONTRACT_CONFIG, connectWallet, getContractInstance, getSignedContractInstance } from '../../config/contractConfig';
import MetaMaskConnect from '../../components/blockchain/MetaMaskConnect';

// API URL for backend
const API_URL = "http://localhost:5001/api";

// Define the structure for verification result
interface VerificationResult {
  isVerified: boolean;
  documentId: string;
  documentHash: string;
  timestamp: number;
  issuer: string;
  metadata: string;
  txHash?: string;
  blockNumber?: number;
}

// Interface for BGV API response
interface BGVVerifyResponse {
  success: boolean;
  reportId: string;
  verifier: string;
  timestamp: string;
  reportHash: string;
  studentName?: string;
  companyName?: string;
  status?: string;
  message?: string;
}

// Function to add a new report directly to the blockchain
const addNewReportToBlockchain = async (reportId: string, reportData: any): Promise<string | null> => {
  try {
    // Connect wallet using MetaMask
    const signer = await connectWallet();
    
    // Get contract instance with signer
    const bgvContract = await getSignedContractInstance(signer);
    
    // Convert report data to hash
    const reportHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(reportData))
    );
    
    console.log(`Adding report ${reportId} with hash ${reportHash}`);
    
    // Send transaction to blockchain
    const tx = await bgvContract.addReport(reportId, reportHash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    console.log(`Report ${reportId} added successfully! Transaction hash: ${receipt.transactionHash}`);
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error adding report to blockchain:", error);
    return null;
  }
};

// Function to verify a report directly on the blockchain
const verifyReportOnBlockchain = async (reportId: string, reportData: any): Promise<boolean> => {
  try {
    // Get contract instance (read-only is fine for verification)
    const bgvContract = getContractInstance();
    
    // Generate hash from the report data to verify
    const hashToVerify = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(reportData))
    );
    
    console.log(`Verifying report ${reportId} with hash ${hashToVerify}`);
    
    // Check if it matches the hash on blockchain
    const isValid = await bgvContract.verifyReportHash(reportId, hashToVerify);
    
    console.log(`Verification result: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error("Error verifying report on blockchain:", error);
    return false;
  }
};

const VerifyDocumentSection: React.FC = () => {
  // Document verification states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Get current network configuration
  const currentNetwork = CONTRACT_CONFIG.defaultNetwork;
  const networkConfig = CONTRACT_CONFIG.networks[currentNetwork as keyof typeof CONTRACT_CONFIG.networks];
  
  // Helper function to get block explorer URLs
  const getExplorerUrl = (type: 'block' | 'address' | 'tx', value: string): string => {
    const baseUrl = networkConfig.blockExplorer || 'https://explorer.open-campus-codex.gelato.digital';
    
    switch (type) {
      case 'block':
        return `${baseUrl}/block/${value}`;
      case 'address':
        return `${baseUrl}/address/${value}`;
      case 'tx':
        return `${baseUrl}/tx/${value}`;
      default:
        return baseUrl;
    }
  };

  // Handle file selection for document verification
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setVerificationResult(null);
      setVerificationError(null);
    }
  };
  
  // Handle drag events for file upload
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle file drop for document verification
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setVerificationResult(null);
      setVerificationError(null);
    }
  };

  // Handle document verification by file upload
  const handleFileVerification = async () => {
    if (!selectedFile) {
      setVerificationError('Please select a file');
      return;
    }
    
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);
    setUploadProgress(0);
    
    try {
      // Check file size
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setVerificationError('File size exceeds 10MB limit');
        setIsVerifying(false);
        return;
      }
      
      // Generate a unique document ID if not provided
      const docId = documentId || `DOC-${Date.now()}-${selectedFile.name.substring(0, 20).replace(/\s+/g, '-')}`;
      
      // First, try to verify the document directly on blockchain
      const fileContent = await readFileAsText(selectedFile);
      
      // Create report data object from file
      const reportData = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        timestamp: Date.now(),
        content: fileContent.substring(0, 1000) // Just use part of the content for the hash
      };
      
      try {
        // Try direct blockchain verification first
        const isVerified = await verifyReportOnBlockchain(docId, reportData);
        
        if (isVerified) {
          // If verification succeeded, get the report details
          const bgvContract = getContractInstance();
          const [reportHash, timestamp, verifier] = await bgvContract.getReport(docId);
          
          setVerificationResult({
            isVerified: true,
            documentId: docId,
            documentHash: reportHash,
            timestamp: timestamp.toNumber() * 1000,
            issuer: verifier,
            metadata: "Document verified directly on blockchain",
            blockNumber: await getProvider().getBlockNumber()
          });
          
          setIsVerifying(false);
          return;
        }
      } catch (blockchainError) {
        console.error("Direct blockchain verification failed:", blockchainError);
        // Continue to API verification if direct verification fails
      }
      
      // If direct verification failed or threw an error, try the API
      try {
        // Calculate file hash locally for verification
        const fileHash = await hashFunctions.fileToBytes32(selectedFile);
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('documentFile', selectedFile);
        formData.append('reportId', docId);
        
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        // Call the API to verify the document
        const response = await axios.post<BGVVerifyResponse>(
          `${API_URL}/bgv/verify`, 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent: any) => {
              const total = progressEvent.total || 100;
              const progress = Math.round((progressEvent.loaded * 100) / total);
              setUploadProgress(progress);
            }
          } as any // Type assertion to avoid TypeScript errors
        );
        
        // Process the API response
        if (response.data.success) {
          setVerificationResult({
            isVerified: true,
            documentId: response.data.reportId,
            documentHash: fileHash,
            timestamp: new Date(response.data.timestamp).getTime(),
            issuer: response.data.verifier,
            metadata: response.data.message || "Document verified successfully",
            blockNumber: await getProvider().getBlockNumber()
          });
        } else {
          // Ask if user wants to add the document to blockchain
          if (window.confirm("Document not found on blockchain. Would you like to add it?")) {
            await handleAddDocument();
          } else {
            setVerificationResult({
              isVerified: false,
              documentId: docId,
              documentHash: fileHash,
              timestamp: Date.now(),
              issuer: "Unknown",
              metadata: response.data.message || "Document not found on blockchain"
            });
          }
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        setVerificationError(`API Error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerificationError(error instanceof Error ? error.message : 'Error verifying document');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle document verification by ID
  const handleIdVerification = async () => {
    if (!documentId) {
      setVerificationError('Please enter a document ID');
      return;
    }
    
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);
    
    try {
      // Get token for authorization
      const token = localStorage.getItem('token');
      
      try {
        // Call the BGV API to get report details
        const response = await axios.get<BGVVerifyResponse>(
          `${API_URL}/bgv/report/${documentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Convert the report data to a verification result
        const provider = getProvider();
        const block = await provider.getBlock('latest');
        
        const result: VerificationResult = {
          isVerified: response.data.success,
          documentId: response.data.reportId,
          documentHash: documentHash || "N/A",
          timestamp: new Date(response.data.timestamp).getTime(),
          issuer: response.data.verifier,
          metadata: "Document verified from blockchain record",
          blockNumber: block.number
        };
        
        setVerificationResult(result);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Fallback to direct provider interaction if API fails
        const provider = getProvider();
        const block = await provider.getBlock('latest');
        
        // Create a not-verified result
        const result: VerificationResult = {
          isVerified: false,
          documentId: documentId,
          documentHash: documentHash || "N/A",
          timestamp: block.timestamp * 1000,
          issuer: "Unknown",
          metadata: "Could not verify document - report not found on blockchain",
          blockNumber: block.number
        };
        
        setVerificationResult(result);
      }
      
    } catch (error) {
      console.error('Error verifying document by ID:', error);
      setVerificationError(error instanceof Error ? error.message : 'Error verifying document');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Reset verification process
  const resetVerification = () => {
    setSelectedFile(null);
    setDocumentId('');
    setDocumentHash('');
    setVerificationResult(null);
    setVerificationError(null);
    setUploadProgress(0);
  };

  // Add a new function to handle document addition:
  const handleAddDocument = async () => {
    if (!selectedFile) {
      setVerificationError('Please select a file');
      return;
    }
    
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);
    setUploadProgress(0);
    
    try {
      // Generate a unique document ID if not provided
      const docId = documentId || `DOC-${Date.now()}-${selectedFile.name.substring(0, 20).replace(/\s+/g, '-')}`;
      
      // Read file content
      const fileContent = await readFileAsText(selectedFile);
      
      // Create report data object
      const reportData = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        timestamp: Date.now(),
        content: fileContent.substring(0, 1000) // Just use part of the content for the hash
      };
      
      // Try direct blockchain addition first
      try {
        const txHash = await addNewReportToBlockchain(docId, reportData);
        
        if (txHash) {
          const provider = getProvider();
          const block = await provider.getBlock('latest');
          
          setVerificationResult({
            isVerified: true,
            documentId: docId,
            documentHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(reportData))),
            timestamp: Date.now(),
            issuer: await (await connectWallet()).getAddress(),
            metadata: `Document added to blockchain. Transaction: ${txHash}`,
            blockNumber: block.number
          });
          setIsVerifying(false);
          return;
        }
      } catch (blockchainError) {
        console.error("Direct blockchain addition failed:", blockchainError);
        // Continue to API addition if direct addition fails
      }
      
      // If direct addition failed, try the API
      try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('reportFile', selectedFile);
        formData.append('reportId', docId);
        
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        // Call the API to add the document
        const response = await axios.post(
          `${API_URL}/bgv/report`, 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent: any) => {
              const total = progressEvent.total || 100;
              const progress = Math.round((progressEvent.loaded * 100) / total);
              setUploadProgress(progress);
            }
          } as any
        );
        
        if (response.data.reportId) {
          setVerificationResult({
            isVerified: true,
            documentId: response.data.reportId,
            documentHash: response.data.reportHash || "Generated by API",
            timestamp: Date.now(),
            issuer: "API",
            metadata: `Document added to blockchain. Transaction: ${response.data.transactionHash}`,
            blockNumber: response.data.blockNumber
          });
        } else {
          throw new Error("Failed to add document through API");
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        setVerificationError(`API Error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding document:', error);
      setVerificationError(error instanceof Error ? error.message : 'Error adding document');
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-2xl p-8 border border-dark-600 shadow-xl"
    >
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mr-5">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Verify Document</h2>
          <p className="text-gray-400">Check the authenticity and integrity of blockchain documents</p>
        </div>
      </div>
      
      <div className="mb-6">
        <MetaMaskConnect onConnect={(address) => console.log('Connected with address:', address)} />
      </div>
      
      {/* Verification Result */}
      {verificationResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-8 bg-dark-600/70 p-6 rounded-xl border ${verificationResult.isVerified ? 'border-green-500/30' : 'border-red-500/30'}`}
        >
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 rounded-full ${verificationResult.isVerified ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center mr-4`}>
              {verificationResult.isVerified ? (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${verificationResult.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                {verificationResult.isVerified ? 'Document Verified' : 'Verification Failed'}
              </h3>
              <p className="text-gray-400">
                {verificationResult.isVerified 
                  ? 'The document has been successfully verified on the blockchain' 
                  : 'The document could not be verified on the blockchain'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="flex border-b border-dark-400 pb-3">
                <div className="w-1/3 text-gray-400">Document ID</div>
                <div className="w-2/3 font-medium">{verificationResult.documentId}</div>
              </div>
              <div className="flex border-b border-dark-400 pb-3">
                <div className="w-1/3 text-gray-400">Document Hash</div>
                <div className="w-2/3 font-medium truncate" title={verificationResult.documentHash}>
                  {verificationResult.documentHash}
                </div>
              </div>
              <div className="flex border-b border-dark-400 pb-3">
                <div className="w-1/3 text-gray-400">Time</div>
                <div className="w-2/3 font-medium">
                  {new Date(verificationResult.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex border-b border-dark-400 pb-3">
                <div className="w-1/3 text-gray-400">Issuer</div>
                <div className="w-2/3 font-medium truncate" title={verificationResult.issuer}>
                  {verificationResult.issuer}
                </div>
              </div>
              <div className="flex border-b border-dark-400 pb-3">
                <div className="w-1/3 text-gray-400">Status</div>
                <div className="w-2/3 font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${verificationResult.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {verificationResult.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
              <div className="flex border-b border-dark-400 pb-3">
                <div className="w-1/3 text-gray-400">Details</div>
                <div className="w-2/3 font-medium">
                  {verificationResult.metadata}
                </div>
              </div>
              <div className="flex border-b border-dark-400 pb-3">
                <div className="w-1/3 text-gray-400">Network</div>
                <div className="w-2/3 font-medium">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                    {networkConfig.name} ({networkConfig.currency || 'ETH'})
                  </span>
                </div>
              </div>
              {verificationResult.blockNumber && (
                <div className="flex border-b border-dark-400 pb-3">
                  <div className="w-1/3 text-gray-400">Block</div>
                  <div className="w-2/3 font-medium">
                    <a 
                      href={getExplorerUrl('block', verificationResult.blockNumber.toString())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      #{verificationResult.blockNumber}
                    </a>
                  </div>
                </div>
              )}
              {verificationResult.issuer && (
                <div className="flex border-b border-dark-400 pb-3">
                  <div className="w-1/3 text-gray-400">Explorer</div>
                  <div className="w-2/3 font-medium">
                    <a 
                      href={getExplorerUrl('address', verificationResult.issuer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View on EDU Chain
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={resetVerification}
            className="mt-6 w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Verify Another Document
          </button>
        </motion.div>
      )}
      
      {/* Error Message */}
      {verificationError && !verificationResult && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-xl flex items-start"
        >
          <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{verificationError}</span>
        </motion.div>
      )}
      
      {!verificationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-dark-600/70 backdrop-blur-sm p-6 rounded-xl border border-dark-500">
            <h3 className="font-semibold text-lg mb-5 text-blue-400 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </h3>
            
            <div 
              className={`border-2 border-dashed ${dragActive ? 'border-primary-500' : 'border-dark-400'} rounded-lg p-6 mb-4 text-center hover:border-primary-500/50 transition-colors cursor-pointer`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="documentUpload" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              />
              <label htmlFor="documentUpload" className="cursor-pointer">
                {selectedFile ? (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-primary-400 font-medium">{selectedFile.name}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {(selectedFile.size / 1024).toFixed(2)} KB · {selectedFile.type || 'Unknown file type'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 bg-dark-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 font-medium">Drop file here or click to upload</p>
                    <p className="text-gray-500 text-sm mt-2">Supports PDF, DOCX, JPG, PNG (max 10MB)</p>
                  </div>
                )}
              </label>
            </div>
            
            {uploadProgress > 0 && isVerifying && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">Uploading...</span>
                  <span className="text-xs text-primary-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-dark-500 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={handleFileVerification}
                disabled={isVerifying || !selectedFile}
                className={`flex-1 flex justify-center items-center bg-blue-500 text-white py-3 px-4 rounded-lg font-medium ${isVerifying || !selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'} transition-colors duration-200`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : "Verify Document"}
              </button>
              
              <button
                onClick={handleAddDocument}
                disabled={isVerifying || !selectedFile}
                className={`flex-1 flex justify-center items-center bg-green-500 text-white py-3 px-4 rounded-lg font-medium ${isVerifying || !selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'} transition-colors duration-200`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : "Add Document"}
              </button>
            </div>
          </div>
          
          <div className="bg-dark-600/70 backdrop-blur-sm p-6 rounded-xl border border-dark-500">
            <h3 className="font-semibold text-lg mb-5 text-blue-400 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Verify by Document ID
            </h3>
            
            <div className="mb-4">
              <label htmlFor="documentId" className="block text-gray-400 mb-2 text-sm">Document ID</label>
              <input 
                type="text"
                id="documentId"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Enter document ID (e.g. DOC-2023-0001)"
                className="w-full p-3 bg-dark-700 border border-dark-400 rounded-lg focus:outline-none focus:border-primary-500 text-white"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="documentHash" className="block text-gray-400 mb-2 text-sm">Document Hash (Optional)</label>
              <input 
                type="text"
                id="documentHash"
                value={documentHash}
                onChange={(e) => setDocumentHash(e.target.value)}
                placeholder="Enter document hash for extra verification"
                className="w-full p-3 bg-dark-700 border border-dark-400 rounded-lg focus:outline-none focus:border-primary-500 text-white"
              />
              <p className="text-gray-500 text-xs mt-1">The document hash helps ensure the document hasn't been modified.</p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleIdVerification}
              disabled={!documentId || isVerifying}
              className={`w-full py-3 ${!documentId || isVerifying ? 'bg-dark-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-all duration-300 flex items-center justify-center font-medium`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search & Verify
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VerifyDocumentSection; 