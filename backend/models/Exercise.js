import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide exercise name'],
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: [true, 'Please provide muscle group'],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    image: {
      type: String,
      required: [true, 'Please provide image URL'],
    },
    beginnerReps: {
      type: String,
      required: [true, 'Please provide beginner reps'],
    },
    intermediateReps: {
      type: String,
      required: [true, 'Please provide intermediate reps'],
    },
    advancedReps: {
      type: String,
      required: [true, 'Please provide advanced reps'],
    },
    steps: {
      type: [String],
      required: [true, 'Please provide steps'],
    },
    // Baseline calories burned per 10 minutes at moderate intensity.
    // The Workout pre-save hook scales this up/down by difficulty multiplier.
    caloriesPer10Min: {
      type: Number,
      default: 50,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Exercise', exerciseSchema);
