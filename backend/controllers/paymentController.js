import {
  createPaymentIntent,
  createSubscription,
  cancelSubscription,
  getPaymentHistory,
  getSubscriptionDetails,
  verifyAndConfirmPayment,
} from '../services/paymentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Create payment intent
 * POST /api/v1/payments/intent
 */
export const createIntent = asyncHandler(async (req, res) => {
  const { packageId, amount } = req.body;

  if (!packageId || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Package ID and amount required',
    });
  }

  const { clientSecret, paymentId } = await createPaymentIntent(req.userId, packageId, amount);

  res.status(200).json({
    success: true,
    data: {
      clientSecret,
      paymentId,
      paymentIntentId: paymentId,
    },
  });
});

/**
 * Create subscription
 * POST /api/v1/payments/subscribe
 */
export const createCheckoutSubscription = asyncHandler(async (req, res) => {
  const { packageId, planId, billingCycle } = req.body;

  if (!packageId || !planId) {
    return res.status(400).json({
      success: false,
      message: 'Package ID and plan ID required',
    });
  }

  const subscription = await createSubscription(
    req.userId,
    packageId,
    planId,
    billingCycle || 'monthly'
  );

  res.status(201).json({
    success: true,
    message: 'Subscription created successfully',
    data: subscription,
  });
});

/**
 * Cancel subscription
 * POST /api/v1/payments/cancel
 */
export const cancelUserSubscription = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const subscription = await cancelSubscription(req.userId, reason);

  res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: subscription,
  });
});

/**
 * Get payment history
 * GET /api/v1/payments/history
 */
export const getHistory = asyncHandler(async (req, res) => {
  const { limit = 10, skip = 0 } = req.query;

  const result = await getPaymentHistory(req.userId, parseInt(limit), parseInt(skip));

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get subscription details
 * GET /api/v1/payments/subscription
 */
export const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await getSubscriptionDetails(req.userId);

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: 'No active subscription',
    });
  }

  res.status(200).json({
    success: true,
    data: subscription,
  });
});

/**
 * Confirm payment
 * POST /api/v1/payments/confirm
 */
export const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: 'Payment Intent ID is required',
    });
  }

  const payment = await verifyAndConfirmPayment(paymentIntentId);

  res.status(200).json({
    success: true,
    message: 'Payment confirmed successfully',
    data: payment,
  });
});

export default {
  createIntent,
  confirmPayment,
  createCheckoutSubscription,
  cancelUserSubscription,
  getHistory,
  getSubscription,
};
