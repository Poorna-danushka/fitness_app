import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/index.js';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    stripePaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeChargeId: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'stripe', 'paypal'],
      default: 'stripe',
    },
    description: String,
    metadata: {
      type: Map,
      of: String,
    },
    failureReason: String,
    refundedAt: Date,
    refundAmount: Number,
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
