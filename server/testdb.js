const connectDB = require('./config/db');

async function testConnection() {
  try {
    const conn = await connectDB();
    console.log('MongoDB Connected Successfully!');
    console.log(`Connected to: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    process.exit(0);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

testConnection(); 