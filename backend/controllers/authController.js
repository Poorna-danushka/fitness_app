import User from '../models/User.js';
import logger from '../utils/logger.js';
import { generateAccessToken, generateRefreshToken, generateVerificationToken, verifyAccessToken, verifyRefreshToken, verifyVerificationToken } from '../utils/jwt.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/index.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate, registerValidator, loginValidator } from '../validators/index.js';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
    });
  }

  // Create user first
  const user = new User({
    name,
    email,
    password,
    role: email === 'admin@gymfit.com' ? 'admin' : 'user',
    emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  await user.save();

  // Generate verification token with userId
  const verificationToken = generateVerificationToken(user._id);

  // Store the token in the database
  user.emailVerificationToken = verificationToken;
  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Send verification email
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verificationLink);
  } catch (error) {
    logger.warn(`Failed to send verification email to ${email}: ${error.message}`);
  }

  // Log successful registration
  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and select password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Check if account is locked
  if (user.isAccountLocked()) {
    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.ACCOUNT_LOCKED,
    });
  }

  // Check password
  const isPasswordCorrect = await user.matchPassword(password);
  if (!isPasswordCorrect) {
    // Increment login attempts
    await user.incLoginAttempts();

    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = new Date();
  user.lastActivityAt = new Date();
  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      isEmailVerified: user.isEmailVerified,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
    warning: !user.isEmailVerified ? 'Please verify your email to unlock all features' : null,
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
});

/**
 * Verify email
 * POST /api/v1/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token required',
    });
  }

  try {
    // Verify and decode the JWT token
    const decoded = verifyVerificationToken(token);

    // Find user by ID and check expiry
    const user = await User.findOne({
      _id: decoded.userId,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    logger.info(`Email verified for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Email verification failed',
    });
  }
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      weight: user.weight,
      height: user.height,
      isEmailVerified: user.isEmailVerified,
      subscriptionStatus: user.subscriptionStatus,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Update profile
 * PUT /api/v1/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, weight, height, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    {
      ...(name && { name }),
      ...(weight && { weight }),
      ...(height && { height }),
      ...(bio && { bio }),
      lastActivityAt: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  logger.info(`Profile updated for: ${user.email}`);

  res.status(200).json({
    success: true,
    message: SUCCESS_MESSAGES.PROFILE_UPDATED,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      weight: user.weight,
      height: user.height,
      bio: user.bio,
    },
  });
});

/**
 * Resend verification email
 * POST /api/v1/auth/resend-verification
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(user._id);
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    try {
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(email, verificationLink);
    } catch (error) {
      logger.warn(`Failed to send verification email to ${email}: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
      });
    }

    logger.info(`Verification email resent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    logger.error(`Error resending verification email: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
    });
  }
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  logger.info(`User logged out: ${req.userId}`);

  res.status(200).json({
    success: true,
    message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
  });
});
