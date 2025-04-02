import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to database
connectDB();

const updateAdminPassword = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });

    if (!adminUser) {
      console.log('Admin user not found'.red.bold);
      process.exit(1);
    }

    // Update password
    adminUser.password = 'password123';
    await adminUser.save();

    console.log('Admin password updated successfully'.green.bold);
    console.log({
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    });

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

updateAdminPassword(); 