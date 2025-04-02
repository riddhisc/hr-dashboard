import asyncHandler from 'express-async-handler';
import Interview from '../models/interviewModel.js';
import Applicant from '../models/applicantModel.js';
import mongoose from 'mongoose';
import Job from '../models/jobModel.js';

// @desc    Get all interviews
// @route   GET /api/interviews
// @access  Private
const getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({})
    .populate('applicantId', 'name email phone status')
    .populate('jobId', 'title department');
  res.json(interviews);
});

// @desc    Get interview by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate('applicantId', 'name email phone status')
    .populate('jobId', 'title department location')
    .populate('interviewers', 'name email');

  if (interview) {
    res.json(interview);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

// @desc    Get interviews by applicant ID
// @route   GET /api/interviews/applicant/:applicantId
// @access  Private
const getInterviewsByApplicantId = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ applicantId: req.params.applicantId })
    .populate('jobId', 'title department')
    .populate('interviewers', 'name email');
  res.json(interviews);
});

// @desc    Schedule an interview
// @route   POST /api/interviews
// @access  Private
const scheduleInterview = asyncHandler(async (req, res) => {
  try {
    const {
      applicantId,
      jobId,
      interviewers,
      date,
      time,
      duration,
      type,
      location,
      notes,
    } = req.body;

    // Validate required fields with detailed error messages
    if (!applicantId) {
      res.status(400);
      throw new Error('Please provide an applicant ID');
    }

    if (!jobId) {
      res.status(400);
      throw new Error('Please provide a job ID');
    }

    if (!date) {
      res.status(400);
      throw new Error('Please provide an interview date');
    }

    if (!time) {
      res.status(400);
      throw new Error('Please provide an interview time');
    }

    if (!duration) {
      res.status(400);
      throw new Error('Please provide an interview duration');
    }

    if (!type) {
      res.status(400);
      throw new Error('Please provide an interview type');
    }

    // Validate ObjectId format to prevent 500 errors
    if (!mongoose.Types.ObjectId.isValid(applicantId)) {
      res.status(400);
      throw new Error('Invalid applicant ID format. Must be a valid MongoDB ObjectID');
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.status(400);
      throw new Error('Invalid job ID format. Must be a valid MongoDB ObjectID');
    }

    // Check if applicant exists
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      res.status(404);
      throw new Error(`Applicant with ID ${applicantId} not found`);
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404);
      throw new Error(`Job with ID ${jobId} not found`);
    }

    // Validate date format
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
      res.status(400);
      throw new Error('Invalid date format. Please use a valid date format (YYYY-MM-DD)');
    }

    // Process interview data
    const interview = await Interview.create({
      applicantId,
      jobId,
      interviewers: interviewers || [],
      date: validDate,
      time,
      duration,
      type,
      location: location || '',
      notes: notes || '',
    });

    if (interview) {
      // Update applicant status to interview if it's not already
      if (applicant.status !== 'interview' && applicant.status !== 'hired') {
        applicant.status = 'interview';
        await applicant.save();
      }
      
      res.status(201).json(interview);
    } else {
      res.status(400);
      throw new Error('Failed to create interview with the provided data');
    }
  } catch (error) {
    console.error('Error scheduling interview:', {
      message: error.message,
      stack: error.stack
    });
    
    // If error hasn't been handled already, set it as 500
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
      throw new Error('Server error while scheduling interview. Please try again later');
    }
    
    // Re-throw the error for the error middleware to handle
    throw error;
  }
});

// @desc    Update interview
// @route   PATCH /api/interviews/:id
// @access  Private
const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  const {
    date,
    time,
    duration,
    type,
    location,
    notes,
  } = req.body;

  // Update fields
  interview.date = date || interview.date;
  interview.time = time || interview.time;
  interview.duration = duration || interview.duration;
  interview.type = type || interview.type;
  interview.location = location || interview.location;
  interview.notes = notes || interview.notes;

  const updatedInterview = await interview.save();
  
  if (updatedInterview) {
    res.json(updatedInterview);
  } else {
    res.status(400);
    throw new Error('Failed to update interview');
  }
});

// @desc    Update interview status
// @route   PUT /api/interviews/:id/status
// @access  Private
const updateInterviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const interview = await Interview.findById(req.params.id);

  if (interview) {
    interview.status = status || interview.status;
    const updatedInterview = await interview.save();
    res.json(updatedInterview);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

// @desc    Add feedback to interview
// @route   PUT /api/interviews/:id/feedback
// @access  Private
const addInterviewFeedback = asyncHandler(async (req, res) => {
  const { rating, strengths, weaknesses, notes, recommendation } = req.body;
  const interview = await Interview.findById(req.params.id);

  if (interview) {
    interview.feedback = {
      rating,
      strengths,
      weaknesses,
      notes,
      recommendation,
    };
    
    const updatedInterview = await interview.save();

    // Update applicant status based on recommendation if needed
    if (recommendation) {
      const applicant = await Applicant.findById(interview.applicantId);
      if (applicant) {
        if (recommendation === 'hire' && applicant.status !== 'hired') {
          applicant.status = 'hired';
          await applicant.save();
        } else if (recommendation === 'reject' && applicant.status !== 'rejected') {
          applicant.status = 'rejected';
          await applicant.save();
        }
      }
    }

    res.json(updatedInterview);
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
// @access  Private/Admin
const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (interview) {
    await interview.deleteOne();
    res.json({ message: 'Interview removed' });
  } else {
    res.status(404);
    throw new Error('Interview not found');
  }
});

export {
  getInterviews,
  getInterviewById,
  getInterviewsByApplicantId,
  scheduleInterview,
  updateInterview,
  updateInterviewStatus,
  addInterviewFeedback,
  deleteInterview,
}; 