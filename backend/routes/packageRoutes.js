import express from 'express';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  addExerciseToPackage,
  updatePackageExercise,
  removeExerciseFromPackage,
  reorderPackageExercises,
  getPackageExercises,
} from '../controllers/packageController.js';
import authMiddleware from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';

const router = express.Router();

// Public endpoints
router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.get('/:id/exercises', getPackageExercises);

// Admin endpoints
router.post('/', authMiddleware, isAdmin, createPackage);
router.put('/:id', authMiddleware, isAdmin, updatePackage);
router.delete('/:id', authMiddleware, isAdmin, deletePackage);

// Exercise management endpoints (admin only)
// FIX: Register the static /reorder route BEFORE the dynamic /:exerciseId route.
// Express matches routes in registration order — if /:exerciseId comes first,
// "reorder" is captured as a param value and the wrong handler is called.
router.post('/:id/exercises', authMiddleware, isAdmin, addExerciseToPackage);
router.put('/:id/exercises/reorder', authMiddleware, isAdmin, reorderPackageExercises);   // ← must be first
router.put('/:id/exercises/:exerciseId', authMiddleware, isAdmin, updatePackageExercise); // ← dynamic param after
router.delete('/:id/exercises/:exerciseId', authMiddleware, isAdmin, removeExerciseFromPackage);

export default router;
