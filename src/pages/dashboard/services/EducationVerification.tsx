import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const EducationVerification: React.FC = () => {
  const navigate = useNavigate();

  // Check if this service was selected through the ServiceSection
  useEffect(() => {
    const selectedServices = localStorage.getItem('selectedServices');
    if (!selectedServices || !JSON.parse(selectedServices).includes('education')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Document state
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({});
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    instituteName: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    stillStudying: false,
    gradeOrPercentage: '',
    rollNumber: '',
    registrationNumber: '',
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
    if (!formData.instituteName || !formData.degree || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate documents
    if (!documents['degreeCertificate'] && !documents['marksheets']) {
      alert('Please upload at least one document (Degree Certificate or Marksheets)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store form data and documents in localStorage
      const educationVerificationData = {
        formData,
        documents: Object.keys(documents).map(key => ({
          type: key,
          name: documents[key]?.name,
          size: documents[key]?.size
        }))
      };
      
      localStorage.setItem('educationVerificationData', JSON.stringify(educationVerificationData));
      
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
          <h2 className="text-2xl font-bold text-white mb-2">Education Details Saved!</h2>
          <p className="text-gray-300 mb-6">
            Your education verification details have been saved. 
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
        <h2 className="text-2xl font-bold text-white">Education Verification</h2>
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
            Please provide details about your educational qualifications that you would like to verify. 
            Upload supporting documents such as degree certificates, marksheets, or transcripts.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="instituteName" className="block text-sm font-medium text-gray-300 mb-1">Institute/University Name*</label>
            <input
              type="text"
              id="instituteName"
              name="instituteName"
              value={formData.instituteName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-gray-300 mb-1">Degree/Qualification*</label>
            <select
              id="degree"
              name="degree"
              value={formData.degree}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              required
            >
              <option value="">Select Degree</option>
              <option value="High School">High School</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's">Bachelor's Degree</option>
              <option value="Master's">Master's Degree</option>
              <option value="PhD">PhD/Doctorate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-300 mb-1">Field of Study/Major*</label>
            <input
              type="text"
              id="fieldOfStudy"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
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
              disabled={formData.stillStudying}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white disabled:bg-gray-700 disabled:text-gray-500"
            />
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="stillStudying"
                  checked={formData.stillStudying}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-300">Still Studying</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="gradeOrPercentage" className="block text-sm font-medium text-gray-300 mb-1">Grade/Percentage</label>
            <input
              type="text"
              id="gradeOrPercentage"
              name="gradeOrPercentage"
              value={formData.gradeOrPercentage}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
              placeholder="e.g., 3.5 GPA or 85%"
            />
          </div>
          
          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-300 mb-1">Roll Number</label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-300 mb-1">Registration Number</label>
            <input
              type="text"
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
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
              placeholder="Any additional details about your education..."
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Educational Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-600 p-6 rounded-lg border border-dark-500">
              <h4 className="font-medium text-gray-300 mb-2">Degree Certificate</h4>
              <p className="text-sm text-gray-500 mb-4">Upload your degree/diploma certificate</p>
              
              {documents['degreeCertificate'] ? (
                <div className="relative bg-dark-700 p-4 border border-dark-500 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-primary-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">{documents['degreeCertificate'].name}</p>
                      <p className="text-sm text-gray-500">{Math.round(documents['degreeCertificate'].size / 1024)} KB</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeDocument('degreeCertificate')}
                    className="absolute top-2 right-2 text-gray-500 hover:text-primary-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {documentPreviews['degreeCertificate'] && documents['degreeCertificate']?.type.startsWith('image/') && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <img 
                        src={documentPreviews['degreeCertificate']} 
                        alt="Document preview" 
                        className="max-h-48 mx-auto"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-dark-500 rounded-lg hover:border-primary-500 transition-colors">
                  <svg className="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG, DOCX (max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    id="degreeCertificate"
                    onChange={(e) => handleFileChange('degreeCertificate', e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                  />
                </div>
              )}
            </div>
            
            <div className="bg-dark-600 p-6 rounded-lg border border-dark-500">
              <h4 className="font-medium text-gray-300 mb-2">Marksheets/Transcripts</h4>
              <p className="text-sm text-gray-500 mb-4">Upload your academic marksheets or transcripts</p>
              
              {documents['marksheets'] ? (
                <div className="relative bg-dark-700 p-4 border border-dark-500 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-primary-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">{documents['marksheets'].name}</p>
                      <p className="text-sm text-gray-500">{Math.round(documents['marksheets'].size / 1024)} KB</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeDocument('marksheets')}
                    className="absolute top-2 right-2 text-gray-500 hover:text-primary-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {documentPreviews['marksheets'] && documents['marksheets']?.type.startsWith('image/') && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <img 
                        src={documentPreviews['marksheets']} 
                        alt="Document preview" 
                        className="max-h-48 mx-auto"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-dark-500 rounded-lg hover:border-primary-500 transition-colors">
                  <svg className="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG, DOCX (max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    id="marksheets"
                    onChange={(e) => handleFileChange('marksheets', e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
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
              isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
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

export default EducationVerification; 