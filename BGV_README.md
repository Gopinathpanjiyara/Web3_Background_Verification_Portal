# BGV Document Verification Platform

A platform for background verification (BGV) of documents using blockchain technology on EDU Chain.

## Features

- Store document verification hashes on the EDU Chain blockchain
- Verify document authenticity using blockchain verification
- Dashboard for managing verification reports
- User authentication and authorization
- API endpoints for integrating with other systems

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, ethers.js
- **Backend**: Node.js, Express, MongoDB
- **Blockchain**: Solidity smart contract on EDU Chain

## Prerequisites

- Node.js (v14 or later)
- MongoDB
- MetaMask wallet with EDU Chain configured
- EDU Chain testnet tokens for contract deployment and transactions

## Setup Instructions

### Setting up EDU Chain with MetaMask

1. Install MetaMask extension in your browser
2. Open MetaMask and add EDU Chain network with the following details:
   - Network Name: EDU Chain Testnet
   - RPC URL: https://rpc.open-campus-codex.gelato.digital
   - Chain ID: 656476
   - Currency Symbol: EDU
   - Block Explorer URL: https://explorer.open-campus-codex.gelato.digital

### Installation & Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd bgv-platform
   ```

2. Install dependencies
   ```
   npm install
   cd server && npm install
   cd ..
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Configure your MongoDB connection string
   - Add your EDU Chain private key (for contract deployment and transactions)

4. Deploy the smart contract (optional - already deployed)
   ```
   node deploy-contract.js
   ```
   This will compile and deploy the BGVReportStorage contract to EDU Chain and save deployment info.

5. Start the development server
   ```
   # Start the backend server
   cd server && npm run dev
   
   # In a new terminal, start the frontend
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## Smart Contract Deployment

The BGVReportStorage smart contract has already been deployed to EDU Chain testnet at address:
`0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

See `src/docs/ContractUsage.md` for details on interacting with the contract.

## API Documentation

### Auth Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and receive JWT token

### BGV Endpoints

- `POST /api/bgv/report` - Add a new BGV report to blockchain
- `GET /api/bgv/report/:reportId` - Get BGV report details
- `PUT /api/bgv/report/:reportId` - Update a BGV report
- `POST /api/bgv/verify` - Verify a document against blockchain

For detailed API documentation, see the [Contract Usage Guide](src/docs/ContractUsage.md).

## License

MIT 