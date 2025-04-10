import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AddressVerification: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if this service was selected through the ServiceSection
  useEffect(() => {
    const selectedServices = localStorage.getItem('selectedServices');
    if (!selectedServices || !JSON.parse(selectedServices).includes('address')) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  // Document state
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({});
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    residenceSince: '',
    addressType: 'permanent',
    rentedSince: '',
    isRented: false,
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
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate documents
    if (!documents['addressProof']) {
      alert('Please upload address proof document');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store form data and documents in localStorage
      const addressVerificationData = {
        formData,
        documents: Object.keys(documents).map(key => ({
          type: key,
          name: documents[key]?.name,
          size: documents[key]?.size
        }))
      };
      
      localStorage.setItem('addressVerificationData', JSON.stringify(addressVerificationData));
      
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
          <h2 className="text-2xl font-bold text-white mb-2">Address Details Saved!</h2>
          <p className="text-gray-300 mb-6">
            Your address verification details have been saved. 
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
        <h2 className="text-2xl font-bold text-white">Address Verification</h2>
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
            Please provide details about your current address that you would like to verify. 
            Upload supporting documents such as utility bills, bank statements, or rental agreements.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address*</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City*</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State/Province*</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code*</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-1">Address Type*</label>
            <select
              id="addressType"
              name="addressType"
              value={formData.addressType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="permanent">Permanent</option>
              <option value="current">Current</option>
              <option value="office">Office/Work</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="residenceSince" className="block text-sm font-medium text-gray-700 mb-1">Residence Since*</label>
            <input
              type="date"
              id="residenceSince"
              name="residenceSince"
              value={formData.residenceSince}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRented"
                name="isRented"
                checked={formData.isRented}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRented" className="ml-2 block text-sm text-gray-700">
                This is a rented accommodation
              </label>
            </div>
            
            {formData.isRented && (
              <div className="mt-4">
                <label htmlFor="rentedSince" className="block text-sm font-medium text-gray-700 mb-1">Rented Since</label>
                <input
                  type="date"
                  id="rentedSince"
                  name="rentedSince"
                  value={formData.rentedSince}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
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
              placeholder="Any additional details about your address..."
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Address Proof Documents</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Proof of Address*</h4>
              <p className="text-sm text-gray-600 mb-4">Upload a document that proves your address (utility bill, bank statement, rental agreement, etc.)</p>
              
              {documents['addressProof'] ? (
                <div className="relative bg-white p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">{documents['addressProof'].name}</p>
                      <p className="text-sm text-gray-500">{Math.round(documents['addressProof'].size / 1024)} KB</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeDocument('addressProof')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {documentPreviews['addressProof'] && documents['addressProof']?.type.startsWith('image/') && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <img 
                        src={documentPreviews['addressProof']} 
                        alt="Document preview" 
                        className="max-h-48 mx-auto"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    id="addressProof"
                    onChange={(e) => handleFileChange('addressProof', e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddressVerification; 