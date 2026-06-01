import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const workoutSchema = new mongoose.Schema({
  duration: Number,
  caloriesBurned: Number
}, { strict: false });

const Workout = mongoose.model('Workout', workoutSchema);

async function fixCalories() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const workouts = await Workout.find();
  console.log(`Found ${workouts.length} workouts`);
  
  let updated = 0;
  for (const w of workouts) {
    if (!w.caloriesBurned || w.caloriesBurned === 0) {
      // 150 kcal per 10 mins -> 15 kcal per min
      const duration = w.duration || 15;
      w.caloriesBurned = Math.round(15 * duration);
      await w.save();
      updated++;
    }
  }

  console.log(`Updated ${updated} workouts.`);
  process.exit(0);
}

fixCalories().catch(console.error);
