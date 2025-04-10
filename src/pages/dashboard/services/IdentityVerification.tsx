import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const IdentityVerification: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if this service was selected through the ServiceSection
  useEffect(() => {
    const selectedServices = localStorage.getItem('selectedServices');
    if (!selectedServices || !JSON.parse(selectedServices).includes('identity')) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  // Document state
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({});
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    aadhaarNumber: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    additionalInfo: ''
  });

  // Handle file selection
  const handleFileChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['.pdf', '.jpg', '.png', '.jpeg'];
      if (!allowedTypes.includes(`.${fileExt}`)) {
        alert(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        return;
      }
      
      // Store file
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setDocumentPreviews(prev => ({
            ...prev,
            [docType]: e.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document removal
  const removeDocument = (docType: string) => {
    const newDocs = { ...documents };
    const newPreviews = { ...documentPreviews };
    delete newDocs[docType];
    delete newPreviews[docType];
    setDocuments(newDocs);
    setDocumentPreviews(newPreviews);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mask Aadhaar number
  const maskAadhaar = (aadhaar: string) => {
    // Remove spaces and other characters
    const strippedAadhaar = aadhaar.replace(/[^0-9]/g, '');
    
    // Ensure max 12 digits
    const limitedAadhaar = strippedAadhaar.slice(0, 12);
    
    // Format with spaces
    if (limitedAadhaar.length <= 4) {
      return limitedAadhaar;
    } else if (limitedAadhaar.length <= 8) {
      return `${limitedAadhaar.slice(0, 4)} ${limitedAadhaar.slice(4)}`;
    } else {
      return `${limitedAadhaar.slice(0, 4)} ${limitedAadhaar.slice(4, 8)} ${limitedAadhaar.slice(8, 12)}`;
    }
  };

  // Handle Aadhaar input
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskAadhaar(e.target.value);
    setFormData(prev => ({
      ...prev,
      aadhaarNumber: maskedValue
    }));
  };

  // Format PAN number
  const formatPAN = (pan: string) => {
    // Convert to uppercase
    let formattedPan = pan.toUpperCase();
    
    // Remove non-alphanumeric characters
    formattedPan = formattedPan.replace(/[^A-Z0-9]/g, '');
    
    // Limit to 10 characters
    return formattedPan.slice(0, 10);
  };

  // Handle PAN input
  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPAN(e.target.value);
    setFormData(prev => ({
      ...prev,
      panNumber: formattedValue
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.dateOfBirth) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate at least one ID type
    if (!formData.aadhaarNumber && !formData.panNumber) {
      alert('Please provide either Aadhaar or PAN number');
      return;
    }
    
    // Validate documents
    if (!documents['aadhaarCard'] && !documents['panCard']) {
      alert('Please upload at least one identity document (Aadhaar or PAN)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store form data and documents in localStorage
      const identityVerificationData = {
        formData,
        documents: Object.keys(documents).map(key => ({
          type: key,
          name: documents[key]?.name,
          size: documents[key]?.size
        }))
      };
      
      localStorage.setItem('identityVerificationData', JSON.stringify(identityVerificationData));
      
      // Simulate API call with timeout for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If submission is successful, show success message
  if (submitSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-dark-800 rounded-xl shadow-lg border border-dark-600"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Identity Details Saved!</h2>
          <p className="text-gray-300 mb-6">
            Your identity verification details have been saved. 
            You can now proceed with other service forms or finalize your submission.
          </p>
          <button 
            onClick={() => navigate('/dashboard/services')}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
          >
            Return to Services
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-dark-800 rounded-xl shadow-lg border border-dark-600"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Identity Verification</h2>
        <button 
          onClick={() => navigate('/dashboard/services')}
          className="flex items-center text-primary-400 hover:text-primary-300"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Services
        </button>
      </div>
      
      <div className="bg-dark-700 p-4 rounded-lg mb-6 border border-dark-600">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-primary-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-300 text-sm">
            Please provide your personal information and upload identity documents for verification. 
            All information will be kept confidential and secure.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name (as on ID)*</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
            <input
              type="text"
              id="fatherName"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="motherName" className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
            <input
              type="text"
              id="motherName"
              name="motherName"
              value={formData.motherName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
            <input
              type="text"
              id="aadhaarNumber"
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={handleAadhaarChange}
              placeholder="XXXX XXXX XXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Format: XXXX XXXX XXXX</p>
          </div>
          
          <div>
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
            <input
              type="text"
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={handlePANChange}
              placeholder="ABCDE1234F"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Format: ABCDE1234F</p>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              readOnly
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional details that might help in the verification process"
            ></textarea>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-300 rounded-md p-4">
              <h4 className="font-medium text-gray-700 mb-2">Aadhaar Card</h4>
              
              {documentPreviews['aadhaarCard'] ? (
                <div className="mb-3">
                  <div className="relative border border-gray-300 rounded-md overflow-hidden">
                    {documentPreviews['aadhaarCard'].startsWith('data:image') ? (
                      <img 
                        src={documentPreviews['aadhaarCard']} 
                        alt="Document Preview" 
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    ) : (
                      <div className="bg-gray-100 p-6 text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">{documents['aadhaarCard']?.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument('aadhaarCard')}
                      className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label htmlFor="aadhaarCard" className="cursor-pointer block text-center py-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                    <input
                      id="aadhaarCard"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange('aadhaarCard', e)}
                    />
                  </label>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Upload front and back of your Aadhaar card in a single file. Please ensure all details are clearly visible.
              </p>
            </div>
            
            <div className="border border-gray-300 rounded-md p-4">
              <h4 className="font-medium text-gray-700 mb-2">PAN Card</h4>
              
              {documentPreviews['panCard'] ? (
                <div className="mb-3">
                  <div className="relative border border-gray-300 rounded-md overflow-hidden">
                    {documentPreviews['panCard'].startsWith('data:image') ? (
                      <img 
                        src={documentPreviews['panCard']} 
                        alt="Document Preview" 
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    ) : (
                      <div className="bg-gray-100 p-6 text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">{documents['panCard']?.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument('panCard')}
                      className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label htmlFor="panCard" className="cursor-pointer block text-center py-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                    <input
                      id="panCard"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange('panCard', e)}
                    />
                  </label>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Upload your PAN card. Please ensure all details are clearly visible.
              </p>
            </div>
            
            <div className="border border-gray-300 rounded-md p-4">
              <h4 className="font-medium text-gray-700 mb-2">Passport Size Photo (Optional)</h4>
              
              {documentPreviews['photo'] ? (
                <div className="mb-3">
                  <div className="relative border border-gray-300 rounded-md overflow-hidden">
                    {documentPreviews['photo'].startsWith('data:image') ? (
                      <img 
                        src={documentPreviews['photo']} 
                        alt="Document Preview" 
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    ) : (
                      <div className="bg-gray-100 p-6 text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">{documents['photo']?.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument('photo')}
                      className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label htmlFor="photo" className="cursor-pointer block text-center py-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                    <input
                      id="photo"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange('photo', e)}
                    />
                  </label>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Upload a recent passport size photograph with a white background.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Documents'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default IdentityVerification; 