import mongoose from 'mongoose';

// Calorie multipliers per difficulty level.
// These scale the exercise's baseline caloriesPer10Min up or down.
const DIFFICULTY_MULTIPLIER = {
  beginner:     0.75,
  intermediate: 1.00,
  advanced:     1.30,
};

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    sets: {
      type: Number,
      min: 1,
      default: null,
    },
    reps: {
      type: Number,
      min: 1,
      default: null,
    },
    // beginner | intermediate | advanced — sourced from PackageExercise.difficulty
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedForDay: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-calculate calories before save.
// Formula: (exercise.caloriesPer10Min × difficultyMultiplier × duration) / 10
workoutSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('duration') || this.isModified('exerciseId') || this.isModified('difficulty')) {
    try {
      const Exercise = mongoose.model('Exercise');
      const exercise = await Exercise.findById(this.exerciseId);
      if (exercise) {
        const basePer10   = exercise.caloriesPer10Min || 50;
        const multiplier  = DIFFICULTY_MULTIPLIER[this.difficulty] ?? 1.0;
        this.caloriesBurned = Math.round((basePer10 * multiplier * this.duration) / 10);
      }
    } catch (e) {
      // non-critical — leave caloriesBurned as-is
    }
  }
  next();
});

export default mongoose.model('Workout', workoutSchema);
