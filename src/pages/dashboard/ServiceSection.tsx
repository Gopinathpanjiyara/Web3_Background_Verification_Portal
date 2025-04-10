import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
type AppStep = 'select_services' | 'payment' | 'payment_success' | 'final_submission';

const ServiceSection: React.FC = () => {
  const navigate = useNavigate();
  
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
  
  // Completed forms tracking
  const [completedForms, setCompletedForms] = useState<string[]>([]);

  // Check localStorage for previously completed forms
  useEffect(() => {
    const checkCompletedForms = () => {
      const forms: string[] = [];
      
      if (localStorage.getItem('educationVerificationData')) forms.push('education');
      if (localStorage.getItem('employmentVerificationData')) forms.push('employment');
      if (localStorage.getItem('addressVerificationData')) forms.push('address');
      if (localStorage.getItem('identityVerificationData')) forms.push('identity');
      
      setCompletedForms(forms);
    };
    
    checkCompletedForms();
    
    // Set up an interval to periodically check for newly completed forms
    const intervalId = setInterval(checkCompletedForms, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

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
    setCurrentStep('payment_success');
    
    // Store selected services in localStorage to access them in service pages
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    
    // Wait for animation to complete before redirecting
    setTimeout(() => {
      // If there's only one service selected, redirect directly to that service
      if (selectedServices.length === 1) {
        const serviceId = selectedServices[0];
        navigateToServicePage(serviceId);
      }
    }, 2000);
  };
  
  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setCurrentStep('select_services');
  };

  // Navigate to appropriate service page based on service ID
  const navigateToServicePage = (serviceId: string) => {
    switch (serviceId) {
      case 'education':
        navigate('/dashboard/services/education');
        break;
      case 'employment':
        navigate('/dashboard/services/employment');
        break;
      case 'identity':
        navigate('/dashboard/services/identity');
        break;
      case 'address':
        navigate('/dashboard/services/address');
        break;
      default:
        console.error(`Unknown service ID: ${serviceId}`);
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

  // Check if all selected services have their forms completed
  const allFormsCompleted = () => {
    return selectedServices.every(serviceId => completedForms.includes(serviceId));
  };
  
  // Proceed to final submission
  const proceedToFinalSubmission = () => {
    setCurrentStep('final_submission');
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate consent
    if (!consentGiven) {
      alert('Please provide your consent to continue');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Collect all verification data from localStorage
      const collectedData = {
        selectedServices,
        educationData: localStorage.getItem('educationVerificationData') 
          ? JSON.parse(localStorage.getItem('educationVerificationData')!) 
          : null,
        employmentData: localStorage.getItem('employmentVerificationData') 
          ? JSON.parse(localStorage.getItem('employmentVerificationData')!) 
          : null,
        addressData: localStorage.getItem('addressVerificationData') 
          ? JSON.parse(localStorage.getItem('addressVerificationData')!) 
          : null,
        identityData: localStorage.getItem('identityVerificationData') 
          ? JSON.parse(localStorage.getItem('identityVerificationData')!) 
          : null,
        paymentAmount: calculateTotal()
      };
      
      console.log('Submitting verification data:', collectedData);
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would upload all data here
      // const formData = new FormData();
      // formData.append('verificationData', JSON.stringify(collectedData));
      
      setSubmitSuccess(true);
      
      // Clear localStorage data after successful submission
      localStorage.removeItem('educationVerificationData');
      localStorage.removeItem('employmentVerificationData');
      localStorage.removeItem('addressVerificationData');
      localStorage.removeItem('identityVerificationData');
      localStorage.removeItem('selectedServices');
      
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedServices([]);
        setDocuments({});
        setDocumentPreviews({});
        setConsentGiven(false);
        setSubmitSuccess(false);
        setCompletedForms([]);
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
      
      {currentStep === 'payment_success' && (
        <motion.div 
          key="payment_success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Payment Success */}
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
                      {completedForms.includes(serviceId) && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">Completed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <p className="text-slate-300 mb-6">Please complete the verification forms for each selected service.</p>
            
            {/* Navigate to Service Pages or Final Submission */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedServices.map(serviceId => {
                  const service = services.find(s => s.id === serviceId);
                  if (!service) return null;
                  
                  const isCompleted = completedForms.includes(serviceId);
                  
                  return (
                    <button
                      key={serviceId}
                      onClick={() => navigateToServicePage(serviceId)}
                      className={`py-3 px-4 rounded-xl shadow-lg text-white font-medium transition-all duration-300 flex items-center ${
                        isCompleted 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span className="flex-1">{service.name} Form</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  );
                })}
              </div>
              
              {allFormsCompleted() && (
                <button
                  onClick={proceedToFinalSubmission}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/30 text-white font-medium transition-all duration-300"
                >
                  Proceed to Final Submission
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {currentStep === 'final_submission' && (
        <motion.div 
          key="final_submission"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50">
            <h2 className="text-3xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Final Submission</h2>
            
            {/* Submit Success Message */}
            {submitSuccess ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Submission Successful!</h3>
                <p className="text-slate-300 mb-6">
                  Your verification request has been submitted successfully. You will receive updates on the status of your verification.
                </p>
                <p className="text-slate-400 mb-6">
                  Reference ID: VER-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/70 shadow-lg mb-6">
                  <h3 className="text-xl font-semibold text-indigo-300 mb-4">Verification Summary</h3>
                  <div className="space-y-4">
                    {selectedServices.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      if (!service) return null;
                      
                      return (
                        <div key={serviceId} className="bg-slate-700/50 rounded-lg p-4">
                          <h4 className="font-semibold text-white flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {service.name}
                          </h4>
                          <p className="text-slate-300 text-sm mt-1">All required information provided</p>
                        </div>
                      );
                    })}
                    
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-white flex items-center">
                        <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Payment Completed
                      </h4>
                      <p className="text-slate-300 text-sm mt-1">Total: ₹{calculateTotal().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Consent Checkbox */}
                <div className="mb-6">
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/70">
                    <h3 className="text-xl font-semibold text-indigo-300 mb-4">Consent</h3>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="consent" className="ml-2 block text-sm text-slate-300">
                        I hereby confirm that all information provided is accurate and true to the best of my knowledge. 
                        I authorize BlockVerify to verify this information with relevant authorities and share the verification results 
                        with authorized parties. I understand that any false information may result in rejection of my verification request.
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Submit Error */}
                {submitError && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{submitError}</span>
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep('payment_success')}
                    className="py-2 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={!consentGiven || isSubmitting}
                    className={`py-3 px-6 rounded-xl flex items-center shadow-lg ${
                      !consentGiven || isSubmitting
                        ? 'bg-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/30'
                    } text-white font-medium transition-all duration-300`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit Verification Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceSection; 