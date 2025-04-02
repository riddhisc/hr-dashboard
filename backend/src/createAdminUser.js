import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to database
connectDB();

const createAdminUser = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      console.log('Admin user already exists'.yellow.bold);
      process.exit();
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('Admin user created:'.green.bold);
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

createAdminUser(); 