import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet } from '../../config/contractConfig';

interface MetaMaskConnectProps {
  onConnect?: (address: string) => void;
}

const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({ onConnect }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainInfo, setChainInfo] = useState<{id: number, name: string} | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum !== undefined;

  // Get chain name from chain ID
  const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      656476: 'EDU Chain Testnet'
    };
    return chains[chainId] || `Chain ID: ${chainId}`;
  };

  // Connect to MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Use the connectWallet function from contractConfig
      const signer = await connectWallet();
      const address = await signer.getAddress();
      const chainId = await signer.getChainId();
      
      setAccount(address);
      setChainInfo({
        id: chainId,
        name: getChainName(chainId)
      });
      
      // Call onConnect callback if provided
      if (onConnect) onConnect(address);
      
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (isMetaMaskInstalled) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User has disconnected all accounts
          setAccount(null);
        } else if (accounts[0] !== account) {
          // User has switched accounts
          setAccount(accounts[0]);
          if (onConnect) onConnect(accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        setChainInfo({
          id: chainId,
          name: getChainName(chainId)
        });
        
        // Reload the page when chain changes, as recommended by MetaMask
        window.location.reload();
      };

      // Subscribe to account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            if (onConnect) onConnect(accounts[0]);
            
            // Get current chain
            window.ethereum.request({ method: 'eth_chainId' })
              .then((chainIdHex: string) => {
                const chainId = parseInt(chainIdHex, 16);
                setChainInfo({
                  id: chainId,
                  name: getChainName(chainId)
                });
              });
          }
        })
        .catch(console.error);

      // Cleanup
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, onConnect, isMetaMaskInstalled]);

  // Switch to EDU Chain
  const switchToEduChain = async () => {
    if (!isMetaMaskInstalled) return;
    
    const EDU_CHAIN_ID = '0xA032C'; // 656476 in hex
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EDU_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: EDU_CHAIN_ID,
              chainName: 'EDU Chain Testnet',
              nativeCurrency: {
                name: 'EDU',
                symbol: 'EDU',
                decimals: 18
              },
              rpcUrls: ['https://rpc.open-campus-codex.gelato.digital'],
              blockExplorerUrls: ['https://explorer.open-campus-codex.gelato.digital']
            }]
          });
        } catch (addError) {
          console.error('Error adding EDU Chain:', addError);
          setError('Failed to add EDU Chain to MetaMask');
        }
      } else {
        console.error('Error switching to EDU Chain:', switchError);
        setError('Failed to switch to EDU Chain');
      }
    }
  };

  return (
    <div className="bg-dark-700 p-4 rounded-lg border border-dark-600">
      <h3 className="text-lg font-semibold mb-3">Blockchain Connection</h3>
      
      {!account ? (
        <button
          onClick={connect}
          disabled={isConnecting || !isMetaMaskInstalled}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
            isConnecting || !isMetaMaskInstalled
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.9582 1L19.8241 10.7183L22.2665 5.09989L32.9582 1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.04184 1L15.0582 10.8031L12.7336 5.09989L2.04184 1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28.2031 23.5L24.7422 28.8797L32.1455 30.8948L34.2791 23.6342L28.2031 23.5Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0.731689 23.6342L2.85287 30.8948L10.2563 28.8797L6.79533 23.5L0.731689 23.6342Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.86772 14.7566L7.77661 17.8891L15.1293 18.2078L14.879 10.1436L9.86772 14.7566Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M25.1319 14.7566L20.0361 10.0589L19.8242 18.2078L27.1675 17.8891L25.1319 14.7566Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.2563 28.8797L14.6672 26.7164L10.8829 23.6766L10.2563 28.8797Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.332 26.7164L24.7428 28.8797L24.1068 23.6766L20.332 26.7164Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Connect MetaMask
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Connected:</span>
            <span className="font-mono text-sm bg-dark-600 px-2 py-1 rounded">
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Network:</span>
            <div className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                chainInfo?.id === 656476 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
              <span>{chainInfo?.name || 'Unknown'}</span>
            </div>
          </div>
          
          {chainInfo?.id !== 656476 && (
            <button
              onClick={switchToEduChain}
              className="w-full mt-2 py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Switch to EDU Chain
            </button>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-3 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {!isMetaMaskInstalled && (
        <div className="mt-3">
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Install MetaMask
          </a>
        </div>
      )}
    </div>
  );
};

export default MetaMaskConnect; 