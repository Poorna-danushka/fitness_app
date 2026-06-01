import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS } from '../constants/index.js';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    cancelledAt: Date,
    cancelReason: String,
    autoRenew: {
      type: Boolean,
      default: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    nextBillingDate: Date,
    lastBillingDate: Date,
    failedPaymentAttempts: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

// Indexes
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function () {
  return (
    this.status === SUBSCRIPTION_STATUS.ACTIVE &&
    (!this.endDate || this.endDate > Date.now())
  );
});

// Ensure virtuals are included in JSON
subscriptionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Subscription', subscriptionSchema);
