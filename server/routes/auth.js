const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

// @route   POST /api/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, name, phone, email, dob, gender, password, userType = 'individual' } = req.body;
    
    // Check if user already exists with this phone or email
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }
    
    // Check for duplicate email if provided
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email address already registered' });
      }
    }
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      name: name || `${firstName} ${lastName}`,
      phone,
      mobile: phone, // Explicitly set mobile field to match phone
      email,
      dob: dob ? new Date(dob) : undefined,
      gender,
      password, // Will be hashed in the pre-save hook
      userType
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userType: user.userType
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Send a more detailed error message if it's a duplicate key error
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `Duplicate ${field} error. Please use a different ${field}.` 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/check-duplicate
// @desc    Check if a value already exists for a given field
// @access  Public
router.post('/check-duplicate', async (req, res) => {
  try {
    const { field, value } = req.body;
    
    if (!field || !value) {
      return res.status(400).json({ message: 'Field and value are required' });
    }
    
    // Only allow checking specific fields
    const allowedFields = ['email', 'phone'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field for duplicate check' });
    }
    
    // Create a query object that matches the field and value
    const query = { [field]: value };
    
    // Check if a user exists with the given field value
    const existingUser = await User.findOne(query);
    
    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Check duplicate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Check if user is logging in with email or phone
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ message: 'Please provide login credentials and password' });
    }
    
    // Determine if login is email, phone, or username
    let user;
    if (login.includes('@')) {
      // Login with email
      user = await User.findOne({ email: login });
    } else if (/^\d{10}$/.test(login)) {
      // Login with phone number (10 digits)
      user = await User.findOne({ phone: login });
    } else {
      // Login with username
      user = await User.findOne({ username: login });
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        phone: user.phone,
        email: user.email,
        userType: user.userType
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/register-organization
// @desc    Register a new organization
// @access  Public
router.post('/register-organization', async (req, res) => {
  try {
    const { orgName, email, phone, numChecks } = req.body;
    
    // Check if organization with this email or phone already exists
    const existingOrg = await Organization.findOne({
      $or: [{ email }, { phone }]
    });
    
    if (existingOrg) {
      return res.status(400).json({ 
        message: 'An organization with this email or phone already exists' 
      });
    }
    
    // Create new organization
    const organization = new Organization({
      name: orgName,
      email,
      phone,
      numChecks: numChecks || 100
    });
    
    await organization.save();
    
    res.status(201).json({
      success: true,
      organization: {
        id: organization._id,
        name: organization.name,
        email: organization.email,
        phone: organization.phone
      }
    });
  } catch (error) {
    console.error('Organization registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user
// @desc    Get user data by token
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      phone: user.phone,
      email: user.email,
      userType: user.userType
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 