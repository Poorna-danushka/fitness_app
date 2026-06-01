import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import logger from './utils/logger.js';
import { initializeEmailService } from './utils/email.js';

// Import middleware
import { corsMiddleware } from './middleware/cors.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import completedExerciseRoutes from './routes/completedExerciseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// ============ Security Middleware ============
app.use(helmet());
app.use(corsMiddleware);
app.use(compression());

// ============ Body Parser Middleware ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ Rate Limiting ============
app.use('/api/', apiLimiter);

// ============ Logging Middleware ============
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============ Health Check ============
app.get('/', (req, res) => {
  res.json({ 
    message: 'GymFit Pro API running', 
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV 
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============ API Routes ============
const apiPrefix = process.env.API_PREFIX || '/api/v1';

app.use(`${apiPrefix}/auth`, authLimiter, authRoutes);
app.use(`${apiPrefix}/exercises`, exerciseRoutes);
app.use(`${apiPrefix}/packages`, packageRoutes);
app.use(`${apiPrefix}/purchases`, purchaseRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/completed-exercises`, completedExerciseRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/workouts`, workoutRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);

// ============ Error Handling ============
app.use(notFoundHandler);
app.use(errorHandler);

// ============ Server Start ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ MongoDB connected');

    // Initialize email service
    try {
      initializeEmailService();
      logger.info('✅ Email service initialized');
    } catch (error) {
      logger.warn('⚠️ Email service not fully configured. Email features may not work.');
    }

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 API Documentation:`);
      logger.info(`  - Auth: POST ${apiPrefix}/auth/register, /auth/login, GET /auth/me`);
      logger.info(`  - Payments: POST ${apiPrefix}/payments/intent, /payments/subscribe`);
      logger.info(`  - Exercises: GET ${apiPrefix}/exercises`);
      logger.info(`  - Packages: GET/POST ${apiPrefix}/packages`);
      logger.info(`  - Users: GET/PUT ${apiPrefix}/users/me`);
      logger.info(`  - Health: GET /api/health`);
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// ============ Graceful Shutdown ============
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
