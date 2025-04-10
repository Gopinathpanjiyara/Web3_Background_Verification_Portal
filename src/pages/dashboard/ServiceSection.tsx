import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentGateway from '../../components/PaymentGateway';

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

// Application flow steps
type AppStep = 'select_services' | 'payment' | 'upload_documents';

const ServiceSection: React.FC = () => {
  // Application flow state
  const [currentStep, setCurrentStep] = useState<AppStep>('select_services');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  // Services state
  const [services, setServices] = useState<VerificationService[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Proceed to payment
  const proceedToPayment = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one verification service');
      return;
    }
    
    setCurrentStep('payment');
  };
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    setCurrentStep('upload_documents');
  };
  
  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setCurrentStep('select_services');
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
      
      setSubmitSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedServices([]);
        setDocuments({});
        setDocumentPreviews({});
        setConsentGiven(false);
        setSubmitSuccess(false);
        setCurrentStep('select_services');
        setPaymentCompleted(false);
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
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-500/10 to-red-400/5 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 text-center shadow-lg">
        <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-2xl font-bold mb-3 text-white">Error Loading Services</h3>
        <p className="text-red-100">{error}</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentStep === 'select_services' && (
        <motion.div 
          key="select_services"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Section 1: Service Selection */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50">
            <h2 className="text-3xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Select Verification Services</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-indigo-300 mb-4">Choose Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                  <motion.div 
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 border rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                      selectedServices.includes(service.id)
                        ? 'border-indigo-500/70 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center mr-4 transition-all duration-300 ${
                        selectedServices.includes(service.id)
                          ? 'bg-indigo-500'
                          : 'border border-slate-500'
                      }`}>
                        {selectedServices.includes(service.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-white text-lg">{service.name}</h4>
                          <span className="font-semibold text-lg text-indigo-300">
                            ₹{service.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-2">{service.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-indigo-300 mb-4">Payment Summary</h3>
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/70 shadow-lg">
                {selectedServices.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">Select services to see payment details</p>
                ) : (
                  <div className="space-y-3">
                    {selectedServices.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      
                      if (!service) return null;
                      
                      return (
                        <div key={serviceId} className="flex justify-between text-base">
                          <span className="text-slate-200">{service.name}</span>
                          <span className="text-slate-300">
                            ₹{service.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t border-slate-700 my-3 pt-3 flex justify-between font-bold text-lg">
                      <span className="text-white">Total</span>
                      <span className="text-indigo-300">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Proceed Button */}
            <button
              onClick={proceedToPayment}
              disabled={selectedServices.length === 0}
              className={`w-full py-4 px-6 rounded-xl flex items-center justify-center ${
                selectedServices.length === 0
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/30'
              } text-white font-medium text-lg transition-all duration-300`}
            >
              Proceed to Payment
            </button>
          </div>
        </motion.div>
      )}

      {currentStep === 'payment' && (
        <motion.div
          key="payment"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <PaymentGateway 
            amount={calculateTotal()} 
            onSuccess={handlePaymentSuccess} 
            onCancel={handlePaymentCancel}
          />
        </motion.div>
      )}
      
      {currentStep === 'upload_documents' && (
        <motion.div 
          key="upload_documents"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Section 1: Payment Confirmation */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Payment Confirmed</h2>
                <p className="text-slate-300">Total: ₹{calculateTotal().toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/70 shadow-lg mb-6">
              <h3 className="text-xl font-semibold text-indigo-300 mb-4">Selected Services</h3>
              <div className="space-y-2">
                {selectedServices.map(serviceId => {
                  const service = services.find(s => s.id === serviceId);
                  if (!service) return null;
                  
                  return (
                    <div key={serviceId} className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-200">{service.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <p className="text-slate-300 mb-2">Please upload the required documents to complete your verification process.</p>
          </div>
          
          {/* Section 2: Document Upload */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50">
            <h2 className="text-3xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Upload Documents</h2>
            <p className="text-slate-300 mb-8">Please upload relevant documents for each selected service</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedServices.map(serviceId => {
                const service = services.find(s => s.id === serviceId);
                if (!service) return null;
                
                return (
                  <div key={serviceId} className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/70 shadow-lg">
                    <h3 className="font-semibold text-lg text-white mb-4">{service.name}</h3>
                    
                    {documents[serviceId] ? (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-slate-200 flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="truncate max-w-[200px]">{documents[serviceId]?.name}</span>
                          </div>
                          <button
                            onClick={() => removeDocument(serviceId)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Document preview */}
                        {documentPreviews[serviceId] && (
                          <div className="mt-3 border border-slate-700 rounded-xl overflow-hidden h-40 bg-slate-900/80 flex items-center justify-center shadow-inner">
                            {documents[serviceId]?.type.startsWith('image/') ? (
                              <img 
                                src={documentPreviews[serviceId]} 
                                alt="Document preview" 
                                className="max-h-full object-contain"
                              />
                            ) : (
                              <div className="text-center p-4">
                                <svg className="w-12 h-12 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-slate-400">Document uploaded</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors group">
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
                          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <span className="text-white font-medium text-lg group-hover:text-indigo-300 transition-colors">Upload document</span>
                          <span className="text-slate-400 mt-2 group-hover:text-slate-300 transition-colors">
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
          
          {/* Section 3: Consent & Submit */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50">
            <h2 className="text-3xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Consent & Submit</h2>
            
            <div className="mb-8">
              <label className="flex items-start cursor-pointer space-x-3 p-4 rounded-xl bg-slate-800/70 backdrop-blur-sm border border-slate-700/70">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 h-5 w-5"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                />
                <span className="text-slate-200">
                  I consent to verification and storing document hash on blockchain for secure, immutable record-keeping purposes. I understand this process helps maintain data integrity while protecting my privacy.
                </span>
              </label>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || submitSuccess}
              className={`w-full py-4 px-6 rounded-xl flex items-center justify-center space-x-3 ${
                isSubmitting || submitSuccess
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/30'
              } text-white font-medium text-lg transition-all duration-300`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Verification...</span>
                </>
              ) : submitSuccess ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Verification Submitted Successfully</span>
                </>
              ) : (
                <span>Submit Verification Request</span>
              )}
            </button>
            
            {submitError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                {submitError}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceSection; 