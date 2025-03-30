import React from 'react';

interface Reference {
  name: string;
  relationship: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  document: File | null;
}

interface ReferenceData {
  references: Reference[];
}

interface ReferenceVerificationProps {
  data: ReferenceData;
  onChange: (type: string, field: string, value: any, index: number) => void;
  onFileUpload: (type: string, field: string, e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onAddItem: (type: string, arrayName: string) => void;
  onRemoveItem: (type: string, arrayName: string, index: number) => void;
}

const ReferenceVerification: React.FC<ReferenceVerificationProps> = ({
  data,
  onChange,
  onFileUpload,
  onAddItem,
  onRemoveItem
}) => {
  return (
    <div className="bg-background-lighter rounded-xl p-6 shadow-neumorph mb-6">
      <h2 className="text-xl font-medium mb-4">Reference Verification</h2>
      
      {data.references.map((reference, index) => (
        <div 
          key={index} 
          className="mb-6 p-4 bg-background rounded-lg border border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Reference {index + 1}</h3>
            {data.references.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveItem('reference', 'references', index)}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reference Name*</label>
              <input
                type="text"
                value={reference.name}
                onChange={(e) => onChange('reference', 'references', {
                  ...reference,
                  name: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Relationship*</label>
              <select
                value={reference.relationship}
                onChange={(e) => onChange('reference', 'references', {
                  ...reference,
                  relationship: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select Relationship</option>
                <option value="Manager">Manager</option>
                <option value="Colleague">Colleague</option>
                <option value="Client">Client</option>
                <option value="Subordinate">Subordinate</option>
                <option value="Academic">Academic</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Company*</label>
              <input
                type="text"
                value={reference.company}
                onChange={(e) => onChange('reference', 'references', {
                  ...reference,
                  company: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Position*</label>
              <input
                type="text"
                value={reference.position}
                onChange={(e) => onChange('reference', 'references', {
                  ...reference,
                  position: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                value={reference.email}
                onChange={(e) => onChange('reference', 'references', {
                  ...reference,
                  email: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone*</label>
              <input
                type="tel"
                value={reference.phone}
                onChange={(e) => onChange('reference', 'references', {
                  ...reference,
                  phone: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Upload Reference Letter (Optional)</label>
              <input
                type="file"
                onChange={(e) => onFileUpload('reference', 'references', e, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {reference.document && (
                <p className="mt-1 text-sm text-primary-400">
                  Document uploaded: {reference.document.name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => onAddItem('reference', 'references')}
        className="mt-2 px-4 py-2 bg-background border border-gray-700 text-white rounded-lg hover:bg-background-lighter transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Another Reference
      </button>
    </div>
  );
};

export default ReferenceVerification; 