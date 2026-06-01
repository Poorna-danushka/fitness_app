import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    // Sort pinned first, then by date descending
    const notifications = await Notification.find({}).sort({ pinned: -1, createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, pinned } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type,
      pinned,
      createdBy: req.user.name || 'Admin',
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a notification
// @route   PUT /api/notifications/:id
// @access  Private/Admin
export const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const { title, message, type, pinned } = req.body;

    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (type !== undefined) notification.type = type;
    if (pinned !== undefined) notification.pinned = pinned;

    const updatedNotification = await notification.save();
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();

    // Optionally, remove this notification ID from all users' readNotifications arrays
    await User.updateMany(
      { readNotifications: req.params.id },
      { $pull: { readNotifications: req.params.id } }
    );

    res.status(200).json({ message: 'Notification removed' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark a single notification as read
// @route   POST /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.readNotifications.includes(req.params.id)) {
      user.readNotifications.push(req.params.id);
      await user.save();
    }

    res.status(200).json({ message: 'Notification marked as read', readNotifications: user.readNotifications });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notifications = await Notification.find({}, '_id');
    const allIds = notifications.map(n => n._id);

    user.readNotifications = allIds;
    await user.save();

    res.status(200).json({ message: 'All notifications marked as read', readNotifications: user.readNotifications });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
