const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Create Express app
const app = express();

// Connect to MongoDB
try {
  connectDB();
  console.log('Trying to connect to MongoDB...');
} catch (err) {
  console.error('Could not connect to MongoDB, but continuing anyway:', err.message);
}

// Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/bgv', require('./routes/bgv'));

// Define port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 