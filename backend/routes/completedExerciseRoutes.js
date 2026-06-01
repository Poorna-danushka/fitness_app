import express from 'express';
import { markComplete, getMyCompletedExercises } from '../controllers/completedExerciseController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, markComplete);
router.get('/my-completed', authMiddleware, getMyCompletedExercises);

export default router;
