import express from 'express';
import {
  getApplicants,
  getApplicantById,
  getApplicantsByJobId,
  createApplicant,
  updateApplicantStatus,
  addApplicantNote,
  deleteApplicant,
} from '../controllers/applicantController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload, handleUploadError } from '../utils/fileUpload.js';

const router = express.Router();

// Public routes
router.post('/', upload.single('resume'), handleUploadError, createApplicant);

// Protected routes
router.get('/', protect, getApplicants);
router.get('/job/:jobId', protect, getApplicantsByJobId);
router.get('/:id', protect, getApplicantById);
router.put('/:id/status', protect, updateApplicantStatus);
router.put('/:id/notes', protect, addApplicantNote);
router.delete('/:id', protect, admin, deleteApplicant);

export default router; 