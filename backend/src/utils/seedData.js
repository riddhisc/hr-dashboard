import User from '../models/userModel.js';
import Job from '../models/jobModel.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create sample jobs
    const jobs = await Job.insertMany([
      {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'New York, NY',
        type: 'Full-time',
        description: 'We are looking for a Senior Software Engineer to join our team.',
        requirements: '5+ years of experience in full-stack development',
        salary: {
          min: 120000,
          max: 180000,
          currency: 'USD'
        },
        status: 'open',
        closingDate: new Date('2024-12-31'),
        createdBy: adminUser._id,
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript']
      },
      {
        title: 'Product Manager',
        department: 'Product',
        location: 'San Francisco, CA',
        type: 'Full-time',
        description: 'Seeking an experienced Product Manager to lead our product initiatives.',
        requirements: '3+ years of product management experience',
        salary: {
          min: 100000,
          max: 160000,
          currency: 'USD'
        },
        status: 'open',
        closingDate: new Date('2024-12-31'),
        createdBy: adminUser._id,
        skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis']
      },
      {
        title: 'UX Designer',
        department: 'Design',
        location: 'Remote',
        type: 'Full-time',
        description: 'Join our design team to create beautiful user experiences.',
        requirements: '3+ years of UX design experience',
        salary: {
          min: 90000,
          max: 140000,
          currency: 'USD'
        },
        status: 'open',
        closingDate: new Date('2024-12-31'),
        createdBy: adminUser._id,
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems']
      },
    ]);

    console.log('Data seeded successfully!');
    console.log('Admin user credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData(); 