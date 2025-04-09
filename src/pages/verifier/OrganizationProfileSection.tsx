import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface OrganizationProfile {
  id: string;
  name: string;
  verifierCode: string;
  logo: string;
  industry: string;
  website: string;
  address: string;
  country: string;
  numberOfVerifiers: number;
  activeDate: string;
  totalDocumentsVerified: number;
  blockchainAddress?: string;
}

interface OrganizationProfileSectionProps {
  profile: OrganizationProfile | null;
  loading: boolean;
  updateOrganizationProfile: (profile: Partial<OrganizationProfile>) => Promise<void>;
}

const OrganizationProfileSection: React.FC<OrganizationProfileSectionProps> = ({
  profile,
  loading,
  updateOrganizationProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<OrganizationProfile>>({});
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleEditToggle = () => {
    if (isEditing) {
      // Discard changes and exit edit mode
      setIsEditing(false);
      setFormData({});
      setLogoPreview(null);
    } else {
      // Enter edit mode and initialize form with current data
      setIsEditing(true);
      if (profile) {
        setFormData({
          name: profile.name,
          industry: profile.industry,
          website: profile.website,
          address: profile.address,
          country: profile.country,
          blockchainAddress: profile.blockchainAddress || ''
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    try {
      await updateOrganizationProfile(formData);
      setIsEditing(false);
      setFormData({});
      setLogoPreview(null);
    } catch (error) {
      console.error('Failed to update organization profile:', error);
      // You might want to show an error message here
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-lg font-medium">No Organization Profile</p>
          <p className="text-sm max-w-md text-center mt-2">
            Your organization profile is not set up yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-dark-700 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Organization Profile</h2>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? "bg-dark-800 text-gray-300 hover:bg-dark-600"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-1">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry || ''}
                    onChange={handleInputChange}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Government">Government</option>
                    <option value="Technology">Technology</option>
                    <option value="Legal">Legal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
                    placeholder="https://www.example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">
                    Organization Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-dark-800 rounded-lg overflow-hidden flex items-center justify-center">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : profile.logo ? (
                        <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="logo-upload" className="cursor-pointer bg-dark-800 hover:bg-dark-600 text-gray-300 px-3 py-2 text-sm rounded-lg inline-block">
                        Upload New Logo
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or GIF, max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="SG">Singapore</option>
                    <option value="AE">United Arab Emirates</option>
                    {/* Add more countries as needed */}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="blockchainAddress" className="block text-sm font-medium text-gray-300 mb-1">
                    Blockchain Address (Optional)
                  </label>
                  <input
                    type="text"
                    id="blockchainAddress"
                    name="blockchainAddress"
                    value={formData.blockchainAddress || ''}
                    onChange={handleInputChange}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary-500 font-mono"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ethereum wallet address for verification operations
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t border-dark-600">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-4 py-2 bg-dark-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-dark-600 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2"
                disabled={saving}
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <div className="flex flex-col items-center text-center p-4 bg-dark-800 rounded-xl">
                <div className="w-24 h-24 bg-dark-600 rounded-full overflow-hidden mb-4 border-4 border-dark-500">
                  {profile.logo ? (
                    <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-dark-700">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold">{profile.name}</h3>
                <div className="flex items-center mt-1 mb-3">
                  <span className="text-sm text-gray-400">{profile.industry}</span>
                </div>
                {profile.website && (
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 text-sm flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
              
              <div className="p-4 bg-dark-800 rounded-xl">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Organization Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-dark-700 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Active Since</p>
                    <p className="font-medium">{profile.activeDate}</p>
                  </div>
                  <div className="p-2 bg-dark-700 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Verifiers</p>
                    <p className="font-medium">{profile.numberOfVerifiers}</p>
                  </div>
                  <div className="p-2 bg-dark-700 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Documents Verified</p>
                    <p className="font-medium">{profile.totalDocumentsVerified.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-dark-800 rounded-xl">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Verifier Code</h4>
                <div className="bg-dark-900 p-3 rounded-lg font-mono text-center text-sm border border-dark-600">
                  {profile.verifierCode}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Share this code with document owners for verification
                </p>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="p-4 bg-dark-800 rounded-xl">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Contact Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm whitespace-pre-line">{profile.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Country</p>
                    <p className="text-sm">{profile.country || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {profile.blockchainAddress && (
                <div className="p-4 bg-dark-800 rounded-xl">
                  <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Blockchain Integration</h4>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ethereum Address</p>
                    <div className="bg-dark-900 p-2 rounded-lg font-mono text-sm border border-dark-600 overflow-hidden overflow-ellipsis">
                      {profile.blockchainAddress}
                    </div>
                    <div className="mt-3 flex">
                      <a 
                        href={`https://etherscan.io/address/${profile.blockchainAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 text-xs flex items-center transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Etherscan
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-dark-800 rounded-xl">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Security & Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500 mt-1">Extra security for your organization account</p>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                      Enabled
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium">Activity Logs</p>
                      <p className="text-xs text-gray-500 mt-1">Track all verification activity</p>
                    </div>
                    <button className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
                      View Logs
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div>
                      <p className="font-medium">Verifier Permissions</p>
                      <p className="text-xs text-gray-500 mt-1">Manage team access and roles</p>
                    </div>
                    <button className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrganizationProfileSection; 