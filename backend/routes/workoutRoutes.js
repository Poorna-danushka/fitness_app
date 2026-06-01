import express from 'express';
import {
  getAllWorkouts,
  getMyWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout
} from '../controllers/workoutController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = express.Router();

// User routes
router.get('/my-workouts', authMiddleware, getMyWorkouts);
router.post('/', authMiddleware, createWorkout);
router.put('/:id', authMiddleware, updateWorkout);
router.delete('/:id', authMiddleware, deleteWorkout);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllWorkouts);
router.get('/:id', authMiddleware, getWorkoutById);

export default router;
