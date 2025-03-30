import React from 'react';

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  residenceSince: string;
  document: File | null;
}

interface AddressVerificationProps {
  data: AddressData;
  onChange: (type: string, field: string, value: any) => void;
  onFileUpload: (type: string, field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressVerification: React.FC<AddressVerificationProps> = ({ data, onChange, onFileUpload }) => {
  return (
    <div className="bg-background-lighter rounded-xl p-6 shadow-neumorph mb-6">
      <h2 className="text-xl font-medium mb-4">Address Verification</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Street Address*</label>
          <input
            type="text"
            value={data.street}
            onChange={(e) => onChange('address', 'street', e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">City*</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange('address', 'city', e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">State/Province*</label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => onChange('address', 'state', e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Zip/Postal Code*</label>
          <input
            type="text"
            value={data.zipCode}
            onChange={(e) => onChange('address', 'zipCode', e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Country*</label>
          <input
            type="text"
            value={data.country}
            onChange={(e) => onChange('address', 'country', e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Residence Since*</label>
          <input
            type="date"
            value={data.residenceSince}
            onChange={(e) => onChange('address', 'residenceSince', e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Upload Proof of Address</label>
          <p className="text-sm text-gray-400 mb-2">Utility bill, bank statement, etc. not older than 3 months</p>
          <input
            type="file"
            onChange={(e) => onFileUpload('address', 'document', e)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {data.document && (
            <p className="mt-1 text-sm text-primary-400">
              Document uploaded: {data.document.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressVerification; 