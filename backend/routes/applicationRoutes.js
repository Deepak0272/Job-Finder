import express from 'express';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All application tracker endpoints require login

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
