import express from 'express';
import {
  getAllPurchases,
  getMyPurchases,
  createPurchase,
  createPurchaseWithPayment,
  updatePurchaseStatus,
} from '../controllers/purchaseController.js';
import authMiddleware from '../middleware/auth.js';
import isAdmin from '../middleware/admin.js';

const router = express.Router();

router.get('/', authMiddleware, isAdmin, getAllPurchases);
router.get('/my-purchases', authMiddleware, getMyPurchases);
router.post('/', authMiddleware, createPurchase);
router.post('/payment', authMiddleware, createPurchaseWithPayment);
router.put('/:id/status', authMiddleware, isAdmin, updatePurchaseStatus);

export default router;
