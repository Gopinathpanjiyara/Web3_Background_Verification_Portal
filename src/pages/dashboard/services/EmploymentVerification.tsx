import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const EmploymentVerification: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if this service was selected through the ServiceSection
  useEffect(() => {
    const selectedServices = localStorage.getItem('selectedServices');
    if (!selectedServices || !JSON.parse(selectedServices).includes('employment')) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  // Document state
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({});
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    currentEmployer: false,
    supervisorName: '',
    supervisorContact: '',
    hrEmail: '',
    additionalInfo: ''
  });

  // Handle file selection
  const handleFileChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['.pdf', '.jpg', '.png', '.jpeg', '.docx'];
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.companyName || !formData.position || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate documents
    if (!documents['employmentLetter'] && !documents['payslips']) {
      alert('Please upload at least one document (Employment Letter or Payslips)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store form data and documents in localStorage
      const employmentVerificationData = {
        formData,
        documents: Object.keys(documents).map(key => ({
          type: key,
          name: documents[key]?.name,
          size: documents[key]?.size
        }))
      };
      
      localStorage.setItem('employmentVerificationData', JSON.stringify(employmentVerificationData));
      
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
          <h2 className="text-2xl font-bold text-white mb-2">Employment Details Saved!</h2>
          <p className="text-gray-300 mb-6">
            Your employment verification details have been saved. 
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
        <h2 className="text-2xl font-bold text-white">Employment Verification</h2>
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
            Please provide details about your employment history that you would like to verify. 
            Upload supporting documents such as offer letters, payslips, or employment certificates.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">Company Name*</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-1">Position/Title*</label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date*</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={formData.currentEmployer}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white disabled:bg-gray-700 disabled:text-gray-500"
            />
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="currentEmployer"
                  checked={formData.currentEmployer}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-300">Current Employer</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="supervisorName" className="block text-sm font-medium text-gray-300 mb-1">Supervisor's Name</label>
            <input
              type="text"
              id="supervisorName"
              name="supervisorName"
              value={formData.supervisorName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="supervisorContact" className="block text-sm font-medium text-gray-300 mb-1">Supervisor's Contact</label>
            <input
              type="text"
              id="supervisorContact"
              name="supervisorContact"
              value={formData.supervisorContact}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="hrEmail" className="block text-sm font-medium text-gray-300 mb-1">HR Department Email</label>
            <input
              type="email"
              id="hrEmail"
              name="hrEmail"
              value={formData.hrEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-300 mb-1">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              placeholder="Any additional details that might help in the verification process"
            ></textarea>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Required Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-dark-600 rounded-md p-4">
              <h4 className="font-medium text-gray-300 mb-2">Employment Letter / Offer Letter</h4>
              
              {documentPreviews['employmentLetter'] ? (
                <div className="mb-3">
                  <div className="relative border border-dark-600 rounded-md overflow-hidden">
                    {documentPreviews['employmentLetter'].startsWith('data:image') ? (
                      <img 
                        src={documentPreviews['employmentLetter']} 
                        alt="Document Preview" 
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    ) : (
                      <div className="bg-gray-700 p-6 text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">{documents['employmentLetter']?.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument('employmentLetter')}
                      className="absolute top-2 right-2 bg-red-700 text-red-400 rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label htmlFor="employmentLetter" className="cursor-pointer block text-center py-8 border-2 border-dashed border-dark-600 rounded-md hover:border-primary-500 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                    <input
                      id="employmentLetter"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      className="hidden"
                      onChange={(e) => handleFileChange('employmentLetter', e)}
                    />
                  </label>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Upload your employment offer letter or appointment letter from the employer.
              </p>
            </div>
            
            <div className="border border-dark-600 rounded-md p-4">
              <h4 className="font-medium text-gray-300 mb-2">Payslips (Last 3 months)</h4>
              
              {documentPreviews['payslips'] ? (
                <div className="mb-3">
                  <div className="relative border border-dark-600 rounded-md overflow-hidden">
                    {documentPreviews['payslips'].startsWith('data:image') ? (
                      <img 
                        src={documentPreviews['payslips']} 
                        alt="Document Preview" 
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    ) : (
                      <div className="bg-gray-700 p-6 text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">{documents['payslips']?.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument('payslips')}
                      className="absolute top-2 right-2 bg-red-700 text-red-400 rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label htmlFor="payslips" className="cursor-pointer block text-center py-8 border-2 border-dashed border-dark-600 rounded-md hover:border-primary-500 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                    <input
                      id="payslips"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      className="hidden"
                      onChange={(e) => handleFileChange('payslips', e)}
                    />
                  </label>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Upload your last 3 months' payslips. Combine multiple payslips into a single PDF if possible.
              </p>
            </div>
            
            <div className="border border-dark-600 rounded-md p-4">
              <h4 className="font-medium text-gray-300 mb-2">Experience Certificate (Optional)</h4>
              
              {documentPreviews['experienceCertificate'] ? (
                <div className="mb-3">
                  <div className="relative border border-dark-600 rounded-md overflow-hidden">
                    {documentPreviews['experienceCertificate'].startsWith('data:image') ? (
                      <img 
                        src={documentPreviews['experienceCertificate']} 
                        alt="Document Preview" 
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    ) : (
                      <div className="bg-gray-700 p-6 text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">{documents['experienceCertificate']?.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument('experienceCertificate')}
                      className="absolute top-2 right-2 bg-red-700 text-red-400 rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label htmlFor="experienceCertificate" className="cursor-pointer block text-center py-8 border-2 border-dashed border-dark-600 rounded-md hover:border-primary-500 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                    <input
                      id="experienceCertificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      className="hidden"
                      onChange={(e) => handleFileChange('experienceCertificate', e)}
                    />
                  </label>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                If you have left this job, upload your experience or relieving certificate.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default EmploymentVerification; 