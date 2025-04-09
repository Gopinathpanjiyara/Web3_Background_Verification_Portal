const jwt = require('jsonwebtoken');
const Verifier = require('../models/Verifier');

/**
 * Middleware to authenticate verifiers using JWT
 * Checks if the token is valid and attaches the verifier to the request object
 */
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find verifier by id
    const verifier = await Verifier.findById(decoded.verifierId);
    
    if (!verifier) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Check if verifier is active
    if (verifier.status !== 'active') {
      return res.status(403).json({ 
        message: 'Your account is inactive or suspended. Please contact your administrator.' 
      });
    }
    
    // Attach verifier to request object
    req.verifier = verifier;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 