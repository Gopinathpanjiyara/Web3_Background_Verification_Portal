# BGV Document Verification Platform

<p align="center">
  <img src="./gitimg/fr_logo.svg" alt="FR Logo" width="200" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./gitimg/educhain.c1cc5141.svg" alt="EDU Chain Logo" width="200" />
</p>

A comprehensive background verification (BGV) platform that leverages blockchain technology to securely store and verify document authenticity. The system provides tamper-proof verification using the EDU Chain blockchain, allowing organizations to verify documents with confidence.

## Project Screenshots

<details>
  <summary>Click to see screenshots</summary>
  
  ### Login Screen
  <img src="./workingss/Screenshot%20(9).png" alt="Login Screen" width="800" />
  
  ### Dashboard
  <img src="./workingss/Screenshot%20(16).png" alt="Dashboard" width="800" />
  
  ### Document Verification
  <img src="./workingss/Screenshot%20(14).png" alt="Document Verification" width="800" />
  
  ### Blockchain Integration
  <img src="./workingss/Screenshot%20(17).png" alt="Blockchain Integration" width="800" />
  
  ### Results Page
  <img src="./workingss/Screenshot%20(18).png" alt="Results Page" width="800" />
  
  ### Document Upload
  <img src="./workingss/Screenshot%20(13).png" alt="Document Upload" width="800" />
  
  ### Mobile View
  <img src="./workingss/Screenshot%20(21).png" alt="Mobile View" width="400" />
</details>

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Authentication
- Secure login and registration system
- Role-based access control (Individual/Organization)
- JWT-based authentication
- Password recovery options

### Document Management
- Upload documents for verification
- Document categorization and tagging
- Document history tracking
- Secure document storage

### Blockchain Verification
- Store document verification hashes on EDU Chain blockchain
- Immutable proof of document authenticity
- Timestamp verification
- Tamper-proof document records

### Dashboard
- User-friendly interface for document management
- Real-time verification status
- Analytics and reporting
- Activity logs

### Verification Process
- Document upload and scanning
- Hash generation and blockchain storage
- QR code generation for verified documents
- Verification status tracking

### API Integration
- RESTful API endpoints for third-party integration
- Webhook support
- Batch verification capabilities
- Custom integration options

## Technology Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- ethers.js for blockchain interaction
- React Router for navigation
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB for database
- JWT for authentication
- Multer for file uploads

### Blockchain
- EDU Chain (Ethereum-compatible)
- Solidity smart contracts
- Web3 integration

## Architecture

The BGV platform follows a modern microservices architecture:

1. **Client Layer**: React frontend application
2. **API Layer**: Express.js RESTful API
3. **Service Layer**: Business logic components
4. **Data Layer**: MongoDB database
5. **Blockchain Layer**: EDU Chain integration

## Prerequisites

Before installing the BGV platform, ensure you have:

- Node.js (v14.0 or later)
- MongoDB (local or Atlas)
- MetaMask wallet or compatible Ethereum wallet
- EDU Chain testnet configured
- Git

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-organization/bgv-platform.git
cd bgv-platform
```

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Configure Environment Variables

1. Create `.env` file in the root directory:

```
# Frontend environment variables
VITE_API_URL=http://localhost:5001/api
VITE_ETHEREUM_NETWORK=eduChain
```

2. Create `.env` file in the server directory:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/bgv_platform
JWT_SECRET=your_secure_jwt_secret
PORT=5001
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key
BGV_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

### Start Development Servers

```bash
# Start backend server
cd server
npm run dev

# In a new terminal, start frontend
npm run dev
```

Access the application at http://localhost:3000

## Configuration

### MetaMask Configuration

1. Install MetaMask browser extension
2. Add EDU Chain to MetaMask with these settings:
   - Network Name: EDU Chain Testnet
   - RPC URL: https://rpc.open-campus-codex.gelato.digital
   - Chain ID: 656476
   - Currency Symbol: EDU
   - Block Explorer URL: https://explorer.open-campus-codex.gelato.digital

### Blockchain Contract Configuration

The BGV platform uses a deployed smart contract on EDU Chain:

- Contract Address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- Contract ABI: Available in `contract-deployment.json`

If you wish to deploy your own contract:

```bash
node deploy-contract.js
```

Update the contract address in your environment variables.

## Usage Guide

### Registration

1. Navigate to the registration page
2. Choose between Individual or Organization registration
3. Fill in required details and create an account
4. Verify your email address (if enabled)

### Document Verification

#### Adding a Document for Verification

1. Log in to your dashboard
2. Click "Add Document"
3. Upload the document file
4. Fill in document metadata
5. Submit for verification
6. The system will generate a unique document ID and store the document hash on the blockchain

#### Verifying a Document

1. Navigate to the verification page
2. Enter the document ID or upload the document
3. The system will verify the document against the blockchain record
4. View verification details including timestamp and verification status

### Organization Dashboard

1. Access advanced verification features
2. Manage verification requests
3. View analytics and reports
4. Manage team access and permissions

## API Documentation

The BGV platform provides comprehensive API endpoints:

### Authentication Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and receive JWT token
- `POST /api/check-phone` - Check if a phone number exists
- `POST /api/register-organization` - Register a new organization

### BGV Endpoints

- `POST /api/bgv/report` - Add a new BGV report to blockchain
- `GET /api/bgv/report/:reportId` - Get BGV report details
- `PUT /api/bgv/report/:reportId` - Update a BGV report
- `POST /api/bgv/verify` - Verify a document against blockchain

### Dashboard Endpoints

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

See the [API Documentation](src/docs/API.md) for detailed endpoint specifications.

## Blockchain Integration

### Smart Contract

The BGV platform uses a custom Solidity smart contract for document verification:

```solidity
// BGVReportStorage.sol (simplified)
contract BGVReportStorage {
    mapping(string => Report) private reports;
    string[] private reportIds;
    
    struct Report {
        bytes32 reportHash;
        uint256 timestamp;
        address verifier;
    }
    
    function addReport(string memory reportId, bytes32 reportHash) public {
        // Store report hash on blockchain
    }
    
    function getReport(string memory reportId) public view returns (bytes32, uint256, address) {
        // Retrieve report details
    }
    
    function verifyReportHash(string memory reportId, bytes32 hashToVerify) public view returns (bool) {
        // Verify document hash against stored hash
    }
}
```

### Integration with Frontend

The frontend integrates with the blockchain using ethers.js:

```typescript
// Example of verifying document on blockchain
const verifyDocument = async (documentId: string, documentHash: string): Promise<boolean> => {
  const provider = getProvider();
  const contract = getContractInstance();
  
  try {
    // Call the verification method on the smart contract
    const isVerified = await contract.verifyReportHash(documentId, documentHash);
    return isVerified;
  } catch (error) {
    console.error("Blockchain verification error:", error);
    return false;
  }
};
```

## Troubleshooting

### Common Issues

#### Blockchain Connection Issues

**Problem**: Unable to connect to EDU Chain
**Solution**: 
- Verify that the RPC URL is correct
- Check if your MetaMask is configured correctly
- Ensure you have EDU Chain tokens for gas fees

#### API Connection Errors

**Problem**: Server connection refused
**Solution**:
- Check if the server is running
- Verify environment variables are set correctly
- Check network connectivity

#### Document Verification Failures

**Problem**: Document verification returns false
**Solution**:
- Verify the document ID is correct
- Ensure the document hasn't been modified
- Check if the document was properly registered on the blockchain

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For detailed documentation about the contract usage, see [Contract Usage Guide](src/docs/ContractUsage.md). 