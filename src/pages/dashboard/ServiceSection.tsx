import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// API URL
const API_URL = 'http://localhost:5001/api';

// Verification Service interface
interface VerificationService {
  id: string;
  name: string;
  description: string;
  price: number;
  documentRequired: boolean;
  documentTypes: string[];
}

// Organization interface
interface Organization {
  code: string;
  name: string;
  sponsoredServices: string[];
  validUntil: string;
}

const ServiceSection: React.FC = () => {
  // Services state
  const [services, setServices] = useState<VerificationService[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Organization code state
  const [orgCode, setOrgCode] = useState('');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  
  // Documents state
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({});
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({});
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  
  // Consent state
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get services data from API
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('Authentication token not found, using fallback data');
          throw new Error('Authentication token not found');
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get<VerificationService[]>(`${API_URL}/dashboard/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Don't set error state, just use fallback data
        console.log('Using fallback data instead');
        
        // Fallback data for development/demo
        setServices([
          {
            id: 'employment',
            name: 'Employment Verification',
            description: 'Verify employment history and details',
            price: 29.99,
            documentRequired: true,
            documentTypes: ['.pdf', '.jpg', '.png', '.docx']
          },
          {
            id: 'education',
            name: 'Education Verification',
            description: 'Verify education qualifications and certificates',
            price: 24.99,
            documentRequired: true,
            documentTypes: ['.pdf', '.jpg', '.png']
          },
          {
            id: 'address',
            name: 'Address Check',
            description: 'Verify current and previous addresses',
            price: 19.99,
            documentRequired: true,
            documentTypes: ['.pdf', '.jpg', '.png']
          },
          {
            id: 'identity',
            name: 'Identity (Aadhaar/PAN)',
            description: 'Verify identity documents',
            price: 14.99,
            documentRequired: true,
            documentTypes: ['.pdf', '.jpg', '.png']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Calculate total price
  const calculateTotal = () => {
    if (!services.length) return 0;
    
    return services
      .filter(service => selectedServices.includes(service.id))
      .reduce((total, service) => {
        // Skip price if organization is sponsoring this service
        if (organization && organization.sponsoredServices.includes(service.id)) {
          return total;
        }
        return total + service.price;
      }, 0);
  };

  // Toggle service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        // If removing a service, also remove its document
        const newDocs = { ...documents };
        const newPreviews = { ...documentPreviews };
        delete newDocs[serviceId];
        delete newPreviews[serviceId];
        setDocuments(newDocs);
        setDocumentPreviews(newPreviews);
        
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Verify organization code
  const verifyOrgCode = async () => {
    if (!orgCode.trim()) {
      setCodeError('Please enter an organization code');
      return;
    }
    
    setIsVerifyingCode(true);
    setCodeError(null);
    
    try {
      // Simulate API call for demo
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (orgCode.trim().toUpperCase() === 'TCS2025BGV') {
        setOrganization({
          code: 'TCS2025BGV',
          name: 'Tata Consultancy Services',
          sponsoredServices: ['employment', 'education', 'identity'],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        setCodeError('Invalid or expired organization code');
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error verifying organization code:', error);
      setCodeError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Handle file selection
  const handleFileChange = (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const service = services.find(s => s.id === serviceId);
      
      // Check file type
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (service && !service.documentTypes.includes(`.${fileExt}`)) {
        alert(`Invalid file type. Allowed types: ${service.documentTypes.join(', ')}`);
        return;
      }
      
      // Store file
      setDocuments(prev => ({
        ...prev,
        [serviceId]: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setDocumentPreviews(prev => ({
            ...prev,
            [serviceId]: e.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document removal
  const removeDocument = (serviceId: string) => {
    const newDocs = { ...documents };
    const newPreviews = { ...documentPreviews };
    delete newDocs[serviceId];
    delete newPreviews[serviceId];
    setDocuments(newDocs);
    setDocumentPreviews(newPreviews);
    
    // Reset file input
    if (fileInputRefs.current[serviceId]) {
      fileInputRefs.current[serviceId]!.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate selections
    if (selectedServices.length === 0) {
      alert('Please select at least one verification service');
      return;
    }
    
    // Validate document uploads
    const missingDocs = selectedServices.filter(serviceId => {
      const service = services.find(s => s.id === serviceId);
      return service?.documentRequired && !documents[serviceId];
    });
    
    if (missingDocs.length > 0) {
      const missingServiceNames = missingDocs.map(id => 
        services.find(s => s.id === id)?.name
      ).join(', ');
      
      alert(`Please upload required documents for: ${missingServiceNames}`);
      return;
    }
    
    // Validate consent
    if (!consentGiven) {
      alert('Please provide your consent to continue');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would upload files and submit the form data here
      // const formData = new FormData();
      // selectedServices.forEach(serviceId => {
      //   if (documents[serviceId]) {
      //     formData.append(`document_${serviceId}`, documents[serviceId]);
      //   }
      // });
      // formData.append('services', JSON.stringify(selectedServices));
      // formData.append('organizationCode', organization?.code || '');
      
      // const response = await axios.post(`${API_URL}/verifications/submit`, formData);
      
      setSubmitSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedServices([]);
        setDocuments({});
        setDocumentPreviews({});
        setConsentGiven(false);
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting verification request:', error);
      setSubmitError('Failed to submit your verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        <h3 className="text-xl font-bold mb-2">Error Loading Services</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Section 1: Service Selection */}
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">🧾 Select Verification Services</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary-400 mb-3">🅰 Choose Services</h3>
          <div className="space-y-3">
            {services.map(service => (
              <div 
                key={service.id}
                className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                  selectedServices.includes(service.id)
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 bg-dark-600/50 hover:bg-dark-600'
                }`}
                onClick={() => toggleService(service.id)}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mr-3 ${
                    selectedServices.includes(service.id)
                      ? 'bg-primary-500'
                      : 'border border-gray-400'
                  }`}>
                    {selectedServices.includes(service.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{service.name}</h4>
                      <span className={`font-semibold ${
                        organization && organization.sponsoredServices.includes(service.id)
                          ? 'text-green-400'
                          : 'text-primary-400'
                      }`}>
                        {organization && organization.sponsoredServices.includes(service.id)
                          ? 'Sponsored'
                          : `₹${service.price.toFixed(2)}`
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Payment Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary-400 mb-3">💰 Payment Summary</h3>
          <div className="bg-dark-600/50 rounded-lg p-4 border border-dark-500">
            {selectedServices.length === 0 ? (
              <p className="text-gray-400 text-center">Select services to see payment details</p>
            ) : (
              <div className="space-y-2">
                {selectedServices.map(serviceId => {
                  const service = services.find(s => s.id === serviceId);
                  const isSponsored = organization && organization.sponsoredServices.includes(serviceId);
                  
                  if (!service) return null;
                  
                  return (
                    <div key={serviceId} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span className={isSponsored ? 'text-green-400' : ''}>
                        {isSponsored ? 'Sponsored' : `₹${service.price.toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-dark-500 my-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary-400">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Organization Code Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary-400 mb-3">🅱 Organization Code Section</h3>
          <div className="bg-dark-600/50 rounded-lg p-4 border border-dark-500">
            <label className="inline-flex items-center mb-3 cursor-pointer">
              <span className="mr-2">I have an Organization Code</span>
            </label>
            
            {!organization ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                  placeholder="Enter organization code (e.g., TCS2025BGV)"
                  className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={verifyOrgCode}
                  disabled={isVerifyingCode}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 min-w-[100px]"
                >
                  {isVerifyingCode ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-green-400">Organization Verified</h4>
                    <p className="text-sm text-gray-300 mt-1">{organization.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Valid until: {new Date(organization.validUntil).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Sponsored services: {organization.sponsoredServices.map(id => 
                        services.find(s => s.id === id)?.name
                      ).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => setOrganization(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {codeError && (
              <p className="text-red-400 text-sm mt-2">{codeError}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Section 2: Document Upload */}
      {selectedServices.length > 0 && (
        <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">📤 Upload Documents</h2>
          <p className="text-gray-300 mb-6">Please upload relevant documents for each selected service</p>
          
          <div className="space-y-4">
            {selectedServices.map(serviceId => {
              const service = services.find(s => s.id === serviceId);
              if (!service) return null;
              
              return (
                <div key={serviceId} className="bg-dark-600/50 rounded-lg p-4 border border-dark-500">
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  
                  {documents[serviceId] ? (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-300 flex items-center">
                          <svg className="w-4 h-4 text-green-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{documents[serviceId]?.name}</span>
                        </div>
                        <button
                          onClick={() => removeDocument(serviceId)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Document preview */}
                      {documentPreviews[serviceId] && (
                        <div className="mt-2 border border-dark-500 rounded-lg overflow-hidden h-32 bg-dark-800 flex items-center justify-center">
                          {documents[serviceId]?.type.startsWith('image/') ? (
                            <img 
                              src={documentPreviews[serviceId]} 
                              alt="Document preview" 
                              className="max-h-full object-contain"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm text-gray-400">Document uploaded</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-dark-500 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id={`file-${serviceId}`}
                        className="hidden"
                        accept={service.documentTypes.join(',')}
                        onChange={(e) => handleFileChange(serviceId, e)}
                        ref={(el) => fileInputRefs.current[serviceId] = el}
                      />
                      <label
                        htmlFor={`file-${serviceId}`}
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-gray-300 font-medium">Upload document</span>
                        <span className="text-xs text-gray-500 mt-1">
                          Allowed: {service.documentTypes.join(', ')}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Section 3: Consent & Submit */}
      {selectedServices.length > 0 && (
        <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">🔐 Consent & Submit</h2>
          
          <div className="mb-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-500 text-primary-500 focus:ring-primary-500 h-5 w-5"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
              />
              <span className="ml-2 text-gray-300">
                I consent to verification and storing document hash on blockchain.
              </span>
            </label>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || submitSuccess || selectedServices.length === 0}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
              isSubmitting || submitSuccess || selectedServices.length === 0
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600'
            } text-white font-medium transition-colors`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : submitSuccess ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verification Submitted</span>
              </>
            ) : (
              <span>Submit Verification</span>
            )}
          </button>
          
          {submitError && (
            <p className="text-red-400 text-sm mt-2">{submitError}</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ServiceSection; 