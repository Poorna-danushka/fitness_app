import express from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';

const router = express.Router();

router.get('/', authMiddleware, isAdmin, getAllUsers);
router.put('/:id/role', authMiddleware, isAdmin, updateUserRole);
router.delete('/:id', authMiddleware, isAdmin, deleteUser);

export default router;
