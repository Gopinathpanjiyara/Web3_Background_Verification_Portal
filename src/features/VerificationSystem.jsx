import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  LinkIcon,
  CheckIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  IdentificationIcon,
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

/*
INTEGRATION INSTRUCTIONS
------------------------

This file contains the complete verification link system with:
1. Link Generation Modal
2. Verification Portal Page
3. Document Upload Components
4. Verification Status Tracking

To integrate:

1. ADD THIS FILE to your project in src/features/ directory

2. UPDATE ROUTES in your App.jsx:
   Add: <Route path="/verification/:verificationId" element={<VerificationPortal />} />

3. CONNECT THE LINK GENERATOR in your Overview.jsx:
   - Import: import { VerificationLinkModal } from '../features/VerificationSystem';
   - Add state: const [showLinkModal, setShowLinkModal] = useState(false);
   - Add to UI: <VerificationLinkModal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} />
   - Connect button: onClick={() => setShowLinkModal(true)}

4. ADD VERIFICATION STATUS to your candidate data model with these fields:
   - verificationId: string (unique identifier)
   - verificationTypes: array of strings (identity, address, etc.)
   - verificationStatus: object mapping type->status
   - documentsUploaded: array of document metadata

5. IMPLEMENT BACKEND ENDPOINTS for:
   - POST /api/verification/create (create a new verification request)
   - GET /api/verification/:id (get verification details)
   - POST /api/verification/:id/document (upload a document)
   - PUT /api/verification/:id/status (update verification status)

6. UPDATE DASHBOARD to display verification progress:
   - Add a "Verification" tab in candidate profiles
   - Show document status for each verification type
   - Add review functionality for uploaded documents

This creates a complete verification workflow:
- You generate and share links with candidates
- Candidates upload required documents
- Your team reviews documents and updates verification status
- Dashboard tracks the entire process
*/

// Verification types available in the system
export const VERIFICATION_TYPES = {
  identity: {
    id: 'identity',
    label: 'Identity Verification',
    icon: IdentificationIcon,
    description: 'Government-issued photo ID to verify your identity',
    acceptedDocs: ['Passport', 'Driver\'s License', 'National ID Card'],
    required: true
  },
  address: {
    id: 'address',
    label: 'Address Verification',
    icon: HomeIcon,
    description: 'Documents to verify your current residential address',
    acceptedDocs: ['Utility Bill', 'Bank Statement', 'Lease Agreement'],
    required: false
  },
  education: {
    id: 'education',
    label: 'Education Verification',
    icon: AcademicCapIcon,
    description: 'Academic credentials and educational history',
    acceptedDocs: ['Degree Certificate', 'Transcripts', 'Diploma'],
    required: false
  },
  employment: {
    id: 'employment',
    label: 'Employment Verification',
    icon: BriefcaseIcon,
    description: 'Documents to verify your work history',
    acceptedDocs: ['Experience Letters', 'Pay Stubs', 'Employment Contract'],
    required: false
  },
  criminal: {
    id: 'criminal',
    label: 'Criminal Record Check',
    icon: DocumentTextIcon,
    description: 'Criminal background check consent',
    acceptedDocs: ['Consent Form', 'Background Check Authorization'],
    required: false
  },
  credit: {
    id: 'credit',
    label: 'Credit Check',
    icon: ClipboardDocumentCheckIcon,
    description: 'Credit history verification',
    acceptedDocs: ['Credit Check Consent', 'Financial Disclosure Form'],
    required: false
  },
  reference: {
    id: 'reference',
    label: 'Reference Check',
    icon: ClipboardDocumentCheckIcon,
    description: 'Professional or personal references',
    acceptedDocs: ['Reference Contact List', 'Reference Letters'],
    required: false
  }
};

// Component for generating verification links
export const VerificationLinkModal = ({ isOpen, onClose, onLinkGenerated }) => {
  const [verificationTypes, setVerificationTypes] = useState({
    identity: true,
    address: false,
    education: false,
    employment: false,
    criminal: false,
    credit: false,
    reference: false
  });
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef(null);

  const handleCheckboxChange = (id) => {
    setVerificationTypes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const generateLink = async () => {
    // Create array of selected verification types
    const selected = Object.keys(verificationTypes).filter(key => verificationTypes[key]);
    
    if (selected.length === 0) {
      alert("Please select at least one verification type");
      return;
    }
    
    // In a real app, you would call an API to create the verification request
    // and generate a secure link. This is a simplified version.
    
    // Generate a random hash for the link
    const hash = Math.random().toString(36).substring(2, 15);
    
    // Create the verification link with selected types as query parameters
    const baseUrl = window.location.origin;
    const queryParams = selected.join(',');
    const link = `${baseUrl}/verification/${hash}?types=${queryParams}`;
    
    setGeneratedLink(link);
    
    // If callback provided, call it with the newly generated link data
    if (onLinkGenerated) {
      onLinkGenerated({
        id: hash,
        types: selected,
        link: link,
        createdAt: new Date().toISOString()
      });
    }
  };

  const copyToClipboard = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background-lighter p-6 rounded-xl shadow-neumorph max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Generate Verification Link</h2>
            <p className="text-gray-400 mb-6">Select the verification types required for this candidate:</p>
            
            <div className="space-y-3 mb-6">
              {Object.values(VERIFICATION_TYPES).map(option => (
                <div 
                  key={option.id}
                  className="flex items-center p-3 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
                  onClick={() => handleCheckboxChange(option.id)}
                >
                  <div className="flex items-center justify-center mr-3">
                    <div 
                      className={`w-5 h-5 rounded border ${
                        verificationTypes[option.id] 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-500'
                      } flex items-center justify-center`}
                    >
                      {verificationTypes[option.id] && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <option.icon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-white">{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={generateLink}
                className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors duration-200"
              >
                Generate Link
              </button>
            </div>
            
            {generatedLink && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Verification Link:
                </label>
                <div className="flex">
                  <input
                    ref={linkInputRef}
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-grow bg-background/50 text-white border border-gray-700 rounded-l-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 ${
                      copied ? 'bg-green-600' : 'bg-primary'
                    } text-white rounded-r-lg transition-colors duration-200 flex items-center`}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4 mr-1" /> Copied
                      </>
                    ) : (
                      'Copy'
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Share this link with the candidate to initiate the verification process.</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Document upload component
const DocumentUpload = ({ verificationType, onUpload, documentStatus }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const typeInfo = VERIFICATION_TYPES[verificationType];
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (file) => {
    setFile(file);
  };
  
  const handleSubmit = () => {
    if (!file) return;
    
    // In a real app, you would upload the file to a server here
    onUpload(verificationType, file);
    
    // Reset the file input
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Determine document status display
  let statusDisplay = null;
  if (documentStatus) {
    switch (documentStatus.status) {
      case 'verified':
        statusDisplay = (
          <div className="flex items-center text-green-400 mt-2">
            <CheckCircleIcon className="w-5 h-5 mr-1" />
            <span>Verified</span>
          </div>
        );
        break;
      case 'rejected':
        statusDisplay = (
          <div className="flex items-center text-red-400 mt-2">
            <ExclamationCircleIcon className="w-5 h-5 mr-1" />
            <span>{documentStatus.reason || 'Document rejected'}</span>
          </div>
        );
        break;
      case 'pending':
        statusDisplay = (
          <div className="flex items-center text-primary mt-2">
            <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
            <span>Under review</span>
          </div>
        );
        break;
      default:
        break;
    }
  }
  
  return (
    <div className="bg-background-lighter p-5 rounded-xl shadow-neumorph mb-6">
      <div className="flex items-center mb-4">
        <typeInfo.icon className="w-6 h-6 text-primary mr-3" />
        <h3 className="text-lg font-semibold text-white">{typeInfo.label}</h3>
      </div>
      
      <p className="text-gray-400 mb-4">{typeInfo.description}</p>
      
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Accepted Document Types:</h4>
        <ul className="list-disc pl-5 text-gray-400 text-sm">
          {typeInfo.acceptedDocs.map((doc, index) => (
            <li key={index}>{doc}</li>
          ))}
        </ul>
      </div>
      
      {documentStatus?.status === 'verified' ? (
        <div>{statusDisplay}</div>
      ) : (
        <>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
              dragActive ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300 mb-1">
              {file ? file.name : 'Drag and drop your document here'}
            </p>
            <p className="text-sm text-gray-500">
              {!file && 'or click to browse files'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          
          {file && (
            <div className="mt-4">
              <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                <span className="text-white truncate">{file.name}</span>
                <button
                  className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
                  onClick={handleSubmit}
                >
                  Upload
                </button>
              </div>
            </div>
          )}
          
          {statusDisplay}
        </>
      )}
    </div>
  );
};

// Main verification portal page accessed by candidates through the link
export const VerificationPortal = () => {
  const { verificationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract verification types from query parameters
  const [verificationTypes, setVerificationTypes] = useState([]);
  const [documentStatuses, setDocumentStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  
  // Parse query parameters to get verification types
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const types = urlParams.get('types')?.split(',') || [];
      setVerificationTypes(types.filter(type => VERIFICATION_TYPES[type]));
      
      // In a real app, you would fetch the verification request details here
      setLoading(false);
    } catch (err) {
      setError("Invalid verification link");
      setLoading(false);
    }
  }, [location.search]);
  
  const handleDocumentUpload = (type, file) => {
    console.log(`Uploading document for ${type}:`, file.name);
    
    // In a real app, you would upload the file to a server and get a response
    // For this example, we'll simulate a successful upload with a timeout
    
    // Set the document status to "pending" immediately
    setDocumentStatuses(prev => ({
      ...prev,
      [type]: { status: 'pending', fileName: file.name, uploadedAt: new Date().toISOString() }
    }));
    
    // Simulate server processing with a timeout
    setTimeout(() => {
      setDocumentStatuses(prev => ({
        ...prev,
        [type]: { 
          status: 'verified', 
          fileName: file.name, 
          uploadedAt: new Date().toISOString(),
          verifiedAt: new Date().toISOString()
        }
      }));
      
      // Check if all required documents are now uploaded
      const allUploaded = verificationTypes.every(type => 
        documentStatuses[type] || 
        (type === VERIFICATION_TYPES[type]?.id && VERIFICATION_TYPES[type]?.required === false)
      );
      
      if (allUploaded) {
        setSubmissionComplete(true);
      }
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Verification Link</h1>
          <p className="text-gray-400 mb-6">This verification link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (submissionComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Verification Complete!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for submitting your documents. Your verification is now in process.
            You will be notified once the verification is complete.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Document Verification Portal</h1>
          <p className="text-gray-400">
            Please upload the required documents for verification.
            Your information is secure and will only be used for verification purposes.
          </p>
        </div>
        
        {verificationTypes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-lg">No verification types specified</p>
          </div>
        ) : (
          <div>
            {verificationTypes.map((type) => (
              <DocumentUpload
                key={type}
                verificationType={type}
                onUpload={handleDocumentUpload}
                documentStatus={documentStatuses[type]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Admin component for reviewing verification documents
export const VerificationReview = ({ candidateId }) => {
  // This would fetch verification data for a specific candidate
  // For this example, we'll use mock data
  const [verificationData, setVerificationData] = useState({
    id: '123456',
    candidateId: candidateId,
    status: 'in_progress',
    types: ['identity', 'address', 'education'],
    documents: {
      identity: { 
        status: 'verified', 
        fileName: 'passport.jpg',
        uploadedAt: '2023-08-15T10:30:00Z',
        verifiedAt: '2023-08-16T14:22:00Z'
      },
      address: { 
        status: 'pending', 
        fileName: 'utility_bill.pdf',
        uploadedAt: '2023-08-15T10:35:00Z' 
      },
      education: { 
        status: 'rejected', 
        fileName: 'degree.pdf',
        uploadedAt: '2023-08-15T10:40:00Z',
        reason: 'Document is not clearly legible'
      }
    }
  });
  
  const updateDocumentStatus = (type, status, reason = '') => {
    // In a real app, you would call an API to update the status
    setVerificationData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: {
          ...prev.documents[type],
          status,
          ...(status === 'rejected' ? { reason } : {}),
          ...(status === 'verified' ? { verifiedAt: new Date().toISOString() } : {})
        }
      }
    }));
  };
  
  return (
    <div className="bg-background-lighter p-6 rounded-xl shadow-neumorph">
      <h2 className="text-xl font-semibold text-white mb-4">Verification Documents</h2>
      
      {Object.entries(verificationData.documents).map(([type, doc]) => (
        <div key={type} className="border-b border-gray-700 py-4 last:border-none">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {VERIFICATION_TYPES[type].icon && (
                <VERIFICATION_TYPES[type].icon className="w-5 h-5 text-gray-400 mr-2" />
              )}
              <div>
                <h3 className="text-white font-medium">{VERIFICATION_TYPES[type].label}</h3>
                <p className="text-sm text-gray-400">{doc.fileName}</p>
                <p className="text-xs text-gray-500">
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm ${
                doc.status === 'verified' ? 'bg-green-900/30 text-green-400' :
                doc.status === 'pending' ? 'bg-blue-900/30 text-blue-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </div>
              
              {doc.status === 'pending' && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => updateDocumentStatus(type, 'verified')}
                    className="p-1 bg-green-900/30 text-green-400 rounded-lg"
                    title="Approve document"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter reason for rejection:');
                      if (reason) updateDocumentStatus(type, 'rejected', reason);
                    }}
                    className="p-1 bg-red-900/30 text-red-400 rounded-lg"
                    title="Reject document"
                  >
                    <ExclamationCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {doc.status === 'rejected' && doc.reason && (
            <div className="mt-2 text-sm text-red-400">
              Reason: {doc.reason}
            </div>
          )}
        </div>
      ))}
      
      <div className="mt-4 flex justify-end">
        <button
          className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors"
          onClick={() => {
            // Handle complete verification process
            alert('Verification process completed successfully!');
          }}
        >
          Complete Verification
        </button>
      </div>
    </div>
  );
};

export default { VerificationLinkModal, VerificationPortal, VerificationReview }; 