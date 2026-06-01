import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import Exercise from '../models/Exercise.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// caloriesPer10Min = baseline calories burned per 10 minutes at moderate (intermediate) intensity.
// The Workout model's pre-save hook multiplies this by a difficulty multiplier:
//   beginner × 0.75 | intermediate × 1.00 | advanced × 1.30
const exercisesData = [
  {
    name: 'Push Ups',
    muscleGroup: 'Chest, Triceps',
    description: 'Bodyweight upper body push exercise',
    caloriesPer10Min: 55, // bodyweight calisthenics, moderate upper-body
    image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80',
    beginnerReps: '10 reps × 3 sets',
    intermediateReps: '15 reps × 4 sets',
    advancedReps: '20 reps × 5 sets',
    steps: ['Start in a high plank position with your hands slightly wider than shoulder-width', 'Lower your body until your chest is just above the floor', 'Push yourself back up to the starting position', 'Repeat for the desired number of reps'],
  },
  {
    name: 'Squats',
    muscleGroup: 'Legs, Glutes',
    description: 'Lower body strength exercise',
    caloriesPer10Min: 65, // large muscle groups = higher burn
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80',
    beginnerReps: '12 reps × 3 sets',
    intermediateReps: '15 reps × 4 sets',
    advancedReps: '20 reps × 5 sets',
    steps: ['Stand with your feet shoulder-width apart', 'Lower your hips as if you are sitting in a chair', 'Keep your chest up and your back straight', 'Push back up to the starting position'],
  },
  {
    name: 'Bench Press',
    muscleGroup: 'Chest',
    description: 'Strength training chest press',
    caloriesPer10Min: 60, // barbell compound — moderate-high burn
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80',
    beginnerReps: '8 reps × 3 sets',
    intermediateReps: '10 reps × 4 sets',
    advancedReps: '12 reps × 5 sets',
    steps: ['Lie flat on the bench with your feet firmly on the ground', 'Grip the barbell slightly wider than shoulder-width', 'Lower the bar to your chest', 'Press the bar back up until your arms are fully extended'],
  },
  {
    name: 'Deadlift',
    muscleGroup: 'Back, Legs',
    description: 'Full body strength lift',
    caloriesPer10Min: 80, // full-body compound = highest burn
    image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&q=80',
    beginnerReps: '8 reps × 3 sets',
    intermediateReps: '10 reps × 4 sets',
    advancedReps: '10 reps × 5 sets',
    steps: ['Stand with feet hip-width apart, barbell over your mid-foot', 'Bend at your hips and knees to grab the bar', 'Keep your back straight and lift the bar by extending your hips and knees', 'Lower the bar back to the ground under control'],
  },
  {
    name: 'Pull Ups',
    muscleGroup: 'Back, Biceps',
    description: 'Upper body pulling exercise',
    caloriesPer10Min: 70, // compound pull — high relative burn
    image: 'https://images.unsplash.com/photo-1598971484521-ea5fb366db70?auto=format&fit=crop&q=80',
    beginnerReps: '5 reps × 3 sets',
    intermediateReps: '10 reps × 4 sets',
    advancedReps: '15 reps × 4 sets',
    steps: ['Grab the pull-up bar with your palms facing away from you', 'Hang fully extended', 'Pull yourself up until your chin is above the bar', 'Lower yourself back down in a controlled manner'],
  },
  {
    name: 'Plank',
    muscleGroup: 'Core',
    description: 'Core stability exercise',
    caloriesPer10Min: 30, // isometric — lower burn than dynamic exercises
    image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&q=80',
    beginnerReps: '30 seconds × 3 sets',
    intermediateReps: '60 seconds × 3 sets',
    advancedReps: '90 seconds × 3 sets',
    steps: ['Start on the floor on your forearms and toes', 'Keep your body in a straight line from your head to your heels', 'Engage your core and hold the position', 'Do not let your hips sag or rise'],
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymfit-pro');

    // Clear existing exercises and users
    await Exercise.deleteMany({});
    await User.deleteMany({});

    // Insert new exercises
    const createdExercises = await Exercise.insertMany(exercisesData);

    // Insert admin user
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('admin123', salt);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@gymfitpro.com',
      password: hashedPassword,
      role: 'admin',
    });
    
    // Have to bypass the pre-save hook since it hashes the password again if we just save.
    // Actually, since we're providing pre-hashed, we should insertMany or create.
    await User.collection.insertOne({
      name: 'Admin User',
      email: 'admin@gymfitpro.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
    });

    // Insert regular user
    const hashedUserPassword = await bcryptjs.hash('user123', salt);
    await User.collection.insertOne({
      name: 'Regular User',
      email: 'user@gymfitpro.com',
      password: hashedUserPassword,
      role: 'user',
      createdAt: new Date(),
    });

    console.log(`✅ Successfully seeded ${createdExercises.length} exercises!`);
    console.log(`✅ Successfully seeded Admin (admin@gymfitpro.com / admin123) and User (user@gymfitpro.com / user123)`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
