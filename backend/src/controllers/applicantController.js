import asyncHandler from 'express-async-handler';
import Applicant from '../models/applicantModel.js';
import Job from '../models/jobModel.js';
import path from 'path';
import fs from 'fs';

// @desc    Get all applicants with pagination and filters
// @route   GET /api/applicants
// @access  Private
const getApplicants = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status;
  const jobId = req.query.jobId;
  const source = req.query.source;
  const search = req.query.search;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (jobId) query.jobId = jobId;
  if (source) query.source = source;
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    
    // Check if jobTitle exists in the schema and include it in search if it does
    try {
      const applicantSchema = Applicant.schema.obj;
      if (applicantSchema.jobTitle) {
        query.$or.push({ jobTitle: { $regex: search, $options: 'i' } });
      }
    } catch (error) {
      console.error('Error checking schema fields:', error);
    }
  }

  // Get total count for pagination
  const count = await Applicant.countDocuments(query);

  // Get applicants with pagination and populate
  const applicants = await Applicant.find(query)
    .populate('jobId', 'title department')
    .populate('interviews')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    applicants,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get applicant by ID
// @route   GET /api/applicants/:id
// @access  Private
const getApplicantById = asyncHandler(async (req, res) => {
  const applicant = await Applicant.findById(req.params.id)
    .populate('jobId', 'title department location')
    .populate('interviews');

  if (applicant) {
    res.json(applicant);
  } else {
    res.status(404);
    throw new Error('Applicant not found');
  }
});

// @desc    Get applicants by job ID
// @route   GET /api/applicants/job/:jobId
// @access  Private
const getApplicantsByJobId = asyncHandler(async (req, res) => {
  const applicants = await Applicant.find({ jobId: req.params.jobId })
    .populate('jobId', 'title department')
    .sort({ createdAt: -1 });
  res.json(applicants);
});

// @desc    Create an applicant with resume upload
// @route   POST /api/applicants
// @access  Public
const createApplicant = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    jobId,
    source,
    notes,
  } = req.body;

  // Check if job exists
  const jobExists = await Job.findById(jobId);
  if (!jobExists) {
    res.status(400);
    throw new Error('Job not found');
  }

  // Check if applicant already applied for this job
  const applicantExists = await Applicant.findOne({ email, jobId });
  if (applicantExists) {
    res.status(400);
    throw new Error('You have already applied for this job');
  }

  // Handle resume upload
  let resumeUrl = '';
  if (req.file) {
    resumeUrl = `/uploads/${req.file.filename}`;
  } else {
    res.status(400);
    throw new Error('Resume is required');
  }

  const applicant = await Applicant.create({
    name,
    email,
    phone,
    jobId,
    source,
    resumeUrl,
    notes,
  });

  if (applicant) {
    res.status(201).json(applicant);
  } else {
    res.status(400);
    throw new Error('Invalid applicant data');
  }
});

// @desc    Update applicant status
// @route   PUT /api/applicants/:id/status
// @access  Private
const updateApplicantStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const applicant = await Applicant.findById(req.params.id);

  if (applicant) {
    applicant.status = status || applicant.status;
    if (notes) {
      applicant.notes = notes;
    }

    const updatedApplicant = await applicant.save();
    res.json(updatedApplicant);
  } else {
    res.status(404);
    throw new Error('Applicant not found');
  }
});

// @desc    Add note to applicant
// @route   PUT /api/applicants/:id/notes
// @access  Private
const addApplicantNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const applicant = await Applicant.findById(req.params.id);

  if (applicant) {
    applicant.notes = applicant.notes 
      ? `${applicant.notes}\n${note}` 
      : note;

    const updatedApplicant = await applicant.save();
    res.json(updatedApplicant);
  } else {
    res.status(404);
    throw new Error('Applicant not found');
  }
});

// @desc    Delete an applicant and their resume
// @route   DELETE /api/applicants/:id
// @access  Private/Admin
const deleteApplicant = asyncHandler(async (req, res) => {
  const applicant = await Applicant.findById(req.params.id);

  if (applicant) {
    // Delete resume file
    if (applicant.resumeUrl) {
      const resumePath = path.join(process.cwd(), applicant.resumeUrl);
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
    }

    await applicant.deleteOne();
    res.json({ message: 'Applicant removed' });
  } else {
    res.status(404);
    throw new Error('Applicant not found');
  }
});

export {
  getApplicants,
  getApplicantById,
  getApplicantsByJobId,
  createApplicant,
  updateApplicantStatus,
  addApplicantNote,
  deleteApplicant,
}; 