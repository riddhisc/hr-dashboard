import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getJobs).post(protect, admin, createJob);
router
  .route('/:id')
  .get(getJobById)
  .put(protect, admin, updateJob)
  .delete(protect, admin, deleteJob);

export default router; 