import CompletedExercise from '../models/CompletedExercise.js';

export const markComplete = async (req, res) => {
  try {
    const { exerciseId } = req.body;
    const completed = new CompletedExercise({ userId: req.userId, exerciseId });
    await completed.save();
    res.status(201).json({ message: 'Exercise marked as complete', completed });
  } catch (error) {
    res.status(500).json({ message: 'Error marking exercise as complete' });
  }
};

export const getMyCompletedExercises = async (req, res) => {
  try {
    const completed = await CompletedExercise.find({ userId: req.userId }).populate('exerciseId');
    res.status(200).json({ count: completed.length, completed });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching completed exercises' });
  }
};
