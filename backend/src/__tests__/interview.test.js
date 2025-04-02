const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../app');
const Interview = require('../models/interviewModel');
const User = require('../models/userModel');
const connectDB = require('../config/db');

// Mock data
const testInterview = {
  applicantId: new mongoose.Types.ObjectId(),
  jobId: new mongoose.Types.ObjectId(),
  date: new Date(),
  time: '10:00 AM',
  duration: 60,
  type: 'technical',
  location: 'Zoom',
  status: 'scheduled',
  notes: 'Test interview'
};

let authToken;

// Connect to test database before all tests
beforeAll(async () => {
  // Use a test database URL
  process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/ats_test_db';
  await connectDB();
  
  // Clean up the test database
  await Interview.deleteMany({});
  
  // Create a test user and get auth token
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin'
  };
  
  // Check if user already exists
  let user = await User.findOne({ email: testUser.email });
  if (!user) {
    user = await User.create(testUser);
  }
  
  // Generate token
  authToken = user.getSignedJwtToken();
});

// Clean up after tests
afterAll(async () => {
  await Interview.deleteMany({});
  await mongoose.connection.close();
});

describe('Interview API Tests', () => {
  describe('GET /api/interviews', () => {
    it('should fetch all interviews', async () => {
      // Create a test interview in the database
      await Interview.create(testInterview);
      
      const response = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('POST /api/interviews', () => {
    it('should create a new interview', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testInterview);
        
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.status).toBe('scheduled');
    });
  });
}); 