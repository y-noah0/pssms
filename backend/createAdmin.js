const mongoose = require('mongoose');
const User = require('./model/User');
require('dotenv').config();

const createInitialAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log('Connected to MongoDB database');
    
    // Check if admin user already exists
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists, no need to create one.');
    } else {
      // Create admin user
      const admin = new User({
        username: 'admin',
        password: 'admin123' // will be hashed automatically by the model pre-save hook
      });
      
      await admin.save();
      console.log('Admin user created successfully with username: admin and password: admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createInitialAdmin();
