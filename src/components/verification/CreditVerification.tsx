import React from 'react';

interface CreditData {
  ssn: string;
  consent: boolean;
  document: File | null;
}

interface CreditVerificationProps {
  data: CreditData;
  onChange: (type: string, field: string, value: any) => void;
  onFileUpload: (type: string, field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CreditVerification: React.FC<CreditVerificationProps> = ({ data, onChange, onFileUpload }) => {
  return (
    <div className="bg-background-lighter rounded-xl p-6 shadow-neumorph mb-6">
      <h2 className="text-xl font-medium mb-4">Credit Verification</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Social Security Number*</label>
          <input
            type="text"
            value={data.ssn}
            onChange={(e) => onChange('credit', 'ssn', e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
            placeholder="XXX-XX-XXXX"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Your SSN is required for credit verification. We encrypt this data.</p>
        </div>
        
        <div className="md:col-span-2">
          <div className="flex items-start mt-2">
            <div className="flex items-center h-5">
              <input
                id="consent"
                type="checkbox"
                checked={data.consent}
                onChange={(e) => onChange('credit', 'consent', e.target.checked)}
                className="w-4 h-4 bg-background border border-gray-700 rounded focus:ring-primary-500"
                required
              />
            </div>
            <label htmlFor="consent" className="ml-3 text-sm text-gray-300">
              I authorize the verification of my credit history for the purpose of employment screening. I understand that this may impact my credit score.
            </label>
          </div>
        </div>
        
        <div className="md:col-span-2 mt-2">
          <label className="block text-sm font-medium mb-1">Upload Additional Credit Documents (Optional)</label>
          <p className="text-sm text-gray-400 mb-2">Credit reports, financial disclosures, etc.</p>
          <input
            type="file"
            onChange={(e) => onFileUpload('credit', 'document', e)}
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

export default CreditVerification; 