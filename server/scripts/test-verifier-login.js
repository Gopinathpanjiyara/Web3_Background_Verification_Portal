const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_URL = `http://localhost:${process.env.PORT || 5002}/api`;

async function testVerifierLogin() {
  try {
    console.log('Testing Verifier Login API...');
    console.log(`API URL: ${API_URL}`);
    
    // Admin login
    console.log('\nTesting admin login:');
    const adminLoginResponse = await axios.post(`${API_URL}/verifier/login`, {
      username: 'admin',
      password: 'password123'
    });
    
    console.log('Admin login successful!');
    console.log('Response status:', adminLoginResponse.status);
    console.log('User data:', adminLoginResponse.data.user);
    console.log('Token received:', !!adminLoginResponse.data.token);
    
    // Verifier login
    console.log('\nTesting verifier login:');
    const verifierLoginResponse = await axios.post(`${API_URL}/verifier/login`, {
      username: 'verifier1',
      password: 'verifier123'
    });
    
    console.log('Verifier login successful!');
    console.log('Response status:', verifierLoginResponse.status);
    console.log('User data:', verifierLoginResponse.data.user);
    console.log('Token received:', !!verifierLoginResponse.data.token);
    
    // Test with wrong password
    console.log('\nTesting with wrong password:');
    try {
      const wrongPasswordResponse = await axios.post(`${API_URL}/verifier/login`, {
        username: 'admin',
        password: 'wrongpassword'
      });
      console.log('Unexpected success with wrong password!');
    } catch (error) {
      console.log('Expected error:', error.response.status, error.response.data.message);
    }
    
    // Test with non-existent user
    console.log('\nTesting with non-existent user:');
    try {
      const nonExistentUserResponse = await axios.post(`${API_URL}/verifier/login`, {
        username: 'nonexistent',
        password: 'password123'
      });
      console.log('Unexpected success with non-existent user!');
    } catch (error) {
      console.log('Expected error:', error.response.status, error.response.data.message);
    }
    
    console.log('\nAll verifier login tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Full error:', error);
    }
  }
}

testVerifierLogin(); 