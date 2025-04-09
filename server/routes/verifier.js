const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Verifier = require('../models/Verifier');
const verifierAuth = require('../middleware/verifierAuth');

// @route   POST /api/verifier/login
// @desc    Authenticate verifier & get token
// @access  Public
router.post('/verifier/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    
    // Find verifier by username or email
    const verifier = await Verifier.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });
    
    if (!verifier) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if verifier is active
    if (verifier.status !== 'active') {
      return res.status(403).json({ 
        message: 'Your account is inactive or suspended. Please contact your administrator.' 
      });
    }
    
    // Check password
    const isMatch = await verifier.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    verifier.lastLogin = new Date();
    await verifier.save();
    
    // Create token
    const token = jwt.sign(
      { verifierId: verifier._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return verifier data and token
    res.json({
      user: {
        id: verifier._id,
        firstName: verifier.firstName,
        lastName: verifier.lastName,
        name: verifier.name,
        email: verifier.email,
        role: verifier.role,
        permissions: verifier.permissions,
        status: verifier.status
      },
      token
    });
  } catch (error) {
    console.error('Verifier login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/verifier/dashboard
// @desc    Get verifier dashboard data
// @access  Private (verifier only)
router.get('/verifier/dashboard', verifierAuth, async (req, res) => {
  try {
    // Get current verifier
    const verifier = req.verifier;
    
    // Get verification stats (to be implemented with actual data)
    const stats = {
      pending: 12,
      completed: 28,
      rejected: 3,
      totalVerified: verifier.verificationsDone
    };
    
    // Get recent verification requests (to be implemented with actual data)
    const recentRequests = [
      {
        id: 'DOC-2023-001',
        submittedBy: 'John Smith',
        documentType: 'Employment Certificate',
        date: '2023-04-08',
        status: 'pending'
      },
      {
        id: 'DOC-2023-002',
        submittedBy: 'Jane Doe',
        documentType: 'Educational Degree',
        date: '2023-04-07',
        status: 'verified'
      },
      {
        id: 'DOC-2023-003',
        submittedBy: 'Robert Johnson',
        documentType: 'Work Experience',
        date: '2023-04-07',
        status: 'rejected'
      }
    ];
    
    res.json({
      verifier: {
        id: verifier._id,
        name: verifier.name,
        role: verifier.role,
        email: verifier.email,
        verified: verifier.verificationsDone
      },
      stats,
      recentRequests
    });
  } catch (error) {
    console.error('Get verifier dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/verifier/create
// @desc    Create a new verifier (admin only)
// @access  Private (admin only - to be implemented)
router.post('/verifier/create', async (req, res) => {
  try {
    const { 
      username, 
      firstName, 
      lastName, 
      email, 
      password, 
      role = 'verifier', 
      permissions = {} 
    } = req.body;
    
    // Check if verifier with this username or email already exists
    const existingVerifier = await Verifier.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingVerifier) {
      return res.status(400).json({ 
        message: 'A verifier with this username or email already exists' 
      });
    }
    
    // Create new verifier
    const verifier = new Verifier({
      username,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password,
      role,
      permissions: {
        canVerifyDocuments: true,
        canApproveRejections: role === 'supervisor' || role === 'admin',
        canManageVerifiers: role === 'admin',
        ...permissions
      }
    });
    
    await verifier.save();
    
    res.status(201).json({
      success: true,
      verifier: {
        id: verifier._id,
        username: verifier.username,
        name: verifier.name,
        email: verifier.email,
        role: verifier.role
      }
    });
  } catch (error) {
    console.error('Create verifier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/verifier/profile
// @desc    Get verifier profile
// @access  Private (verifier only)
router.get('/verifier/profile', verifierAuth, async (req, res) => {
  try {
    const verifier = req.verifier;
    
    res.json({
      id: verifier._id,
      username: verifier.username,
      firstName: verifier.firstName,
      lastName: verifier.lastName,
      name: verifier.name,
      email: verifier.email,
      role: verifier.role,
      permissions: verifier.permissions,
      verificationsDone: verifier.verificationsDone,
      status: verifier.status,
      createdAt: verifier.createdAt,
      lastLogin: verifier.lastLogin
    });
  } catch (error) {
    console.error('Get verifier profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 