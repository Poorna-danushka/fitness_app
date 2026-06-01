import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../constants/index.js';

/**
 * Generate access token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateVerificationToken = (userId) => {
  return jwt.sign({ userId, type: 'verification' }, process.env.JWT_SECRET, {
    expiresIn: JWT_CONFIG.EMAIL_VERIFICATION_EXPIRY,
  });
};

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Verify email verification token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
export const verifyVerificationToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired verification token');
  }
};

/**
 * Decode token without verification
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
