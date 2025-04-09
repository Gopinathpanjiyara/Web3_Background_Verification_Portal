const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    sparse: true,
    trim: true,
    minlength: 3
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    sparse: true // This allows null/undefined values to be ignored for uniqueness
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    unique: true
  },
  // Add mobile field with sparse index to prevent duplicate key error for null values
  mobile: {
    type: String,
    trim: true,
    sparse: true // This allows multiple documents to have null/undefined values
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  userType: {
    type: String,
    enum: ['individual', 'organization'],
    default: 'individual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save middleware to ensure phone is copied to mobile for backward compatibility
UserSchema.pre('save', function(next) {
  // If mobile is not set but phone is, copy phone to mobile
  if (!this.mobile && this.phone) {
    this.mobile = this.phone;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema); 