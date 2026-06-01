import nodemailer from 'nodemailer';
import logger from './logger.js';

let transporter;

const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email verification link
 * @param {string} email - User email
 * @param {string} verificationLink - Verification URL
 */
export const sendVerificationEmail = async (email, verificationLink) => {
  if (!transporter) initializeEmailService();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your GymFit Pro Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Welcome to GymFit Pro! Click the link below to verify your account:</p>
        <p>
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
        <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email: ${error.message}`);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetLink - Reset URL
 */
export const sendPasswordResetEmail = async (email, resetLink) => {
  if (!transporter) initializeEmailService();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your GymFit Pro Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email: ${error.message}`);
    throw error;
  }
};

/**
 * Send payment receipt
 * @param {string} email - User email
 * @param {object} paymentDetails - Payment details
 */
export const sendPaymentReceipt = async (email, paymentDetails) => {
  if (!transporter) initializeEmailService();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Payment Receipt - GymFit Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Received</h2>
        <p>Thank you for your subscription!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Package:</strong> ${paymentDetails.packageName}</p>
          <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
          <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
          <p><strong>Date:</strong> ${new Date(paymentDetails.date).toLocaleDateString()}</p>
        </div>
        <p style="color: #666; font-size: 12px;">Keep this email for your records.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Payment receipt sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send payment receipt: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 */
export const sendWelcomeEmail = async (email, name) => {
  if (!transporter) initializeEmailService();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to GymFit Pro!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${name}! 💪</h2>
        <p>You're now part of the GymFit Pro community. Start your fitness journey today!</p>
        <p style="margin-top: 30px;">Happy training!</p>
        <p style="color: #666; font-size: 12px;">GymFit Pro Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email: ${error.message}`);
    throw error;
  }
};

export { initializeEmailService };
