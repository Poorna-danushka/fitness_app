import express from 'express';
import {
  register,
  login,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
  getMe,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import { validate, registerValidator, loginValidator } from '../validators/index.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.post('/refresh', refreshAccessToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/logout', authMiddleware, logout);

export default router;
