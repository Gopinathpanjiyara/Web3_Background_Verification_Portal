import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import LoadingScreen from '../components/ui/LoadingScreen';

// API URL
const API_URL = 'http://localhost:5002/api';

// Define interface for API responses
interface PhoneCheckResponse {
  exists: boolean;
  username?: string;
}

interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    [key: string]: any;
  };
  token: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const tagline = "Hire so you don't have to fire";
  
  // Auth flow state
  const [step, setStep] = useState<'phone' | 'login'>('phone');
  
  // User data
  const [phone, setPhone] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  // First step: Validate phone/email
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Basic validation for phone number or email
    if (!/^\d{10}$/.test(phone) && !/\S+@\S+\.\S+/.test(phone)) {
      setError('Please enter a valid 10-digit phone number or email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if the phone/email exists in the database
      const response = await axios.post<{exists: boolean}>(`${API_URL}/check-duplicate`, {
        field: phone.includes('@') ? 'email' : 'phone',
        value: phone
      });
      
      if (!response.data.exists) {
        setError('No account found with this phone number or email. Please register first.');
        setIsLoading(false);
        return;
      }
      
      // Set the login value based on phone input
      setLogin(phone);
      setSuccess('Account found! Please enter your password.');
      
      // Move to login step
      setStep('login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error verifying account. Please try again.');
      console.error('Account verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!login || !password) {
      setError('Please enter both login credentials and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, { 
        login, 
        password 
      });
      
      setSuccess('Login successful! Redirecting...');
      
      // Store user data and token
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to phone entry
  const handleBack = () => {
    setStep('phone');
    setError(null);
    setSuccess(null);
  };

  // Handle loading complete callback
  const handleLoadingComplete = () => {
    setIsInitialLoading(false);
  };

  return (
    <>
      {isInitialLoading && (
        <LoadingScreen 
          minLoadingTime={2500}
          onLoadingComplete={handleLoadingComplete}
        />
      )}
      
      <AnimatePresence mode="wait">
        {!isInitialLoading && (
          <motion.div 
            className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-dark-900 to-dark-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="flex flex-col md:flex-row md:h-[600px] items-center justify-center max-w-6xl w-full mx-auto shadow-2xl rounded-2xl overflow-hidden"
              initial="closed"
              animate="open"
              variants={{
                closed: { opacity: 0 },
                open: { 
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.3,
                    delayChildren: 0.2
                  }
                }
              }}
            >
              {/* Left section (dark blue background with logo) */}
              <motion.div 
                className="bg-dark-900 text-white w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center relative overflow-hidden h-full"
                variants={{
                  closed: { 
                    x: "-100%", 
                    opacity: 0,
                    scale: 0.9
                  },
                  open: { 
                    x: 0, 
                    opacity: 1,
                    scale: 1,
                    transition: { 
                      type: "spring",
                      damping: 25,
                      stiffness: 120,
                      duration: 0.8
                    }
                  }
                }}
              >
                {/* Background gradient effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-dark-900 z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
                
                {/* Decorative circles */}
                <motion.div 
                  className="absolute top-0 left-0 w-64 h-64 bg-primary-800/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.8, 
                    duration: 1.2,
                    ease: "easeOut"
                  }}
                />
                <motion.div 
                  className="absolute bottom-0 right-0 w-80 h-80 bg-primary-700/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 1, 
                    duration: 1.2,
                    ease: "easeOut"
                  }}
                />
                
                <motion.div 
                  className="relative z-10 text-center max-w-lg -mt-24"
                  variants={{
                    closed: { y: 40, opacity: 0 },
                    open: { 
                      y: 0, 
                      opacity: 1,
                      transition: { 
                        delay: 0.6, 
                        duration: 0.8,
                        ease: "easeOut" 
                      }
                    }
                  }}
                >
                  <motion.div 
                    className="w-44 h-44 mx-auto mb-6 flex items-center justify-center"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.7, 
                      duration: 0.8,
                      ease: "easeOut" 
                    }}
                  >
                    <Link to="/">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
                        <path fill="#6366f1" d="M96.49649 103.5349C94.317464 107.44894 91.53465299999999 111.0252 89.873611 115.21530999999999C83.058902 132.40616999999997 107.41146 134.95591 105.2919 119.70778999999999C104.94348 117.20169999999999 103.9493 114.75995999999999 102.80172999999999 112.51981999999998C101.13350999999999 109.26313999999998 99.01830999999999 106.16811999999999 96.49649 103.53489999999998zM80.323623 125.99722C81.86939699999999 132.11212 85.242888 135.49681 91.105535 137.67763C89.578384 131.63986 86.088058 128.21289 80.323623 125.99722zM113.56787 126.89572C107.94275 127.98485 104.51737 131.37192 102.78594 136.77917C108.41099 135.6901 111.83646 132.3029 113.56787 126.89572zM75.641606 134.22405C69.29319699999999 134.19395 63.048271 139.29384000000002 57.86127499999999 142.17011L57.86127499999999 143.96713C63.76212099999999 147.23922 72.10509099999999 154.23748 79.339125 151.24981C86.731915 148.19654 85.448319 135.84450999999999 77.61409499999999 134.4048C76.95621799999999 134.28381 76.29835399999999 134.227 75.641606 134.22399zM118.2481 134.22405C117.59137999999999 134.22705 116.93348999999999 134.28385 116.27564 134.40487000000002C108.44140999999999 135.84458 107.15778 148.19661000000002 114.55060999999999 151.24988000000002C121.78464 154.23755000000003 130.12932999999998 147.23929 136.03019 143.96720000000002L136.03019 142.17017C130.84318000000002 139.2939 124.59656000000001 134.19508000000002 118.24810000000001 134.22412000000003zM96.98962 138.47963000000001C96.84089 138.47893000000002 96.68871 138.48663000000002 96.53158 138.49973000000003C91.580782 138.96534000000003 92.501964 146.77359000000004 97.35814 146.24220000000003C102.02469 145.73147000000003 101.59626 138.49986 96.98962 138.47870000000003zM102.78594 148.45958000000002C104.33171999999999 154.57441000000003 107.70521 157.95917000000003 113.56787 160.13998C112.02022 154.02097 108.4701 150.91422 102.78594 148.45958000000002zM91.105535 149.35807000000003C85.480535 150.44711000000004 82.055002 153.83427000000003 80.323623 159.24149000000003C85.948626 158.15238000000002 89.374156 154.76529000000002 91.105535 149.35807000000003zM97.59152 156.34593000000004C91.963654 156.27303000000003 85.976059 161.43079000000003 89.738491 170.92193000000003C91.39711299999999 175.10612000000003 94.318484 178.69027000000003 96.49649 182.60234000000003C99.02655999999999 179.96076000000002 101.13319999999999 176.84656000000004 102.87369 173.61738000000003C104.08700999999999 171.36601000000002 105.00744999999999 168.98146000000003 105.31295 166.42945000000003C106.12769 159.62327000000002 101.96875 156.40255000000002 97.59152 156.34593000000004z" />
                      </svg>
                    </Link>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold mb-2 text-white"
                  >
                    First Reference
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="text-lg text-gray-200"
                  >
                    Secure document verification with blockchain
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="mt-2 text-gray-300 text-lg"
                  >
                    Transform your document verification process with our secure, blockchain-based solution.
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                  >
                    {/* Temporarily disabled Organization Login
                    <Link to="/register/organization">
                      <button className="mt-6 bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-lg inline-flex items-center transition-all shadow-lg">
                        <span>Organization Login</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m-7-7H3" />
                        </svg>
                      </button>
                    </Link>
                    */}
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Right section (Authentication) */}
              <motion.div 
                className="w-full md:w-1/2 bg-dark-800 p-8 md:p-12 flex items-center justify-center rounded-r-2xl h-full"
                variants={{
                  closed: { 
                    x: "100%", 
                    opacity: 0,
                    scale: 0.9
                  },
                  open: { 
                    x: 0, 
                    opacity: 1,
                    scale: 1,
                    transition: { 
                      type: "spring",
                      damping: 25,
                      stiffness: 120,
                      duration: 0.8,
                      delay: 0.3
                    }
                  }
                }}
              >
                <div className="w-full max-w-md">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="w-full"
                  >
                    {/* Step 1: Phone number or email */}
                    {step === 'phone' && (
                      <>
                        <h2 className="text-3xl font-bold text-primary-500 mb-2 text-center md:text-left">Welcome Back</h2>
                        <p className="text-gray-300 mb-6 text-center md:text-left">Enter your phone number or email to begin</p>
                        
                        {error && (
                          <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
                            <p>{error}</p>
                          </div>
                        )}
                        
                        <form onSubmit={handlePhoneSubmit}>
                          <div className="mb-4">
                            <label htmlFor="phone" className="block text-gray-300 text-sm mb-2">
                              Phone Number or Email
                            </label>
                            <input
                              type="text"
                              id="phone"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your phone or email"
                              required
                            />
                          </div>
                          
                          <button
                            type="submit"
                            className={`w-full py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Checking...' : 'Continue'}
                          </button>
                        </form>
                        
                        <div className="mt-8 text-center">
                          <p className="text-gray-400 mb-1">Don't have an account?</p>
                          <Link 
                            to="/register"
                            className="w-full py-3 rounded-lg text-primary-500 font-medium hover:text-primary-400 transition-all duration-300 block"
                          >
                            Register Now
                          </Link>
                        </div>
                      </>
                    )}
                    
                    {/* Step 2: Login with password */}
                    {step === 'login' && (
                      <>
                        <h2 className="text-3xl font-bold text-primary-500 mb-2 text-center md:text-left">Sign In</h2>
                        <p className="text-gray-300 mb-6 text-center md:text-left">Enter your password to continue</p>
                        
                        {error && (
                          <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
                            {error}
                          </div>
                        )}
                        
                        {success && (
                          <div className="bg-green-900/30 border border-green-800 text-green-400 p-4 rounded-lg mb-6">
                            {success}
                          </div>
                        )}
                        
                        <form onSubmit={handlePasswordLogin}>
                          <div className="mb-2">
                            <p className="text-gray-400 text-sm mb-4">
                              Signing in with: <span className="text-white font-medium">{login}</span>
                            </p>
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-300 text-sm mb-2">
                              Password
                            </label>
                            <input
                              type="password"
                              id="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter your password"
                              required
                              autoFocus
                            />
                          </div>
                          
                          <button
                            type="submit"
                            className={`w-full py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                          </button>
                        </form>
                        
                        <div className="mt-6 flex items-center">
                          <button
                            onClick={handleBack}
                            className="text-gray-400 hover:text-white flex items-center transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoginPage; 