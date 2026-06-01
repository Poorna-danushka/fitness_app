import Exercise from '../models/Exercise.js';

// Get all exercises
export const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json({
      message: 'Exercises fetched successfully',
      count: exercises.length,
      exercises,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises', error: error.message });
  }
};

// Get single exercise
export const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json({
      message: 'Exercise fetched successfully',
      exercise,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercise', error: error.message });
  }
};

// Create exercise (admin only)
export const createExercise = async (req, res) => {
  try {
    const { name, muscleGroup, description, image, beginnerReps, intermediateReps, advancedReps, steps } = req.body;

    if (!name || !muscleGroup || !description || !image || !beginnerReps || !intermediateReps || !advancedReps || !steps) {
      console.error('Missing fields in createExercise:', req.body);
      return res.status(400).json({ message: 'Please provide all required fields', received: req.body });
    }

    const exercise = new Exercise({
      name,
      muscleGroup,
      description,
      image,
      beginnerReps,
      intermediateReps,
      advancedReps,
      steps,
    });

    await exercise.save();

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise,
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ message: 'Error creating exercise', error: error.message });
  }
};

// Update exercise (admin only)
export const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json({
      message: 'Exercise updated successfully',
      exercise,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating exercise', error: error.message });
  }
};

// Delete exercise (admin only)
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json({
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exercise', error: error.message });
  }
};
