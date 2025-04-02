import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to database
connectDB();

const testLogin = async () => {
  try {
    const email = 'admin@example.com';
    const password = 'password123';
    
    console.log(`Attempting to login with: ${email}`.cyan);
    
    // Find the user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User with email ${email} not found`.red);
      process.exit(1);
    }
    
    console.log(`User found: ${user.name}`.green);
    
    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      console.log('Password matches!'.green.bold);
      console.log('Login successful'.green.bold);
      
      // Generate token
      const token = user.getSignedJwtToken();
      console.log('Generated token:'.yellow, token);
      
      console.log('User details:'.cyan);
      console.log({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('Password does not match'.red.bold);
    }
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

testLogin(); 