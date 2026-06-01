import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'urgent'],
      default: 'info',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', notificationSchema);
