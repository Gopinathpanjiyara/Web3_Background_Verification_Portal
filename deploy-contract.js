const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config();

// Compile Contract
async function compileContract() {
  // Read the Solidity contract file
  const contractPath = path.resolve(__dirname, 'src/contracts/BGVReportStorage.sol');
  const sourceCode = fs.readFileSync(contractPath, 'utf8');
  
  // Compile the contract using solc
  const input = {
    language: 'Solidity',
    sources: {
      'BGVReportStorage.sol': {
        content: sourceCode,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  // Check for compilation errors
  if (output.errors) {
    output.errors.forEach(error => {
      console.error(error.formattedMessage);
    });
    throw new Error('Contract compilation failed');
  }
  
  const contractOutput = output.contracts['BGVReportStorage.sol']['BGVReportStorage'];
  const bytecode = contractOutput.evm.bytecode.object;
  const abi = contractOutput.abi;
  
  return { bytecode, abi };
}

// Deploy Contract
async function deployContract() {
  try {
    console.log('Compiling contract...');
    const { bytecode, abi } = await compileContract();
    
    console.log('Contract compiled successfully');
    
    // Get private key from environment variable
    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Private key not found in environment variables');
    }
    
    // Connect to EDU Chain
    const providerUrl = 'https://rpc.open-campus-codex.gelato.digital';
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    
    // Create a wallet instance
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Deploying from address: ${wallet.address}`);
    
    // Check wallet balance
    const balance = await wallet.getBalance();
    console.log(`Wallet balance: ${ethers.utils.formatEther(balance)} EDU`);
    
    if (balance.eq(0)) {
      throw new Error('Wallet has no funds to deploy the contract');
    }
    
    // Create contract factory
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // Deploy contract
    console.log('Deploying contract...');
    const contract = await contractFactory.deploy();
    
    // Wait for deployment to finish
    console.log(`Contract deployment transaction hash: ${contract.deployTransaction.hash}`);
    await contract.deployed();
    
    console.log(`Contract deployed successfully at address: ${contract.address}`);
    
    // Save contract information to a file
    const contractInfo = {
      address: contract.address,
      abi: abi,
      deploymentTx: contract.deployTransaction.hash,
      network: {
        name: 'EDU Chain Testnet',
        chainId: 656476,
        rpcUrl: providerUrl,
        blockExplorer: 'https://explorer.open-campus-codex.gelato.digital'
      },
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.resolve(__dirname, 'contract-deployment.json'),
      JSON.stringify(contractInfo, null, 2)
    );
    
    console.log('Contract deployment information saved to contract-deployment.json');
    
    return contractInfo;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

// Execute the deployment
deployContract()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 