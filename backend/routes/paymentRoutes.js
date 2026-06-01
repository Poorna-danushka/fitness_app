import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createIntent,
  confirmPayment,
  createCheckoutSubscription,
  cancelUserSubscription,
  getHistory,
  getSubscription,
} from '../controllers/paymentController.js';

const router = express.Router();

// All payment routes require authentication
router.use(authMiddleware);

// Payment endpoints
router.post('/intent', createIntent);
router.post('/confirm', confirmPayment);
router.post('/subscribe', createCheckoutSubscription);
router.post('/cancel', cancelUserSubscription);
router.get('/history', getHistory);
router.get('/subscription', getSubscription);

export default router;
