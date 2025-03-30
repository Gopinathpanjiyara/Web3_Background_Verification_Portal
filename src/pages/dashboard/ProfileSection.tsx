import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

// API URL
const API_URL = 'http://localhost:5001/api';

// User interface definition
interface User {
  id: string;
  username: string; 
  name: string;
  phone?: string;
  email?: string;
  userType?: string;
  dob?: string;
}

// Wallet interface
interface WalletInfo {
  address: string;
  balance: string;
  chainId: string;
  network: string;
  connected: boolean;
}

interface ProfileSectionProps {
  user: User | null;
  loadingSection: string | null;
  setLoadingSection: (section: string | null) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  user, 
  loadingSection, 
  setLoadingSection 
}) => {
  // Form states for editable fields
  const [editableProfile, setEditableProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  
  // MetaMask wallet states
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // MetaMask connection functions
  const connectWallet = async () => {
    setIsConnectingWallet(true);
    setWalletError(null);
    
    try {
      const provider = await detectEthereumProvider();
      
      if (!provider) {
        throw new Error('MetaMask not installed. Please install MetaMask and try again.');
      }
      
      // Request account access
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.');
      }
      
      const address = accounts[0];
      
      // Use Infura API for ethers provider
      const ethersProvider = new ethers.providers.JsonRpcProvider(
        "https://mainnet.infura.io/v3/c59b683e38bf48f3b91c89878a5e6901"
      );
      
      const network = await ethersProvider.getNetwork();
      const balance = await ethersProvider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);
      
      // Set wallet info
      setWalletInfo({
        address,
        balance: formattedBalance,
        chainId: network.chainId.toString(),
        network: network.name !== 'unknown' ? network.name : `Chain ID: ${network.chainId}`,
        connected: true
      });
      
      // Setup event listeners for account and chain changes
      setupWalletEventListeners();
      
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setWalletError(error instanceof Error ? error.message : 'Error connecting to MetaMask');
    } finally {
      setIsConnectingWallet(false);
    }
  };
  
  const disconnectWallet = () => {
    setWalletInfo(null);
    removeWalletEventListeners();
  };
  
  const setupWalletEventListeners = () => {
    const ethereum = (window as any).ethereum;
    
    if (ethereum) {
      // Account change event
      ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Chain/network change event
      ethereum.on('chainChanged', handleChainChanged);
    }
  };
  
  const removeWalletEventListeners = () => {
    const ethereum = (window as any).ethereum;
    
    if (ethereum) {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
  
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // Update with new account
      await updateWalletInfo(accounts[0]);
    }
  };
  
  const handleChainChanged = async () => {
    // On chain change, refresh provider and wallet info
    if (walletInfo && walletInfo.address) {
      await updateWalletInfo(walletInfo.address);
    }
  };
  
  const updateWalletInfo = async (address: string) => {
    try {
      const ethersProvider = new ethers.providers.JsonRpcProvider(
        "https://mainnet.infura.io/v3/c59b683e38bf48f3b91c89878a5e6901"
      );
      
      const network = await ethersProvider.getNetwork();
      const balance = await ethersProvider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);
      
      setWalletInfo({
        address,
        balance: formattedBalance,
        chainId: network.chainId.toString(),
        network: network.name !== 'unknown' ? network.name : `Chain ID: ${network.chainId}`,
        connected: true
      });
    } catch (error) {
      console.error('Error updating wallet info:', error);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setIsEditing(false);
    setLoadingSection('profile');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.put(`${API_URL}/user`, editableProfile);
      
      // Update local user data
      /* This would normally update the user in the parent component
      setUser({
        ...user,
        name: editableProfile.name,
        email: editableProfile.email,
        phone: editableProfile.phone
      });
      */
      
      // Show success message
      setProfileUpdateSuccess(true);
      setTimeout(() => {
        setProfileUpdateSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoadingSection(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-700 rounded-xl p-6 shadow-xl"
    >
      <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
      
      {loadingSection === 'profile' ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-dark-600/70 backdrop-blur-sm p-6 rounded-xl">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-400 mb-2">Full Name</label>
                    <input 
                      id="name"
                      type="text" 
                      value={editableProfile.name}
                      onChange={(e) => setEditableProfile({ ...editableProfile, name: e.target.value })}
                      className="w-full p-3 bg-dark-700 border border-dark-400 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-400 mb-2">Email Address</label>
                    <input 
                      id="email"
                      type="email" 
                      value={editableProfile.email}
                      onChange={(e) => setEditableProfile({ ...editableProfile, email: e.target.value })}
                      className="w-full p-3 bg-dark-700 border border-dark-400 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-gray-400 mb-2">Phone Number</label>
                    <input 
                      id="phone"
                      type="tel" 
                      value={editableProfile.phone}
                      onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })}
                      className="w-full p-3 bg-dark-700 border border-dark-400 rounded-lg focus:outline-none focus:border-primary-500 text-white"
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProfileUpdate}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      Save Changes
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h3 className="text-xl font-bold">Personal Details</h3>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-lg transition-colors mt-2 md:mt-0 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Profile
                    </motion.button>
                  </div>
                  
                  {profileUpdateSuccess && (
                    <div className="bg-green-900/30 border border-green-800 text-green-400 p-3 rounded-lg mb-4">
                      Profile updated successfully!
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex border-b border-dark-400 pb-3">
                      <div className="w-1/3">
                        <p className="font-medium text-gray-400">Full Name</p>
                      </div>
                      <div className="w-2/3">
                        <p className="text-white">{user?.name || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex border-b border-dark-400 pb-3">
                      <div className="w-1/3">
                        <p className="font-medium text-gray-400">Email</p>
                      </div>
                      <div className="w-2/3">
                        <p className="text-white">{user?.email || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex border-b border-dark-400 pb-3">
                      <div className="w-1/3">
                        <p className="font-medium text-gray-400">Phone</p>
                      </div>
                      <div className="w-2/3">
                        <p className="text-white">{user?.phone || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/3">
                        <p className="font-medium text-gray-400">Account Type</p>
                      </div>
                      <div className="w-2/3">
                        <p className="text-white capitalize">{user?.userType || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-dark-600/70 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6">Blockchain Wallet</h3>
            
            <div className="mb-4">
              {!walletInfo?.connected && (
                <div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={connectWallet}
                    disabled={isConnectingWallet}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-lg shadow-primary-900/20"
                  >
                    {isConnectingWallet ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Connect MetaMask
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
            
            {walletError && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded-xl mb-6 flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{walletError}</span>
              </div>
            )}
            
            {walletInfo && walletInfo.connected && (
              <div className="space-y-4">
                <div className="flex border-b border-dark-400 pb-4">
                  <div className="w-1/3">
                    <p className="font-medium text-gray-400">Wallet Address</p>
                  </div>
                  <div className="w-2/3 flex items-center">
                    <p className="text-white font-mono text-sm">
                      {walletInfo.address.substring(0, 6)}...{walletInfo.address.substring(walletInfo.address.length - 4)}
                    </p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(walletInfo.address)}
                      className="ml-2 text-primary-400 hover:text-primary-300 transition-colors"
                      title="Copy address"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    <a 
                      href={`https://${walletInfo.network === 'homestead' ? '' : walletInfo.network + '.'}etherscan.io/address/${walletInfo.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary-400 hover:text-primary-300 transition-colors"
                      title="View on Etherscan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="flex border-b border-dark-400 pb-4">
                  <div className="w-1/3">
                    <p className="font-medium text-gray-400">Balance</p>
                  </div>
                  <div className="w-2/3">
                    <p className="text-white">{parseFloat(walletInfo.balance).toFixed(4)} ETH</p>
                  </div>
                </div>
                <div className="flex border-b border-dark-400 pb-4">
                  <div className="w-1/3">
                    <p className="font-medium text-gray-400">Network</p>
                  </div>
                  <div className="w-2/3">
                    <p className="text-white capitalize">{walletInfo.network}</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3">
                    <p className="font-medium text-gray-400">Status</p>
                  </div>
                  <div className="w-2/3 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <p className="text-white">Connected</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-dark-500 hover:bg-dark-400 text-white rounded-lg transition-colors text-sm"
                  >
                    Disconnect Wallet
                  </motion.button>
                </div>
              </div>
            )}
            
            {!walletInfo && !isConnectingWallet && !walletError && (
              <div className="bg-dark-700/50 p-5 rounded-lg border border-dark-600">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                    alt="MetaMask" 
                    className="w-8 h-8 mr-3" 
                  />
                  <h4 className="text-lg font-medium">MetaMask Wallet</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Connect your MetaMask wallet to interact with blockchain services, NFT certificates, and decentralized verification.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-dark-600 text-xs text-gray-300 px-2 py-1 rounded-full">NFT Certificates</span>
                  <span className="bg-dark-600 text-xs text-gray-300 px-2 py-1 rounded-full">Document Verification</span>
                  <span className="bg-dark-600 text-xs text-gray-300 px-2 py-1 rounded-full">Blockchain Proofs</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileSection; 