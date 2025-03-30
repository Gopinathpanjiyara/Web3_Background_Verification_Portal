import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { saveAs } from 'file-saver';
import { ethers } from 'ethers';

// API URL
const API_URL = 'http://localhost:5001/api';

// Verification stages
enum VerificationStage {
  UPLOAD = 'upload',
  PROCESSING = 'processing',
  RESULT = 'result',
  ERROR = 'error'
}

// Document verification result interface
interface VerificationResult {
  isVerified: boolean;
  documentId: string;
  documentHash: string;
  timestamp: number;
  issuer: string;
  metadata: string;
}

const VerifyDocument: React.FC = () => {
  // State
  const [stage, setStage] = useState<VerificationStage>(VerificationStage.UPLOAD);
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [documentHash, setDocumentHash] = useState<string>('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Functions for document handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      // Reset states when a new file is selected
      setDocumentHash('');
      setError(null);
      setVerificationResult(null);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const calculateFileHash = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (event.target && event.target.result) {
            // Use CryptoJS to calculate SHA-256 hash
            const wordArray = CryptoJS.lib.WordArray.create(event.target.result as ArrayBuffer);
            const hash = CryptoJS.SHA256(wordArray).toString();
            resolve(hash);
          } else {
            reject(new Error('Error reading file'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      // Read file as array buffer
      reader.readAsArrayBuffer(file);
    });
  };
  
  const handleVerification = async () => {
    if (!file && !documentId) {
      setError('Please upload a document or enter a document ID');
      return;
    }
    
    setIsProcessing(true);
    setStage(VerificationStage.PROCESSING);
    setError(null);
    
    try {
      if (file) {
        // Calculate hash of the uploaded file
        const hash = await calculateFileHash(file);
        setDocumentHash(hash);
        
        // If document ID is provided, verify against blockchain
        if (documentId) {
          await verifyDocumentWithBlockchain(documentId, hash);
        } else {
          setError('Please enter a document ID to verify against the blockchain');
          setStage(VerificationStage.ERROR);
        }
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setError('An error occurred during verification process');
      setStage(VerificationStage.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const verifyDocumentWithBlockchain = async (docId: string, hash: string) => {
    try {
      const response = await axios.post(`${API_URL}/verification/check`, {
        documentId: docId,
        documentHash: hash
      });
      
      if (response.data.success) {
        // If verification is successful, get full document details
        if (response.data.isVerified) {
          const detailsResponse = await axios.get(`${API_URL}/verification/document/${docId}`);
          
          if (detailsResponse.data.success) {
            setVerificationResult(detailsResponse.data.verification);
            setStage(VerificationStage.RESULT);
          }
        } else {
          setError('Document hash does not match blockchain record');
          setStage(VerificationStage.ERROR);
        }
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError('Document ID not found on blockchain');
      } else {
        setError(error.message || 'Error connecting to verification service');
      }
      setStage(VerificationStage.ERROR);
    }
  };
  
  // Reset to initial state
  const handleReset = () => {
    setFile(null);
    setDocumentId('');
    setDocumentHash('');
    setError(null);
    setVerificationResult(null);
    setStage(VerificationStage.UPLOAD);
    
    // Also reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 text-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Blockchain</span> Document Verification
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Verify the authenticity and integrity of your documents using our secure blockchain verification system.
            </p>
          </div>
          
          <div className="bg-dark-700 rounded-2xl p-8 shadow-xl border border-dark-600">
            {/* Upload Stage */}
            {stage === VerificationStage.UPLOAD && (
              <div className="space-y-8">
                <div className="bg-dark-600/80 rounded-xl p-6 border border-dark-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-xl"></div>
                  
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Upload Document
                  </h2>
                  
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-dark-400 rounded-xl py-8 px-4 text-center cursor-pointer hover:border-primary-500/50 transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    
                    {file ? (
                      <div className="py-2">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-gray-400 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="py-6">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-300 font-medium">Drag & drop your file here or click to browse</p>
                        <p className="text-gray-500 text-sm mt-1">Supports PDF, DOC, DOCX, JPG, PNG files</p>
                      </div>
                    )}
                  </div>
                  
                  {file && (
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="text-gray-400 hover:text-white text-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove File
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-dark-600/80 rounded-xl p-6 border border-dark-500">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <svg className="w-6 h-6 text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Document ID
                  </h2>
                  
                  <div className="mb-6">
                    <input
                      type="text"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="Enter the document's unique ID"
                      className="w-full bg-dark-500 text-white border border-dark-400 rounded-lg p-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    />
                    <p className="text-gray-500 text-sm mt-2">The unique identifier provided when the document was registered on the blockchain</p>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-xl flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerification}
                    disabled={isProcessing || (!file && !documentId)}
                    className={`px-6 py-3 rounded-xl font-medium flex items-center transition-all ${
                      isProcessing || (!file && !documentId)
                        ? 'bg-dark-500 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-900/20'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verify Document
                  </motion.button>
                </div>
              </div>
            )}
            
            {/* Processing Stage */}
            {stage === VerificationStage.PROCESSING && (
              <div className="text-center">
                <p className="text-gray-300 text-lg">Processing...</p>
              </div>
            )}
            
            {/* Result Stage */}
            {stage === VerificationStage.RESULT && (
              <div className="text-center">
                <p className="text-gray-300 text-lg">Verification successful!</p>
                <p className="text-gray-500 text-sm mt-2">
                  Document ID: {verificationResult?.documentId}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Document Hash: {verificationResult?.documentHash}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Timestamp: {formatDate(verificationResult?.timestamp)}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Issuer: {verificationResult?.issuer}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Metadata: {verificationResult?.metadata}
                </p>
              </div>
            )}
            
            {/* Error Stage */}
            {stage === VerificationStage.ERROR && (
              <div className="text-center">
                <p className="text-red-400 text-lg">Verification failed. {error}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyDocument; 