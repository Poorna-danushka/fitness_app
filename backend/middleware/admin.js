import User from '../models/User.js';

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status' });
  }
};

export default isAdmin;
