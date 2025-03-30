const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/dashboard/profile
// @desc    Get user profile data
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      email: user.email,
      dob: user.dob,
      userType: user.userType
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/dashboard/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = req.user;
    
    // Update user profile
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) {
      user.phone = phone;
      user.mobile = phone; // Keep mobile field in sync
    }
    
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      email: user.email,
      userType: user.userType
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/services
// @desc    Get available services
// @access  Private
router.get('/services', auth, async (req, res) => {
  try {
    // Sample services data - would come from database in production
    const services = [
      {
        id: 'service-1',
        name: 'Standard Verification',
        description: 'Basic document verification with blockchain security.',
        price: 0,
        active: true
      },
      {
        id: 'service-2',
        name: 'Premium Verification',
        description: 'Advanced document verification with enhanced security features.',
        price: 29.99,
        active: true
      }
    ];
    
    res.json(services);
  } catch (error) {
    console.error('Services fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/status
// @desc    Get system status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    // In a real app, these would be actual system checks
    const status = {
      blockchain: { status: 'online', latency: 120 },
      verification: { status: 'online', latency: 95 },
      storage: { status: 'online', latency: 105 }
    };
    
    res.json(status);
  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/nft-certificates
// @desc    Get user's NFT certificates
// @access  Private
router.get('/nft-certificates', auth, async (req, res) => {
  try {
    // Sample NFT certificates - would come from blockchain in production
    const certificates = [
      {
        id: 'cert-001',
        name: 'Certificate #001',
        issueDate: '2023-07-21',
        status: 'valid',
        blockchain: 'Ethereum',
        txHash: '0x8a7d6f8e9b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0'
      }
    ];
    
    res.json(certificates);
  } catch (error) {
    console.error('NFT certificates fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/settings
// @desc    Get user settings
// @access  Private
router.get('/settings', auth, async (req, res) => {
  try {
    // These would be stored settings in a real app
    const settings = {
      notifications: {
        email: true,
        sms: false
      },
      security: {
        twoFactorEnabled: false
      }
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/dashboard/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const { notifications, security } = req.body;
    
    // In a real app, these would be saved to the database
    const settings = {
      notifications: notifications || {
        email: true,
        sms: false
      },
      security: security || {
        twoFactorEnabled: false
      }
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 