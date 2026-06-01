import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    },
    amount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'cancelled', 'refunded'],
      default: 'pending',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: Date,
    paidDate: Date,
    description: String,
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    notes: String,
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

// Indexes
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });

export default mongoose.model('Invoice', invoiceSchema);
