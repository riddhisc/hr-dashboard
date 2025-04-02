import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({});
  res.json(jobs);
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('applicants');

  if (job) {
    res.json(job);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    department,
    location,
    type,
    description,
    requirements,
    salary,
    closingDate,
    skills,
  } = req.body;

  const job = await Job.create({
    title,
    department,
    location,
    type,
    description,
    requirements,
    salary,
    closingDate,
    skills,
    createdBy: req.user._id,
  });

  if (job) {
    res.status(201).json(job);
  } else {
    res.status(400);
    throw new Error('Invalid job data');
  }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    job.title = req.body.title || job.title;
    job.department = req.body.department || job.department;
    job.location = req.body.location || job.location;
    job.type = req.body.type || job.type;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;
    job.salary = req.body.salary || job.salary;
    job.status = req.body.status || job.status;
    job.closingDate = req.body.closingDate || job.closingDate;
    job.skills = req.body.skills || job.skills;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

export { getJobs, getJobById, createJob, updateJob, deleteJob }; 