import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getCategories,
} from '../controllers/jobController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getJobs);
router.get('/:id', getJobById);

// Admin-only job management
router.post('/', protect, adminOnly, createJob);
router.put('/:id', protect, adminOnly, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);

export default router;
