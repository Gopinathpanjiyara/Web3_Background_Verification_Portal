import React from 'react';

interface EmploymentHistory {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  document: File | null;
}

interface EmploymentData {
  history: EmploymentHistory[];
}

interface EmploymentVerificationProps {
  data: EmploymentData;
  onChange: (type: string, field: string, value: any, index: number) => void;
  onFileUpload: (type: string, field: string, e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onAddItem: (type: string, arrayName: string) => void;
  onRemoveItem: (type: string, arrayName: string, index: number) => void;
}

const EmploymentVerification: React.FC<EmploymentVerificationProps> = ({
  data,
  onChange,
  onFileUpload,
  onAddItem,
  onRemoveItem
}) => {
  return (
    <div className="bg-background-lighter rounded-xl p-6 shadow-neumorph mb-6">
      <h2 className="text-xl font-medium mb-4">Employment Verification</h2>
      
      {data.history.map((job, index) => (
        <div 
          key={index} 
          className="mb-6 p-4 bg-background rounded-lg border border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Employment {index + 1}</h3>
            {data.history.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveItem('employment', 'history', index)}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company*</label>
              <input
                type="text"
                value={job.company}
                onChange={(e) => onChange('employment', 'history', {
                  ...job,
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
                value={job.position}
                onChange={(e) => onChange('employment', 'history', {
                  ...job,
                  position: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Date*</label>
              <input
                type="date"
                value={job.startDate}
                onChange={(e) => onChange('employment', 'history', {
                  ...job,
                  startDate: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={job.endDate}
                onChange={(e) => onChange('employment', 'history', {
                  ...job,
                  endDate: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Leave blank if current"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Supervisor Name</label>
              <input
                type="text"
                value={job.supervisor}
                onChange={(e) => onChange('employment', 'history', {
                  ...job,
                  supervisor: e.target.value
                }, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Upload Proof of Employment</label>
              <p className="text-sm text-gray-400 mb-2">Employment letter, pay stubs, contract, etc.</p>
              <input
                type="file"
                onChange={(e) => onFileUpload('employment', 'history', e, index)}
                className="w-full bg-background-lighter border border-gray-700 rounded-lg p-2.5 text-white focus:ring-primary-500 focus:border-primary-500"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {job.document && (
                <p className="mt-1 text-sm text-primary-400">
                  Document uploaded: {job.document.name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => onAddItem('employment', 'history')}
        className="mt-2 px-4 py-2 bg-background border border-gray-700 text-white rounded-lg hover:bg-background-lighter transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Another Employment
      </button>
    </div>
  );
};

export default EmploymentVerification; 