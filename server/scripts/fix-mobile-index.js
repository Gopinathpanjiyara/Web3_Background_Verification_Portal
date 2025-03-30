const mongoose = require('mongoose');
require('dotenv').config();

const fixMobileIndex = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Get access to the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find all users
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users`);
    
    // Check and update each user to ensure they have a mobile field
    let updatedCount = 0;
    for (const user of users) {
      if (user.phone && (!user.mobile || user.mobile !== user.phone)) {
        // Update the user to set mobile = phone
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { mobile: user.phone } }
        );
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} users with mobile field`);
    
    // Check for and drop any mobile index that doesn't have sparse:true
    const indexes = await usersCollection.indexes();
    for (const index of indexes) {
      if (index.key.mobile && !index.sparse) {
        console.log('Dropping non-sparse mobile index');
        await usersCollection.dropIndex(index.name);
      }
    }
    
    // Create sparse mobile index if it doesn't exist
    const hasProperMobileIndex = indexes.some(index => index.key.mobile && index.sparse);
    if (!hasProperMobileIndex) {
      console.log('Creating proper sparse mobile index');
      await usersCollection.createIndex({ mobile: 1 }, { sparse: true, unique: true });
    }
    
    console.log('MongoDB index repair completed');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

fixMobileIndex(); 