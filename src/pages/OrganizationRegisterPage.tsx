import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrganizationWarning from '../components/ui/OrganizationWarning';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:5001/api';

// Define interface for API responses
interface OrgRegisterResponse {
  success: boolean;
  organization: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

const OrganizationRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Organization form data
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [numChecks, setNumChecks] = useState<number>(100);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!orgName || !email || !phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register organization in database
      await axios.post<OrgRegisterResponse>(`${API_URL}/register-organization`, {
        orgName,
        email,
        phone,
        numChecks
      });
      
      setSuccess('Organization registration request submitted! Our team will contact you shortly.');
      
      // Redirect to login after successful submission
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Organization registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Close warning and go back to register type selection
  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section (dark background with logo) */}
      <div className="bg-dark-900 text-white w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-dark-900 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-800/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-700/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl"></div>
        
        <div className="relative z-10 text-center max-w-lg">
          <div className="w-56 h-56 mx-auto mb-10 flex items-center justify-center">
            <Link to="/">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
                <path fill="#6366f1" d="M96.49649 103.5349C94.317464 107.44894 91.53465299999999 111.0252 89.873611 115.21530999999999C83.058902 132.40616999999997 107.41146 134.95591 105.2919 119.70778999999999C104.94348 117.20169999999999 103.9493 114.75995999999999 102.80172999999999 112.51981999999998C101.13350999999999 109.26313999999998 99.01830999999999 106.16811999999999 96.49649 103.53489999999998zM80.323623 125.99722C81.86939699999999 132.11212 85.242888 135.49681 91.105535 137.67763C89.578384 131.63986 86.088058 128.21289 80.323623 125.99722zM113.56787 126.89572C107.94275 127.98485 104.51737 131.37192 102.78594 136.77917C108.41099 135.6901 111.83646 132.3029 113.56787 126.89572zM75.641606 134.22405C69.29319699999999 134.19395 63.048271 139.29384000000002 57.86127499999999 142.17011L57.86127499999999 143.96713C63.76212099999999 147.23922 72.10509099999999 154.23748 79.339125 151.24981C86.731915 148.19654 85.448319 135.84450999999999 77.61409499999999 134.4048C76.95621799999999 134.28381 76.29835399999999 134.227 75.641606 134.22399zM118.2481 134.22405C117.59137999999999 134.22705 116.93348999999999 134.28385 116.27564 134.40487000000002C108.44140999999999 135.84458 107.15778 148.19661000000002 114.55060999999999 151.24988000000002C121.78464 154.23755000000003 130.12932999999998 147.23929 136.03019 143.96720000000002L136.03019 142.17017C130.84318000000002 139.2939 124.59656000000001 134.19508000000002 118.24810000000001 134.22412000000003zM96.98962 138.47963000000001C96.84089 138.47893000000002 96.68871 138.48663000000002 96.53158 138.49973000000003C91.580782 138.96534000000003 92.501964 146.77359000000004 97.35814 146.24220000000003C102.02469 145.73147000000003 101.59626 138.49986 96.98962 138.47870000000003zM102.78594 148.45958000000002C104.33171999999999 154.57441000000003 107.70521 157.95917000000003 113.56787 160.13998C112.02022 154.02097 108.4701 150.91422 102.78594 148.45958000000002zM91.105535 149.35807000000003C85.480535 150.44711000000004 82.055002 153.83427000000003 80.323623 159.24149000000003C85.948626 158.15238000000002 89.374156 154.76529000000002 91.105535 149.35807000000003zM97.59152 156.34593000000004C91.963654 156.27303000000003 85.976059 161.43079000000003 89.738491 170.92193000000003C91.39711299999999 175.10612000000003 94.318484 178.69027000000003 96.49649 182.60234000000003C99.02655999999999 179.96076000000002 101.13319999999999 176.84656000000004 102.87369 173.61738000000003C104.08700999999999 171.36601000000002 105.00744999999999 168.98146000000003 105.31295 166.42945000000003C106.12769 159.62327000000002 101.96875 156.40255000000002 97.59152 156.34593000000004z" />
              </svg>
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">First Reference</h1>
          <p className="text-lg text-gray-200">Secure document verification with blockchain</p>
          
          <Link to="/register">
            <button className="mt-8 bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-lg inline-flex items-center transition-all shadow-lg">
              <span>Back to Account Type</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
      
      {/* Right section */}
      <div className="w-full md:w-1/2 bg-dark-800 p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h2 className="text-3xl font-bold text-primary-500 mb-2">Organization Registration</h2>
            <p className="text-gray-300 mb-6">Please provide your organization details</p>
            
            {success && (
              <div className="bg-green-900/30 border border-green-800 text-green-400 p-4 rounded-lg mb-6">
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="orgName" className="block text-gray-300 text-sm mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your organization name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 text-sm mb-2">
                  Business Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="organization@example.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-300 text-sm mb-2">
                  Business Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="numChecks" className="block text-gray-300 text-sm mb-2">
                  Number of Verifications Needed
                </label>
                <select
                  id="numChecks"
                  value={numChecks}
                  onChange={(e) => setNumChecks(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem" }}
                >
                  <option value="50">50 verifications</option>
                  <option value="100">100 verifications</option>
                  <option value="250">250 verifications</option>
                  <option value="500">500 verifications</option>
                  <option value="1000">1000 verifications</option>
                  <option value="2500">2500 verifications</option>
                  <option value="5000">5000+ verifications</option>
                </select>
                <p className="text-gray-400 text-xs mt-1">Estimated number of document verifications per month</p>
              </div>
              
              <button
                type="submit"
                className={`w-full py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Registration Request'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">Already have an account?</p>
              <Link 
                to="/login"
                className="text-primary-500 hover:text-primary-400 font-medium mt-1 inline-block"
              >
                Login Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Organization warning popup */}
      <AnimatePresence>
        {showWarning && (
          <OrganizationWarning 
            isOpen={showWarning} 
            onClose={handleCloseWarning}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationRegisterPage; 