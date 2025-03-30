const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const bgvContract = require('../config/bgvContract');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 5242880) // 5MB default
  }
});

// Calculate SHA-256 hash from file
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
};

// Convert hex string to bytes32 format
const hexToBytes32 = (hex) => {
  // Ensure the hex string has 0x prefix
  const hexString = hex.startsWith('0x') ? hex : `0x${hex}`;
  
  // Pad hex string to 32 bytes (64 characters after 0x)
  let paddedHex = hexString.slice(2).padStart(64, '0');
  return `0x${paddedHex}`;
};

/**
 * @route   POST /api/bgv/report
 * @desc    Submit new BGV report to blockchain
 * @access  Private
 */
router.post('/report', auth, upload.single('reportFile'), async (req, res) => {
  try {
    const { reportId, metadata } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Report ID is required' 
      });
    }
    
    console.log(`Adding new report ${reportId} to blockchain...`);
    
    // Calculate hash if file is uploaded
    let reportHash;
    if (req.file) {
      // Read file buffer
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Use the contract helper to generate a bytes32 hash
      reportHash = bgvContract.fileToBytes32(fileBuffer);
      console.log(`Generated hash: ${reportHash} for file ${req.file.originalname}`);
    } else if (req.body.reportContent) {
      // Calculate hash from text content
      const hash = crypto.createHash('sha256').update(req.body.reportContent).digest('hex');
      reportHash = hexToBytes32(hash);
      console.log(`Generated hash: ${reportHash} from report content`);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Report file or content is required' 
      });
    }
    
    // Store hash on blockchain
    console.log(`Storing hash ${reportHash} for report ${reportId} on blockchain...`);
    
    try {
      const receipt = await bgvContract.addReport(reportId, reportHash);
      console.log(`Report added to blockchain. Transaction hash: ${receipt.transactionHash}`);
      
      res.status(201).json({
        success: true,
        message: 'Report added to blockchain successfully',
        reportId,
        reportHash,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      });
    } catch (blockchainError) {
      console.error('Error adding report to blockchain:', blockchainError);
      
      // Handle specific errors
      if (blockchainError.message.includes('Report already exists')) {
        return res.status(409).json({ 
          success: false, 
          message: 'Report with this ID already exists on the blockchain',
          error: blockchainError.message
        });
      }
      
      throw blockchainError; // Re-throw for general error handling
    }
    
  } catch (error) {
    console.error('Error submitting BGV report:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit report to blockchain', 
      error: error.message 
    });
  } finally {
    // Clean up uploaded file if exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
  }
});

/**
 * @route   PUT /api/bgv/report/:reportId
 * @desc    Update existing BGV report on blockchain
 * @access  Private
 */
router.put('/report/:reportId', auth, upload.single('reportFile'), async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Calculate hash if file is uploaded
    let reportHash;
    if (req.file) {
      // Calculate SHA-256 hash from file
      const fileHash = await calculateFileHash(req.file.path);
      
      // Convert to bytes32 for blockchain storage
      reportHash = hexToBytes32(fileHash);
    } else if (req.body.reportContent) {
      // Calculate hash from text content
      const hash = crypto.createHash('sha256').update(req.body.reportContent).digest('hex');
      reportHash = hexToBytes32(hash);
    } else {
      return res.status(400).json({ message: 'Report file or content is required' });
    }
    
    // Update hash on blockchain
    const tx = await bgvContract.updateReport(reportId, reportHash);
    
    res.json({
      message: 'Report updated on blockchain successfully',
      reportId,
      transactionHash: tx.transactionHash,
      blockNumber: tx.blockNumber
    });
    
  } catch (error) {
    console.error('Error updating BGV report:', error);
    
    // Handle specific errors
    if (error.message.includes('Report does not exist')) {
      return res.status(404).json({ message: 'Report not found on the blockchain' });
    }
    
    res.status(500).json({ message: 'Failed to update report on blockchain', error: error.message });
  } finally {
    // Clean up uploaded file if exists
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }
  }
});

/**
 * @route   GET /api/bgv/report/:reportId
 * @desc    Get BGV report details from blockchain
 * @access  Private
 */
router.get('/report/:reportId', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Get report from blockchain
    const reportData = await bgvContract.getReport(reportId);
    
    res.json({
      reportId: reportId,
      reportHash: reportData.reportHash,
      timestamp: new Date(reportData.timestamp * 1000).toISOString(),
      verifier: reportData.verifier,
      verified: true
    });
    
  } catch (error) {
    console.error('Error fetching BGV report:', error);
    
    // Handle specific errors
    if (error.message.includes('Report does not exist')) {
      return res.status(404).json({ message: 'Report not found on the blockchain' });
    }
    
    res.status(500).json({ message: 'Failed to fetch report from blockchain', error: error.message });
  }
});

/**
 * @route   POST /api/bgv/verify
 * @desc    Verify a document against blockchain record
 * @access  Public (no auth needed for verification)
 */
router.post('/verify', upload.single('documentFile'), async (req, res) => {
  try {
    const { reportId } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Report ID is required'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Document file is required'
      });
    }
    
    console.log(`Verifying document ${reportId}...`);
    
    // Read the uploaded file
    const fileBuffer = fs.readFileSync(req.file.path);
    
    // Generate a report hash in the same format as when documents are added
    const fileHash = bgvContract.fileToBytes32(fileBuffer);
    console.log(`Generated hash: ${fileHash}`);
    
    // Verify against blockchain
    let isVerified = false;
    let reportDetails;
    
    try {
      // Try to verify the document hash directly on blockchain
      isVerified = await bgvContract.verifyReport(reportId, fileHash);
      console.log(`Blockchain verification result: ${isVerified}`);
      
      if (isVerified) {
        // If verified, get additional details about the report
        const details = await bgvContract.getReport(reportId);
        reportDetails = {
          reportId,
          reportHash: details.reportHash,
          timestamp: details.timestamp,
          verifier: details.verifier
        };
        
        console.log(`Report details retrieved:`, reportDetails);
      } else {
        console.log(`Document verification failed for ${reportId}`);
      }
    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError);
      return res.status(404).json({
        success: false,
        message: 'Report not found on blockchain or verification failed',
        error: blockchainError.message
      });
    }
    
    // Clean up the temporary file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
    
    // Return verification result
    if (isVerified && reportDetails) {
      res.json({
        success: true,
        message: 'Document verified successfully',
        reportId,
        reportHash: reportDetails.reportHash,
        timestamp: new Date(reportDetails.timestamp * 1000).toISOString(),
        verifier: reportDetails.verifier,
        fileHash
      });
    } else {
      res.json({
        success: false,
        message: 'Document verification failed. Hash mismatch or report not found.',
        reportId,
        fileHash
      });
    }
    
  } catch (error) {
    console.error('Error verifying document:', error);
    
    // Clean up the temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying document',
      error: error.message
    });
  }
});

module.exports = router; 