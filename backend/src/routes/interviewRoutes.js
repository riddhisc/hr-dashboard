import express from 'express';
import {
  getInterviews,
  getInterviewById,
  getInterviewsByApplicantId,
  scheduleInterview,
  updateInterviewStatus,
  addInterviewFeedback,
  deleteInterview,
  updateInterview,
} from '../controllers/interviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getInterviews).post(protect, scheduleInterview);
router.route('/applicant/:applicantId').get(protect, getInterviewsByApplicantId);
router
  .route('/:id')
  .get(protect, getInterviewById)
  .patch(protect, updateInterview)
  .delete(protect, admin, deleteInterview);
router.route('/:id/status').put(protect, updateInterviewStatus);
router.route('/:id/feedback').put(protect, addInterviewFeedback);

export default router; 