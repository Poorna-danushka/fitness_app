import mongoose from 'mongoose';

const packageExerciseSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    reps: {
      type: String,
      default: 'As prescribed',
    },
    sets: {
      type: Number,
      default: 3,
    },
    restTime: {
      type: Number,
      default: 60,
      description: 'Rest time in seconds between sets',
    },
    duration: {
      type: Number,
      default: 15,
      description: 'Estimated duration in minutes',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    notes: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for packageId and order
packageExerciseSchema.index({ packageId: 1, order: 1 });
packageExerciseSchema.index({ packageId: 1, isActive: 1 });
packageExerciseSchema.index({ exerciseId: 1 });

export default mongoose.model('PackageExercise', packageExerciseSchema);
