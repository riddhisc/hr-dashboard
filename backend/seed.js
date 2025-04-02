import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';

// Load models
import Job from './src/models/jobModel.js';
import Applicant from './src/models/applicantModel.js';
import Interview from './src/models/interviewModel.js';
import User from './src/models/userModel.js';

// Load environment variables
dotenv.config();

// Sample data
const jobs = [
  {
    title: 'Frontend Developer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Remote',
    requirements: 'React, TypeScript, HTML/CSS',
    description: 'We are looking for a Frontend Developer to join our team.',
    status: 'open',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD'
    },
    skills: ['React', 'TypeScript', 'HTML', 'CSS'],
    closingDate: new Date('2024-05-01')
  },
  {
    title: 'Backend Developer',
    department: 'Engineering', 
    type: 'Full-time',
    location: 'Hybrid',
    requirements: 'Node.js, MongoDB, Express',
    description: 'Backend Developer position for our growing team.',
    status: 'open',
    salary: {
      min: 85000,
      max: 130000,
      currency: 'USD'
    },
    skills: ['Node.js', 'MongoDB', 'Express'],
    closingDate: new Date('2024-05-15')
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    type: 'Full-time',
    location: 'Onsite',
    requirements: 'Figma, Adobe XD, User Research',
    description: 'Looking for a creative UI/UX Designer.',
    status: 'draft',
    salary: {
      min: 70000,
      max: 110000,
      currency: 'USD'
    },
    skills: ['Figma', 'Adobe XD', 'User Research'],
    closingDate: new Date('2024-06-01')
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Connect to database
    const conn = await connectDB();

    // Clear existing data
    await Job.deleteMany();
    await Applicant.deleteMany();
    await Interview.deleteMany();
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    let adminUser;
    if (!adminExists) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        isAdmin: true,
      });
      console.log('Admin user created'.green.inverse);
    } else {
      adminUser = adminExists;
    }

    // Insert jobs
    const createdJobs = await Job.insertMany(jobs);
    console.log(`${createdJobs.length} jobs inserted`.green.inverse);

    // Create applicants with valid job IDs
    const applicants = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '123-456-7890',
        jobId: createdJobs[0]._id,
        jobTitle: createdJobs[0].title,
        status: 'shortlisted',
        source: 'linkedin',
        resumeUrl: 'https://example.com/resume1.pdf',
        appliedDate: new Date('2024-03-01'),
        notes: 'Strong React experience'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '234-567-8901',
        jobId: createdJobs[0]._id,
        jobTitle: createdJobs[0].title,
        status: 'pending',
        source: 'indeed',
        resumeUrl: 'https://example.com/resume2.pdf',
        appliedDate: new Date('2024-03-02'),
        notes: 'Good portfolio'
      },
      {
        name: 'Michael Chen',
        email: 'mchen@example.com',
        phone: '345-678-9012',
        jobId: createdJobs[1]._id,
        jobTitle: createdJobs[1].title,
        status: 'interview',
        source: 'company',
        resumeUrl: 'https://example.com/resume3.pdf',
        appliedDate: new Date('2024-03-03'),
        notes: 'Strong backend skills'
      },
      {
        name: 'Emily Brown',
        email: 'emily.b@example.com',
        phone: '456-789-0123',
        jobId: createdJobs[1]._id,
        jobTitle: createdJobs[1].title,
        status: 'rejected',
        source: 'linkedin',
        resumeUrl: 'https://example.com/resume4.pdf',
        appliedDate: new Date('2024-03-04'),
        notes: 'Not enough experience'
      },
      {
        name: 'David Wilson',
        email: 'david.w@example.com',
        phone: '567-890-1234',
        jobId: createdJobs[2]._id,
        jobTitle: createdJobs[2].title,
        status: 'hired',
        source: 'indeed',
        resumeUrl: 'https://example.com/resume5.pdf',
        appliedDate: new Date('2024-03-05'),
        notes: 'Great design portfolio'
      }
    ];

    // Insert applicants
    const createdApplicants = await Applicant.insertMany(applicants);
    console.log(`${createdApplicants.length} applicants inserted`.green.inverse);

    // Create interviews
    const interviews = [
      {
        applicantId: createdApplicants[0]._id,
        applicantName: createdApplicants[0].name,
        jobId: createdJobs[0]._id,
        jobTitle: createdJobs[0].title,
        date: '2024-03-15T10:00:00',
        time: '10:00 AM',
        duration: 60, // minutes
        interviewerNames: 'Sarah Johnson, Michael Chen',
        type: 'technical',
        location: 'Zoom',
        status: 'scheduled',
        notes: 'Focus on React and state management experience',
        feedback: {}
      },
      {
        applicantId: createdApplicants[1]._id,
        applicantName: createdApplicants[1].name,
        jobId: createdJobs[0]._id,
        jobTitle: createdJobs[0].title,
        date: '2024-03-12T14:30:00',
        time: '2:30 PM',
        duration: 45, // minutes
        interviewerNames: 'Sarah Johnson, David Wilson',
        type: 'technical',
        location: 'Google Meet',
        status: 'completed',
        notes: 'Ask about previous projects and team collaboration',
        feedback: {
          rating: 4,
          strengths: 'Strong technical skills, good communication',
          weaknesses: 'Could improve on system design',
          notes: 'Overall positive impression',
          recommendation: 'hire'
        }
      },
      {
        applicantId: createdApplicants[2]._id,
        applicantName: createdApplicants[2].name,
        jobId: createdJobs[1]._id,
        jobTitle: createdJobs[1].title,
        date: '2024-03-18T11:00:00',
        time: '11:00 AM',
        duration: 60, // minutes
        interviewerNames: 'Robert Brown, Lisa Garcia',
        type: 'technical',
        location: 'In-office',
        status: 'scheduled',
        notes: 'Focus on Node.js and database experience',
        feedback: {}
      },
      {
        applicantId: createdApplicants[4]._id,
        applicantName: createdApplicants[4].name,
        jobId: createdJobs[2]._id,
        jobTitle: createdJobs[2].title,
        date: '2024-03-10T13:00:00',
        time: '1:00 PM',
        duration: 90, // minutes
        interviewerNames: 'Emily Taylor, James Wilson',
        type: 'technical',
        location: 'Zoom',
        status: 'completed',
        notes: 'Review portfolio and design process',
        feedback: {
          rating: 5,
          strengths: 'Excellent portfolio, great design thinking',
          weaknesses: 'None significant',
          notes: 'Would be a great addition to the team',
          recommendation: 'hire'
        }
      },
      {
        applicantId: createdApplicants[3]._id,
        applicantName: createdApplicants[3].name,
        jobId: createdJobs[1]._id,
        jobTitle: createdJobs[1].title,
        date: '2024-03-11T15:00:00',
        time: '3:00 PM',
        duration: 60, // minutes
        interviewerNames: 'Robert Brown, Lisa Garcia',
        type: 'technical',
        location: 'Google Meet',
        status: 'cancelled',
        notes: 'Focus on API design and database optimization',
        feedback: {
          notes: 'Candidate cancelled due to accepting another offer'
        }
      }
    ];

    // Add the admin user as the interviewer for all interviews
    interviews.forEach(interview => {
      interview.interviewers = [adminUser._id];
    });

    const createdInterviews = await Interview.insertMany(interviews);
    console.log(`${createdInterviews.length} interviews inserted`.green.inverse);

    console.log('Data seeded successfully!'.green.bold);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 