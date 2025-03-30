const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load contract deployment information
let contractDeployment;
try {
  const deploymentPath = path.resolve(__dirname, '../../contract-deployment.json');
  contractDeployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log('Loaded contract information from deployment file');
} catch (error) {
  console.warn('Could not load contract deployment file, using default values:', error.message);
  contractDeployment = {
    address: process.env.BGV_CONTRACT_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    network: {
      rpcUrl: "https://rpc.open-campus-codex.gelato.digital",
      chainId: 656476,
      blockExplorer: "https://explorer.open-campus-codex.gelato.digital"
    },
    abi: [
      "function owner() view returns (address)",
      "function getReport(string reportId) view returns (bytes32 reportHash, uint256 timestamp, address verifier)",
      "function verifyReportHash(string reportId, bytes32 hashToVerify) view returns (bool)",
      "function getReportCount() view returns (uint256)",
      "function reportIds(uint256 index) view returns (string)",
      "function addReport(string reportId, bytes32 reportHash)",
      "function updateReport(string reportId, bytes32 newReportHash)",
      "function transferOwnership(address newOwner)"
    ]
  };
}

// BGVReportStorage contract ABI from deployment or fallback
const BGV_CONTRACT_ABI = contractDeployment.abi;

// Get configuration from environment variables or deployment
const CONTRACT_ADDRESS = process.env.BGV_CONTRACT_ADDRESS || contractDeployment.address;
const INFURA_KEY = process.env.INFURA_KEY || "c59b683e38bf48f3b91c89878a5e6901";
const NETWORK = process.env.ETHEREUM_NETWORK || "eduChain"; // Default network
const PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY; // For signed transactions

// Network configurations
const NETWORK_CONFIGS = {
  sepolia: {
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
    chainId: 11155111
  },
  mainnet: {
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    chainId: 1
  },
  eduChain: contractDeployment.network
};

// Get RPC URL based on network
const getRpcUrl = (network) => {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Network ${network} not configured`);
  }
  return config.rpcUrl;
};

// Get read-only provider
const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(getRpcUrl(NETWORK));
};

// Get contract instance for read operations
const getContract = () => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, BGV_CONTRACT_ABI, provider);
};

// Get contract instance with wallet for write operations
const getSignedContract = () => {
  if (!PRIVATE_KEY) {
    throw new Error('Private key not configured. Set ETHEREUM_PRIVATE_KEY in environment variables.');
  }
  
  const provider = getProvider();
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, BGV_CONTRACT_ABI, wallet);
};

// Helper functions for working with the contract
const addReport = async (reportId, reportHash) => {
  try {
    console.log(`Adding report ${reportId} with hash ${reportHash} to blockchain...`);
    const contract = getSignedContract();
    const tx = await contract.addReport(reportId, reportHash);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Report added to blockchain. Block number: ${receipt.blockNumber}`);
    return receipt;
  } catch (error) {
    console.error('Error adding report to blockchain:', error);
    throw error;
  }
};

const updateReport = async (reportId, newReportHash) => {
  try {
    console.log(`Updating report ${reportId} with new hash ${newReportHash}...`);
    const contract = getSignedContract();
    const tx = await contract.updateReport(reportId, newReportHash);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Report updated on blockchain. Block number: ${receipt.blockNumber}`);
    return receipt;
  } catch (error) {
    console.error('Error updating report on blockchain:', error);
    throw error;
  }
};

const verifyReport = async (reportId, hashToVerify) => {
  try {
    console.log(`Verifying report ${reportId} with hash ${hashToVerify}...`);
    const contract = getContract();
    const result = await contract.verifyReportHash(reportId, hashToVerify);
    console.log(`Verification result: ${result}`);
    return result;
  } catch (error) {
    console.error('Error verifying report hash:', error);
    throw error;
  }
};

const getReport = async (reportId) => {
  try {
    console.log(`Getting report details for ${reportId}...`);
    const contract = getContract();
    const [reportHash, timestamp, verifier] = await contract.getReport(reportId);
    console.log(`Report found. Hash: ${reportHash}, Timestamp: ${timestamp}, Verifier: ${verifier}`);
    return {
      reportId,
      reportHash,
      timestamp: timestamp.toNumber(),
      verifier,
      blockchainVerified: true
    };
  } catch (error) {
    console.error('Error getting report from blockchain:', error);
    throw error;
  }
};

// Convert string to bytes32 hash
const stringToBytes32 = (str) => {
  return ethers.utils.id(str);
};

// Create bytes32 hash from file buffer
const fileToBytes32 = (fileBuffer) => {
  return ethers.utils.hexlify(
    ethers.utils.arrayify(
      ethers.utils.keccak256(fileBuffer)
    )
  );
};

module.exports = {
  getProvider,
  getContract,
  getSignedContract,
  addReport,
  updateReport,
  verifyReport,
  getReport,
  stringToBytes32,
  fileToBytes32,
  BGV_CONTRACT_ABI,
  CONTRACT_ADDRESS,
  NETWORK,
  NETWORK_CONFIGS,
  contractDeployment
}; 