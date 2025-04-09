import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrganizationWarning from '../components/ui/OrganizationWarning';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:5002/api';

// Define interface for API responses
interface RegisterResponse {
  success: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    [key: string]: any;
  };
}

const IndividualRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Step state - initialize from location state if available
  const [step, setStep] = useState<'org-check' | 'registration'>(
    location.state?.step || 'org-check'
  );
  
  // Organization check state
  const [showOrgWarning, setShowOrgWarning] = useState(false);
  
  // User data
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Dropdown ref for outside click handling
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Check if phone or email already exists
  const checkDuplicateEntry = async (field: string, value: string): Promise<boolean> => {
    try {
      const response = await axios.post<{exists: boolean}>(`${API_URL}/check-duplicate`, {
        field,
        value
      });
      return response.data.exists;
    } catch (err) {
      console.error(`Error checking duplicate ${field}:`, err);
      return false;
    }
  };

  // Capitalize first letter of a string
  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Handle individual user registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !dob || !gender || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits');
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate first and last name start with a capital letter
    if (firstName.charAt(0) !== firstName.charAt(0).toUpperCase()) {
      setError('First name should start with a capital letter');
      return;
    }
    
    if (lastName.charAt(0) !== lastName.charAt(0).toUpperCase()) {
      setError('Last name should start with a capital letter');
      return;
    }
    
    // Verify passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setIsCheckingDuplicate(true);
    
    try {
      // Check for duplicate entries
      const isDuplicatePhone = await checkDuplicateEntry('phone', phone);
      if (isDuplicatePhone) {
        setError('This phone number is already registered. Please use a different phone number or login.');
        setIsLoading(false);
        setIsCheckingDuplicate(false);
        return;
      }
      
      const isDuplicateEmail = await checkDuplicateEntry('email', email);
      if (isDuplicateEmail) {
        setError('This email is already registered. Please use a different email address or login.');
        setIsLoading(false);
        setIsCheckingDuplicate(false);
        return;
      }
      
      setIsCheckingDuplicate(false);
      
      // Create full name from first and last name
      const fullName = `${firstName} ${lastName}`;
      
      // Register user in database
      const response = await axios.post<RegisterResponse>(`${API_URL}/register`, {
        firstName,
        lastName,
        name: fullName,
        phone,
        email,
        dob,
        gender,
        password,
      });
      
      setSuccess('Registration successful! You can now log in.');
      
      // After successful registration, redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      // Enhanced error handling
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle organization check responses
  const handleOrgCheckResponse = (isPartOfOrg: boolean) => {
    if (isPartOfOrg) {
      setShowOrgWarning(true);
    } else {
      setStep('registration');
    }
  };
  
  // Handle closing the org warning
  const handleCloseOrgWarning = () => {
    setShowOrgWarning(false);
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left section (dark background with logo) - fixed */}
      <div className="bg-dark-900 text-white w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden md:fixed md:h-screen md:left-0">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-dark-900 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-800/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-700/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl"></div>
        
        <div className="relative z-10 text-center max-w-lg">
          <div className="w-52 h-52 mx-auto mb-6 flex items-center justify-center">
            <Link to="/">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
                <path fill="#6366f1" d="M96.49649 103.5349C94.317464 107.44894 91.53465299999999 111.0252 89.873611 115.21530999999999C83.058902 132.40616999999997 107.41146 134.95591 105.2919 119.70778999999999C104.94348 117.20169999999999 103.9493 114.75995999999999 102.80172999999999 112.51981999999998C101.13350999999999 109.26313999999998 99.01830999999999 106.16811999999999 96.49649 103.53489999999998zM80.323623 125.99722C81.86939699999999 132.11212 85.242888 135.49681 91.105535 137.67763C89.578384 131.63986 86.088058 128.21289 80.323623 125.99722zM113.56787 126.89572C107.94275 127.98485 104.51737 131.37192 102.78594 136.77917C108.41099 135.6901 111.83646 132.3029 113.56787 126.89572zM75.641606 134.22405C69.29319699999999 134.19395 63.048271 139.29384000000002 57.86127499999999 142.17011L57.86127499999999 143.96713C63.76212099999999 147.23922 72.10509099999999 154.23748 79.339125 151.24981C86.731915 148.19654 85.448319 135.84450999999999 77.61409499999999 134.4048C76.95621799999999 134.28381 76.29835399999999 134.227 75.641606 134.22399zM118.2481 134.22405C117.59137999999999 134.22705 116.93348999999999 134.28385 116.27564 134.40487000000002C108.44140999999999 135.84458 107.15778 148.19661000000002 114.55060999999999 151.24988000000002C121.78464 154.23755000000003 130.12932999999998 147.23929 136.03019 143.96720000000002L136.03019 142.17017C130.84318000000002 139.2939 124.59656000000001 134.19508000000002 118.24810000000001 134.22412000000003zM96.98962 138.47963000000001C96.84089 138.47893000000002 96.68871 138.48663000000002 96.53158 138.49973000000003C91.580782 138.96534000000003 92.501964 146.77359000000004 97.35814 146.24220000000003C102.02469 145.73147000000003 101.59626 138.49986 96.98962 138.47870000000003zM102.78594 148.45958000000002C104.33171999999999 154.57441000000003 107.70521 157.95917000000003 113.56787 160.13998C112.02022 154.02097 108.4701 150.91422 102.78594 148.45958000000002zM91.105535 149.35807000000003C85.480535 150.44711000000004 82.055002 153.83427000000003 80.323623 159.24149000000003C85.948626 158.15238000000002 89.374156 154.76529000000002 91.105535 149.35807000000003zM97.59152 156.34593000000004C91.963654 156.27303000000003 85.976059 161.43079000000003 89.738491 170.92193000000003C91.39711299999999 175.10612000000003 94.318484 178.69027000000003 96.49649 182.60234000000003C99.02655999999999 179.96076000000002 101.13319999999999 176.84656000000004 102.87369 173.61738000000003C104.08700999999999 171.36601000000002 105.00744999999999 168.98146000000003 105.31295 166.42945000000003C106.12769 159.62327000000002 101.96875 156.40255000000002 97.59152 156.34593000000004z" />
              </svg>
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">First Reference</h1>
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
      
      {/* Right section (form) - scrollable */}
      <div className="w-full md:w-1/2 bg-dark-800 p-8 md:p-12 flex items-center justify-center md:ml-[50%] min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 'org-check' && (
              <motion.div
                key="org-check"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-3xl font-bold text-primary-500 mb-4">Individual Registration</h2>
                <p className="text-gray-300 mb-8">Please confirm your registration type</p>
                
                <div className="bg-dark-700 p-6 rounded-xl mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Are you registering as part of an organization?</h3>
                  <p className="text-gray-400 mb-6">If you're an employee of an organization using FirstReference, select "Yes"</p>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => handleOrgCheckResponse(true)}
                      className="py-2 px-4 rounded-lg bg-dark-600 hover:bg-dark-500 text-white font-medium transition-colors"
                    >
                      Yes, I'm with an organization
                    </button>
                    <button
                      onClick={() => handleOrgCheckResponse(false)}
                      className="py-2 px-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                    >
                      No, I'm an individual
                    </button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setStep('registration')}
                      className="text-primary-500 hover:text-primary-400 font-medium mt-2 inline-block"
                    >
                      Skip to registration form
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {step === 'registration' && (
              <motion.div
                key="register-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-3xl font-bold text-primary-500 mb-2">Create Account</h2>
                <p className="text-gray-300 mb-4">Welcome! Set up your individual profile</p>
                
                {success && (
                  <div className="bg-green-900/30 border border-green-800 text-green-400 p-3 rounded-lg mb-4">
                    {success}
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleRegister}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-gray-300 text-sm mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-gray-300 text-sm mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="reg-phone" className="block text-gray-300 text-sm mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="reg-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-300 text-sm mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="dob" className="block text-gray-300 text-sm mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-gray-300 text-sm mb-2">
                        Gender
                      </label>
                      <div className="relative" ref={dropdownRef}>
                        <div 
                          className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer flex justify-between items-center"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                          <span>{gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Select gender'}</span>
                          <svg className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {dropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-dark-800 border border-dark-600 rounded-lg shadow-lg">
                            <div 
                              className="px-4 py-2 hover:bg-dark-700 cursor-pointer text-white"
                              onClick={() => {
                                setGender('male');
                                setDropdownOpen(false);
                              }}
                            >
                              Male
                            </div>
                            <div 
                              className="px-4 py-2 hover:bg-dark-700 cursor-pointer text-white"
                              onClick={() => {
                                setGender('female');
                                setDropdownOpen(false);
                              }}
                            >
                              Female
                            </div>
                            <div 
                              className="px-4 py-2 hover:bg-dark-700 cursor-pointer text-white"
                              onClick={() => {
                                setGender('other');
                                setDropdownOpen(false);
                              }}
                            >
                              Other
                            </div>      
                          </div>
                        )}
                        
                        {/* Hidden input for form validation */}
                        <input 
                          type="hidden" 
                          name="gender" 
                          value={gender} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="reg-password" className="block text-gray-300 text-sm mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="reg-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Create a password"
                      minLength={6}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirm-password" className="block text-gray-300 text-sm mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Confirm your password"
                      minLength={6}
                      required
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="w-full py-3 mb-4 rounded-lg bg-dark-700 text-white font-semibold hover:bg-dark-600 transition-colors flex items-center relative"
                    onClick={() => {/* TODO: Implement OCID connection */}}
                  >
                    <img 
                      src="/ocid-logo.svg" 
                      alt="OCID Logo" 
                      className="w-6 h-6 absolute left-[calc(50%-70px)]"
                    />
                    <div className="flex items-center gap-1 w-full justify-center">
                      <span className="font-normal">Link</span><span className="font-bold">OCID</span>
                    </div>
                  </button>
                  
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (isCheckingDuplicate ? 'Checking information...' : 'Registering...') : 'Register & Continue'}
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
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Organization warning popup */}
      <AnimatePresence>
        {showOrgWarning && (
          <OrganizationWarning 
            isOpen={showOrgWarning} 
            onClose={handleCloseOrgWarning}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndividualRegisterPage; 