import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    role: { type: String, enum: ['admin', 'user', 'premium'], default: 'user' },
    
    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpiry: { type: Date, select: false },
    
    // Account security
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    
    // 2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    
    // Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    
    // Subscription
    subscriptionStatus: { 
      type: String, 
      enum: ['none', 'active', 'paused', 'cancelled'], 
      default: 'none' 
    },
    subscriptionId: { type: String },
    subscriptionEndsAt: { type: Date },
    stripeCustomerId: { type: String, select: false },
    
    // Profile
    bio: { type: String, default: '' },
    profileImage: { type: String },
    
    // Preferences
    emailNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    
    // Activity tracking
    lastActivityAt: { type: Date, default: Date.now },
    deletedAt: { type: Date }, // Soft delete
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ subscriptionId: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcryptjs.hash(this.password, 10);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcryptjs.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: new Date(Date.now() + 30 * 60 * 1000) };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

export default mongoose.model('User', userSchema);