# BGV Smart Contract Usage Guide

This guide explains how to use the BGVReportStorage smart contract for document verification.

## Contract Deployment

The contract has been deployed to EDU Chain testnet at address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

## Basic Interaction

### 1. Connect to the Contract in Your Web Application

The contract is already configured in this application, but here's how to connect to it in any application:

```javascript
// Import ethers.js
const { ethers } = require("ethers");

// Contract details
const contractAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const contractABI = [
  "function addReport(string reportId, bytes32 reportHash) public",
  "function getReport(string reportId) public view returns (bytes32 reportHash, uint256 timestamp, address verifier)",
  "function verifyReportHash(string reportId, bytes32 hashToVerify) public view returns (bool)"
];

// Connect to Edu Chain
const provider = new ethers.providers.JsonRpcProvider("https://rpc.open-campus-codex.gelato.digital");

// For read-only operations
const bgvContract = new ethers.Contract(contractAddress, contractABI, provider);

// For transactions that require signing
const privateKey = "YOUR_PRIVATE_KEY"; // Never hardcode in production
const signer = new ethers.Wallet(privateKey, provider);
const bgvContractWithSigner = bgvContract.connect(signer);
```

### 2. Add a New BGV Report Hash

When you've completed a background verification report:

```javascript
async function addNewReport(reportId, reportData) {
  try {
    // Convert report data to hash
    const reportHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(reportData))
    );
    
    // Send transaction to blockchain
    const tx = await bgvContractWithSigner.addReport(reportId, reportHash);
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    console.log(`Report ${reportId} added successfully!`);
    return tx.hash; // Transaction hash as proof
  } catch (error) {
    console.error("Error adding report:", error);
  }
}
```

### 3. Retrieve a BGV Report Hash

When someone needs to verify a report:

```javascript
async function getReportDetails(reportId) {
  try {
    const [reportHash, timestamp, verifier] = await bgvContract.getReport(reportId);
    
    // Convert timestamp to readable date
    const date = new Date(timestamp * 1000);
    
    return {
      reportHash,
      timestamp: date.toLocaleString(),
      verifier
    };
  } catch (error) {
    console.error("Error retrieving report:", error);
  }
}
```

### 4. Verify a BGV Report

When employers or others need to verify if a report is authentic:

```javascript
async function verifyReport(reportId, reportData) {
  try {
    // Generate hash from the report data to verify
    const hashToVerify = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(reportData))
    );
    
    // Check if it matches the hash on blockchain
    const isValid = await bgvContract.verifyReportHash(reportId, hashToVerify);
    
    return isValid;
  } catch (error) {
    console.error("Error verifying report:", error);
    return false;
  }
}
```

## Using with MetaMask

For client-side applications, you can connect to MetaMask wallet:

```javascript
async function connectWithMetaMask() {
  // Check if MetaMask is installed
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create Web3Provider using MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Get the connected chain ID
      const chainId = await signer.getChainId();
      
      // Check if connected to EDU Chain (656476)
      if (chainId !== 656476) {
        // Request network switch to EDU Chain
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xA032C' }], // 656476 in hex
          });
        } catch (switchError) {
          // If EDU Chain is not added to MetaMask, prompt to add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xA032C', // 656476 in hex
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
          } else {
            throw switchError;
          }
        }
      }
      
      // Create contract instance with signer
      const bgvContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      return { provider, signer, bgvContract };
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw error;
    }
  } else {
    alert('Please install MetaMask to use this application');
    throw new Error('MetaMask not installed');
  }
}
```

## API Integration

This application provides the following API endpoints for interacting with the BGV contract:

### Submit a new report
```
POST /api/bgv/report
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

Form fields:
- reportId: Unique identifier for the report
- reportFile: File to hash and store on blockchain
- metadata: Optional JSON string with additional data
```

### Verify a document
```
POST /api/bgv/verify
Content-Type: multipart/form-data

Form fields:
- reportId: ID of the report to verify against
- documentFile: File to verify
```

### Get report details
```
GET /api/bgv/report/:reportId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update a report
```
PUT /api/bgv/report/:reportId
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

Form fields:
- reportFile: Updated file to hash and store on blockchain
```

## Complete Workflow for Document Verification

1. **Creating Reports:**
   - BGV agency completes verification
   - System generates a unique reportId
   - Full report saved to database
   - Hash stored on blockchain through `addReport` function
   - Link between database record and blockchain hash maintained

2. **Sharing Reports:**
   - Generate a shareable link or PDF with reportId
   - Include QR code linking to verification page
   - Optional: Include digital signature

3. **Verifying Reports:**
   - Recipient visits verification page with reportId
   - System fetches report from database
   - System checks blockchain for matching hash using `verifyReportHash`
   - Shows verification status with blockchain proof

## Block Explorer

You can view the contract and transactions on the EDU Chain Block Explorer:
- Contract: [https://explorer.open-campus-codex.gelato.digital/address/0x742d35Cc6634C0532925a3b844Bc454e4438f44e](https://explorer.open-campus-codex.gelato.digital/address/0x742d35Cc6634C0532925a3b844Bc454e4438f44e)
- Block Explorer: [https://explorer.open-campus-codex.gelato.digital/](https://explorer.open-campus-codex.gelato.digital/) 