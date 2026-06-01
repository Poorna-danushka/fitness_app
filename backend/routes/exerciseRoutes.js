import express from 'express';
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js';
import authMiddleware from '../middleware/auth.js';

import isAdmin from '../middleware/admin.js';

const router = express.Router();

router.get('/', getAllExercises);
router.get('/:id', getExerciseById);
router.post('/', authMiddleware, isAdmin, createExercise);
router.put('/:id', authMiddleware, isAdmin, updateExercise);
router.delete('/:id', authMiddleware, isAdmin, deleteExercise);

export default router;
