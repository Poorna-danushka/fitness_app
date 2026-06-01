import express from 'express';
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authMiddleware as protect, adminMiddleware as admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, admin, createNotification);

router.post('/read-all', protect, markAllAsRead);
router.post('/:id/read', protect, markAsRead);

router.route('/:id')
  .put(protect, admin, updateNotification)
  .delete(protect, admin, deleteNotification);

export default router;
