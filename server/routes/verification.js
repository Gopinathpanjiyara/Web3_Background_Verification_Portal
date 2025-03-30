const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { ethers } = require('ethers');
const auth = require('../middleware/auth');

// Mock database for documents (replace with actual DB in production)
const documentStore = [];

// Mock contract ABI - In production, this would be your actual contract's ABI
const contractABI = [
  "function addDocument(string documentId, string documentHash, string metadata) public",
  "function verifyDocument(string documentId, string documentHash) public view returns (bool)",
  "function getDocument(string documentId) public view returns (string, uint256, address, bool, string)"
];

// Contract configuration - would be loaded from environment variables in production
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address
const INFURA_KEY = process.env.INFURA_KEY || "your-infura-key";
const RPC_URL = `https://sepolia.infura.io/v3/${INFURA_KEY}`;

// Connect to Ethereum network (read-only for verification)
const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(RPC_URL);
};

// Get contract instance
const getContract = (provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
};

/**
 * @route   POST /api/verification/document
 * @desc    Verify a document and store it on the blockchain
 * @access  Private
 */
router.post('/document', auth, async (req, res) => {
  try {
    const { documentName, documentHash, documentId, metadata } = req.body;
    
    if (!documentName || !documentHash || !documentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a real implementation, you would have a wallet with private key to sign transactions
    // Here we're just mocking the storage process
    
    // Store document in database
    const document = {
      id: documentId,
      name: documentName,
      hash: documentHash,
      metadata: metadata || '',
      userId: req.user.id,
      timestamp: Date.now(),
      verified: true
    };
    
    documentStore.push(document);
    
    // Mock blockchain confirmation
    return res.status(200).json({
      success: true,
      message: 'Document registered on blockchain',
      document: {
        id: documentId,
        name: documentName,
        timestamp: document.timestamp,
        verified: true
      }
    });
    
  } catch (error) {
    console.error('Error registering document:', error);
    return res.status(500).json({ error: 'Server error processing document registration' });
  }
});

/**
 * @route   GET /api/verification/document/:id
 * @desc    Verify a document against the blockchain
 * @access  Public
 */
router.get('/document/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Find document in database
    const document = documentStore.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Mock blockchain verification
    const verificationResult = {
      isVerified: true,
      documentId: documentId,
      documentHash: document.hash,
      timestamp: document.timestamp,
      issuer: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Mock issuer address
      metadata: document.metadata
    };
    
    return res.status(200).json({
      success: true,
      verification: verificationResult
    });
    
  } catch (error) {
    console.error('Error verifying document:', error);
    return res.status(500).json({ error: 'Server error during document verification' });
  }
});

/**
 * @route   POST /api/verification/check
 * @desc    Check if a document hash matches the blockchain record
 * @access  Public
 */
router.post('/check', async (req, res) => {
  try {
    const { documentId, documentHash } = req.body;
    
    if (!documentId || !documentHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find document in database
    const document = documentStore.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if hash matches
    const isVerified = document.hash === documentHash;
    
    return res.status(200).json({
      success: true,
      isVerified: isVerified,
      documentId: documentId,
      metadata: isVerified ? document.metadata : null
    });
    
  } catch (error) {
    console.error('Error checking document:', error);
    return res.status(500).json({ error: 'Server error during document check' });
  }
});

/**
 * @route   POST /api/verification/hash
 * @desc    Generate a hash for a document
 * @access  Public
 */
router.post('/hash', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Missing document content' });
    }
    
    // Generate hash from content
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    
    return res.status(200).json({
      success: true,
      hash: hash
    });
    
  } catch (error) {
    console.error('Error generating hash:', error);
    return res.status(500).json({ error: 'Server error generating document hash' });
  }
});

module.exports = router; 