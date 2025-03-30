import React from 'react';

interface License {
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  document: File | null;
}

interface LicenseData {
  licenses: License[];
}

interface LicenseVerificationProps {
  data: LicenseData;
  onChange: (type: string, field: string, value: any, index: number) => void;
  onFileUpload: (type: string, field: string, e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onAddItem: (type: string, arrayName: string) => void;
  onRemoveItem: (type: string, arrayName: string, index: number) => void;
}

const LicenseVerification: React.FC<LicenseVerificationProps> = ({
  data,
  onChange,
  onFileUpload,
  onAddItem,
  onRemoveItem
}) => {
  return (
    <div className="bg-background-lighter rounded-xl p-6 shadow-neumorph mb-6">
      <h2 className="text-xl font-medium mb-4">Professional License Verification</h2>
      
      {data.licenses.map((license, index) => (
        <div 
          key={index} 
          className="mb-6 p-4 bg-background rounded-lg border border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">License {index + 1}</h3>
            {data.licenses.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveItem('license', 'licenses', index)}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">License Type*</label>
              <input
                type="text"
                value={license.type}
                onChange={(e) => onChange('license', 'licenses', {
                  ...license,
                  type: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Medical, Engineering, Legal, etc."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">License Number*</label>
              <input
                type="text"
                value={license.number}
                onChange={(e) => onChange('license', 'licenses', {
                  ...license,
                  number: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Issuing Authority*</label>
              <input
                type="text"
                value={license.issuingAuthority}
                onChange={(e) => onChange('license', 'licenses', {
                  ...license,
                  issuingAuthority: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="State Board, University, Association, etc."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date*</label>
              <input
                type="date"
                value={license.issueDate}
                onChange={(e) => onChange('license', 'licenses', {
                  ...license,
                  issueDate: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date*</label>
              <input
                type="date"
                value={license.expiryDate}
                onChange={(e) => onChange('license', 'licenses', {
                  ...license,
                  expiryDate: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Upload License Certificate</label>
              <input
                type="file"
                onChange={(e) => onFileUpload('license', 'licenses', e, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {license.document && (
                <p className="mt-1 text-sm text-primary-400">
                  Document uploaded: {license.document.name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => onAddItem('license', 'licenses')}
        className="mt-2 px-4 py-2 bg-background border border-gray-700 text-white rounded-lg hover:bg-background-lighter transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Another License
      </button>
    </div>
  );
};

export default LicenseVerification; 