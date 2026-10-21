import express from 'express';
import {
  handleResumeAnalysis,
  matchJobs,
  getSkillRecommendations,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

router.post(
  '/analyze-resume',
  protect,
  uploadResume.single('resume'),
  handleResumeAnalysis
);
router.post('/match-jobs', protect, matchJobs);
router.post('/skill-recommendations', protect, getSkillRecommendations);

export default router;
