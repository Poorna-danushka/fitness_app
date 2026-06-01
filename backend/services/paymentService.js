import Stripe from 'stripe';
import logger from '../utils/logger.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from '../constants/index.js';
import { sendPaymentReceipt } from '../utils/email.js';

const MOCK_STRIPE = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('mock_');
const stripe = MOCK_STRIPE ? null : new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create payment intent for one-time purchase
 */
export const createPaymentIntent = async (userId, packageId, amount) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!packageId || !amount) {
      throw new Error('Package ID and amount are required');
    }

    let paymentIntentId, clientSecret;

    if (MOCK_STRIPE) {
      paymentIntentId = `pi_mock_${Date.now()}`;
      clientSecret = `mock_secret_${paymentIntentId}`;
      logger.info(`Using mock Stripe payment: ${paymentIntentId}`);
    } else {
      if (!stripe) {
        throw new Error('Stripe is not properly configured. Set a valid STRIPE_SECRET_KEY in environment variables.');
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          packageId: packageId.toString(),
        },
        description: `Payment for package ${packageId}`,
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
      logger.info(`Stripe payment intent created: ${paymentIntentId}`);
    }

    // Store payment record
    const payment = new Payment({
      userId,
      packageId,
      amount,
      stripePaymentId: paymentIntentId,
      status: PAYMENT_STATUS.PENDING,
      description: `Package purchase`,
    });

    await payment.save();
    logger.info(`Payment record saved: ${payment._id}`);

    return {
      clientSecret,
      paymentId: paymentIntentId,
    };
  } catch (error) {
    logger.error(`Error creating payment intent: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Create subscription with Stripe
 */
export const createSubscription = async (userId, packageId, planId, billingCycle = 'monthly') => {
  try {
    const user = await User.findById(userId);
    const pkg = await (await import('../models/Package.js')).default.findById(packageId);

    if (!user || !pkg) throw new Error('User or package not found');

    // Create or get customer in Stripe
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId.toString(),
        },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      payment_behavior: 'default_managed',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to database
    const dbSubscription = new Subscription({
      userId,
      packageId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status === 'active' ? SUBSCRIPTION_STATUS.ACTIVE : SUBSCRIPTION_STATUS.ACTIVE,
      amount: pkg.price,
      billingCycle,
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      autoRenew: true,
    });

    await dbSubscription.save();

    // Update user subscription status
    user.subscriptionStatus = 'active';
    user.subscriptionId = dbSubscription._id;
    user.subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
    await user.save();

    logger.info(`Subscription created for user ${userId}: ${subscription.id}`);

    return dbSubscription;
  } catch (error) {
    logger.error(`Error creating subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Handle successful payment
 */
export const handlePaymentSuccess = async (paymentIntentId, stripeChargeId) => {
  try {
    const payment = await Payment.findOne({ stripePaymentId: paymentIntentId });
    if (!payment) {
      logger.warn(`Payment not found for intent: ${paymentIntentId}`);
      return;
    }

    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.stripeChargeId = stripeChargeId;
    await payment.save();

    const user = await User.findById(payment.userId);

    // Create invoice with explicit invoiceNumber
    const invoiceCount = await Invoice.countDocuments();
    const invoice = new Invoice({
      invoiceNumber: `INV-${Date.now()}-${invoiceCount + 1}`,
      userId: payment.userId,
      paymentId: payment._id,
      packageId: payment.packageId,
      amount: payment.amount,
      total: payment.amount,
      status: 'paid',
      paidDate: new Date(),
      description: payment.description,
    });
    await invoice.save();

    // Record the purchase for the package and user
    const existingPurchase = await Purchase.findOne({ paymentId: payment._id });
    if (!existingPurchase) {
      const purchase = new Purchase({
        userId: payment.userId,
        packageId: payment.packageId,
        price: payment.amount,
        status: 'paid',
        paymentId: payment._id,
      });
      await purchase.save();
    }

    // Send receipt email
    try {
      await sendPaymentReceipt(user.email, {
        packageName: payment.description,
        amount: payment.amount,
        transactionId: stripeChargeId,
        date: new Date(),
      });
    } catch (error) {
      logger.warn(`Failed to send receipt email: ${error.message}`);
    }

    logger.info(`Payment successful: ${paymentIntentId}`);

    return payment;
  } catch (error) {
    logger.error(`Error handling payment success: ${error.message}`);
    throw error;
  }
};

/**
 * Verify payment intent and handle success
 */
export const verifyAndConfirmPayment = async (paymentIntentId) => {
  try {
    let stripeChargeId;

    if (MOCK_STRIPE || paymentIntentId.startsWith('pi_mock_')) {
      stripeChargeId = `ch_mock_${Date.now()}`;
    } else {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment intent not succeeded. Current status: ${paymentIntent.status}`);
      }
      stripeChargeId = paymentIntent.latest_charge || paymentIntent.charges?.data?.[0]?.id;
      if (!stripeChargeId) {
        throw new Error('Unable to resolve Stripe charge ID from payment intent.');
      }
    }

    // Call existing success handler
    const payment = await handlePaymentSuccess(paymentIntentId, stripeChargeId);
    return payment;
  } catch (error) {
    logger.error(`Error verifying payment: ${error.message}`);
    throw error;
  }
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (paymentIntentId, failureReason) => {
  try {
    const payment = await Payment.findOne({ stripePaymentId: paymentIntentId });
    if (!payment) {
      logger.warn(`Payment not found for intent: ${paymentIntentId}`);
      return;
    }

    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = failureReason;
    await payment.save();

    logger.error(`Payment failed: ${paymentIntentId} - ${failureReason}`);

    return payment;
  } catch (error) {
    logger.error(`Error handling payment failure: ${error.message}`);
    throw error;
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (userId, reason = 'User requested') => {
  try {
    const subscription = await Subscription.findOne({ userId });
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('Subscription not found');
    }

    // Cancel in Stripe
    await stripe.subscriptions.del(subscription.stripeSubscriptionId);

    // Update in database
    subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.cancelReason = reason;
    await subscription.save();

    // Update user
    const user = await User.findById(userId);
    user.subscriptionStatus = 'cancelled';
    await user.save();

    logger.info(`Subscription cancelled for user ${userId}`);

    return subscription;
  } catch (error) {
    logger.error(`Error cancelling subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (userId, limit = 10, skip = 0) => {
  try {
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Payment.countDocuments({ userId });

    return {
      payments,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Error fetching payment history: ${error.message}`);
    throw error;
  }
};

/**
 * Get subscription details
 */
export const getSubscriptionDetails = async (userId) => {
  try {
    const subscription = await Subscription.findOne({ userId })
      .populate('packageId', 'name price duration description');

    return subscription;
  } catch (error) {
    logger.error(`Error fetching subscription: ${error.message}`);
    throw error;
  }
};

export default {
  createPaymentIntent,
  createSubscription,
  handlePaymentSuccess,
  verifyAndConfirmPayment,
  handlePaymentFailure,
  cancelSubscription,
  getPaymentHistory,
  getSubscriptionDetails,
};
