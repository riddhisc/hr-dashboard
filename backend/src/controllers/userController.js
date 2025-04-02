import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile || {},
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update basic user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update profile fields
    if (req.body.profile) {
      // Merge existing profile with new profile data
      user.profile = {
        ...user.profile,
        ...req.body.profile
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.profile,
      token: updatedUser.getSignedJwtToken(),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Authenticate user with Google
// @route   POST /api/users/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  console.log('Google Login Request Body:', req.body);

  // Validate token presence
  const { token } = req.body;
  if (!token) {
    console.error('No token provided in Google login request');
    return res.status(400).json({ message: 'No Google token provided' });
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log('Google Token Payload:', payload);

    // Extract user details from token
    const { email, name, sub: googleId } = payload;
    if (!email) {
      console.error('No email found in Google token');
      return res.status(400).json({ message: 'Invalid Google token: No email found' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        googleId,
        isGoogleUser: true,
        password: googleId, // Use Google ID as a temporary password
        profile: {
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ')[1] || '',
          skills: [],
          experience: [],
          education: [],
          address: {}
        }
      });
      console.log('New user created via Google login:', user.email);
    } else {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      
      // Always mark as Google user and reset profile for Google users
      user.isGoogleUser = true;
      
      await user.save();
      console.log('Updated existing user with Google ID:', user.email);
    }

    // Generate JWT token
    const jwtToken = user.getSignedJwtToken();

    // Respond with user details and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isGoogleUser: true,
      token: jwtToken,
      profile: user.profile || {}
    });

  } catch (error) {
    console.error('Google Login Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Handle specific error types
    if (error.message.includes('Token expired')) {
      return res.status(401).json({ message: 'Google token has expired' });
    }

    if (error.message.includes('Wrong number of segments')) {
      return res.status(400).json({ message: 'Invalid Google token format' });
    }

    // Generic error response
    res.status(401).json({ 
      message: 'Google login failed',
      error: error.message 
    });
  }
});

export { registerUser, loginUser, getUserProfile, updateUserProfile, getUsers, googleLogin };