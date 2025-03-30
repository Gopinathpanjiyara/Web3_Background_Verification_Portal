import React from 'react';
import { motion } from 'framer-motion';

interface AcademicDegree {
  degree: string;
  field: string;
  institution: string;
  graduationDate: string;
  document: File | null;
}

interface AcademicData {
  degrees: AcademicDegree[];
}

interface AcademicVerificationProps {
  data: AcademicData;
  onChange: (type: string, field: string, value: any, index: number) => void;
  onFileUpload: (type: string, field: string, e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onAddItem: (type: string, arrayName: string) => void;
  onRemoveItem: (type: string, arrayName: string, index: number) => void;
}

const AcademicVerification: React.FC<AcademicVerificationProps> = ({
  data,
  onChange,
  onFileUpload,
  onAddItem,
  onRemoveItem
}) => {
  return (
    <div className="bg-background-lighter rounded-xl p-6 shadow-neumorph mb-6">
      <h2 className="text-xl font-medium mb-4">Academic Verification</h2>
      
      {data.degrees.map((degree, index) => (
        <div 
          key={index} 
          className="mb-6 p-4 bg-background rounded-lg border border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Degree {index + 1}</h3>
            {data.degrees.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveItem('academic', 'degrees', index)}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Degree Type*</label>
              <input
                type="text"
                value={degree.degree}
                onChange={(e) => onChange('academic', 'degrees', {
                  ...degree,
                  degree: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Field of Study*</label>
              <input
                type="text"
                value={degree.field}
                onChange={(e) => onChange('academic', 'degrees', {
                  ...degree,
                  field: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Institution*</label>
              <input
                type="text"
                value={degree.institution}
                onChange={(e) => onChange('academic', 'degrees', {
                  ...degree,
                  institution: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Graduation Date*</label>
              <input
                type="date"
                value={degree.graduationDate}
                onChange={(e) => onChange('academic', 'degrees', {
                  ...degree,
                  graduationDate: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Upload Certificate</label>
              <input
                type="file"
                onChange={(e) => onFileUpload('academic', 'degrees', e, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {degree.document && (
                <p className="mt-1 text-sm text-primary-400">
                  Document uploaded: {degree.document.name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => onAddItem('academic', 'degrees')}
        className="mt-2 px-4 py-2 bg-background border border-gray-700 text-white rounded-lg hover:bg-background-lighter transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Another Degree
      </button>
    </div>
  );
};

export default AcademicVerification; 