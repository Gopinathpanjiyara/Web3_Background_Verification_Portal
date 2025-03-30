import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Import components directly
import IdentityVerification from '../../../components/verification/IdentityVerification';
import AddressVerification from '../../../components/verification/AddressVerification';
import AcademicVerification from '../../../components/verification/AcademicVerification';
import EmploymentVerification from '../../../components/verification/EmploymentVerification';
import CreditVerification from '../../../components/verification/CreditVerification';
import LicenseVerification from '../../../components/verification/LicenseVerification';
import ReferenceVerification from '../../../components/verification/ReferenceVerification';

// Verification type icons
const IdentificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const DocumentCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const AddCandidateSection: React.FC = () => {
  // Step state (1 = select verification types, 2 = fill form)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Verification types
  const verificationTypes = [
    {
      id: 'identity',
      name: 'Identity Verification',
      description: 'Verify identity documents',
      icon: IdentificationIcon
    },
    {
      id: 'address',
      name: 'Address Verification',
      description: 'Verify residential address',
      icon: HomeIcon
    },
    {
      id: 'academic',
      name: 'Academic Verification',
      description: 'Verify educational qualifications',
      icon: AcademicCapIcon
    },
    {
      id: 'employment',
      name: 'Employment Records',
      description: 'Verify employment history',
      icon: BriefcaseIcon
    },
    {
      id: 'credit',
      name: 'Credit Report',
      description: 'Verify credit history',
      icon: CreditCardIcon
    },
    {
      id: 'license',
      name: 'Professional License',
      description: 'Verify professional licenses',
      icon: DocumentCheckIcon
    },
    {
      id: 'reference',
      name: 'Reference Verification',
      description: 'Verify professional references',
      icon: UserGroupIcon
    }
  ];
  
  // Selected verification types
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Basic candidate information
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    position: '',
    experience: '',
  });

  // State for verification data
  const [verificationData, setVerificationData] = useState({
    identity: {
      idType: '',
      idNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingAuthority: '',
      document: null
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      residenceSince: '',
      document: null
    },
    academic: {
      degrees: [
        {
          degree: '',
          field: '',
          institution: '',
          graduationDate: '',
          document: null
        }
      ]
    },
    employment: {
      history: [
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          supervisor: '',
          document: null
        }
      ]
    },
    credit: {
      ssn: '',
      consent: false,
      document: null
    },
    license: {
      licenses: [
        {
          type: '',
          number: '',
          issuingAuthority: '',
          issueDate: '',
          expiryDate: '',
          document: null
        }
      ]
    },
    reference: {
      references: [
        {
          name: '',
          relationship: '',
          company: '',
          position: '',
          email: '',
          phone: '',
          document: null
        }
      ]
    }
  });

  // State for showing success message
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle selection of verification type
  const toggleVerificationType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };
  
  // Proceed to next step
  const proceedToFormStep = () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one verification type');
      return;
    }
    setCurrentStep(2);
  };
  
  // Go back to verification type selection
  const goBackToSelection = () => {
    setCurrentStep(1);
  };
  
  // Handle basic info changes
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo({
      ...basicInfo,
      [name]: value
    });
  };
  
  // Handle verification data changes
  const handleVerificationDataChange = (type: string, field: string, value: any, index: number | null = null) => {
    setVerificationData(prev => {
      const newData = { ...prev } as any;
      
      if (index !== null) {
        // Handle array fields (like degrees, employment history)
        if (typeof value === 'object') {
          // For updating a specific field in an object within an array
          newData[type][field][index] = {
            ...newData[type][field][index],
            ...value
          };
        } else {
          // For updating a simple value
          newData[type][field][index] = value;
        }
      } else {
        // Handle simple fields
        newData[type][field] = value;
      }
      
      return newData;
    });
  };

  // Function to add a new item to an array in verification data
  const addArrayItem = (type: string, arrayName: string) => {
    setVerificationData(prev => {
      const newData = { ...prev } as any;
      
      // Define empty templates for each array type
      const templates: any = {
        academic: {
          degrees: {
            degree: '',
            field: '',
            institution: '',
            graduationDate: '',
            document: null
          }
        },
        employment: {
          history: {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            supervisor: '',
            document: null
          }
        },
        license: {
          licenses: {
            type: '',
            number: '',
            issuingAuthority: '',
            issueDate: '',
            expiryDate: '',
            document: null
          }
        },
        reference: {
          references: {
            name: '',
            relationship: '',
            company: '',
            position: '',
            email: '',
            phone: '',
            document: null
          }
        }
      };
      
      // Add a new item to the array
      if (templates[type] && templates[type][arrayName]) {
        newData[type][arrayName] = [...newData[type][arrayName], templates[type][arrayName]];
      }
      
      return newData;
    });
  };
  
  // Function to remove an item from an array in verification data
  const removeArrayItem = (type: string, arrayName: string, index: number) => {
    setVerificationData(prev => {
      const newData = { ...prev } as any;
      
      // Remove the item at the specified index
      if (newData[type] && newData[type][arrayName] && newData[type][arrayName].length > index) {
        newData[type][arrayName] = newData[type][arrayName].filter((_: any, i: number) => i !== index);
      }
      
      return newData;
    });
  };
  
  // Handle file uploads
  const handleFileUpload = (type: string, field: string, e: React.ChangeEvent<HTMLInputElement>, index: number | null = null) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleVerificationDataChange(type, field, file, index);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(1);
        setSelectedTypes([]);
        setBasicInfo({
          name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          position: '',
          experience: '',
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-500/80 bg-clip-text text-transparent">
          {currentStep === 1 ? 'Select Verification Types' : 'Add Candidate'}
        </h1>
      </div>

      {/* Success message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-xl text-green-400 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Candidate added successfully!</span>
          </div>
          <div className="animate-spin h-5 w-5 border-2 border-green-400 border-t-transparent rounded-full"></div>
        </motion.div>
      )}
      
      {/* Step 1: Select Verification Types */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verificationTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => toggleVerificationType(type.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedTypes.includes(type.id)
                    ? 'bg-primary-500/20 border border-primary-500'
                    : 'bg-background-lighter border border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <type.icon />
                  <div>
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <motion.button
              type="button"
              onClick={proceedToFormStep}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-500/80 text-white rounded-xl font-medium shadow-neumorph transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Proceed to Form</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Step 2: Fill Form */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="bg-background-lighter rounded-xl p-6 shadow-neumorph mb-6">
              <h2 className="text-xl font-medium mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={basicInfo.name}
                    onChange={handleBasicInfoChange}
                    className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={basicInfo.email}
                    onChange={handleBasicInfoChange}
                    className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone*</label>
                  <input
                    type="tel"
                    name="phone"
                    value={basicInfo.phone}
                    onChange={handleBasicInfoChange}
                    className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth*</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={basicInfo.date_of_birth}
                    onChange={handleBasicInfoChange}
                    className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position*</label>
                  <input
                    type="text"
                    name="position"
                    value={basicInfo.position}
                    onChange={handleBasicInfoChange}
                    className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience (years)*</label>
                  <input
                    type="number"
                    name="experience"
                    value={basicInfo.experience}
                    onChange={handleBasicInfoChange}
                    className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Verification Forms */}
            {selectedTypes.includes('identity') && (
              <IdentityVerification 
                data={verificationData.identity} 
                onChange={handleVerificationDataChange}
                onFileUpload={handleFileUpload}
              />
            )}
            
            {selectedTypes.includes('address') && (
              <AddressVerification 
                data={verificationData.address} 
                onChange={handleVerificationDataChange}
                onFileUpload={handleFileUpload}
              />
            )}
            
            {selectedTypes.includes('academic') && (
              <AcademicVerification 
                data={verificationData.academic} 
                onChange={handleVerificationDataChange}
                onFileUpload={handleFileUpload}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            )}
            
            {selectedTypes.includes('employment') && (
              <EmploymentVerification 
                data={verificationData.employment} 
                onChange={handleVerificationDataChange}
                onFileUpload={handleFileUpload}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            )}
            
            {selectedTypes.includes('credit') && (
              <CreditVerification 
                data={verificationData.credit} 
                onChange={handleVerificationDataChange}
                onFileUpload={handleFileUpload}
              />
            )}
            
            {selectedTypes.includes('license') && (
              <LicenseVerification 
                data={verificationData.license} 
                onChange={handleVerificationDataChange}
                onFileUpload={handleFileUpload}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            )}
            
            {selectedTypes.includes('reference') && (
              <ReferenceVerification 
                data={verificationData.reference} 
                onChange={handleVerificationDataChange}
                onFileUpload={handleFileUpload}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={goBackToSelection}
                className="px-6 py-2.5 bg-background border border-gray-700 text-white rounded-lg hover:bg-background-lighter transition-colors"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-500/80 text-white rounded-lg hover:from-primary-600 hover:to-primary-600/80 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddCandidateSection; 