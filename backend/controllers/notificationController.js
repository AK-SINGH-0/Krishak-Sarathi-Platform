const Notification = require('../models/Notification');

// @desc   Get notifications for current user (+ broadcast notifications)
// @route  GET /api/notifications
// @access Public (optionalAuth)
const getNotifications = async (req, res) => {
  try {
    const query = req.user ? { $or: [{ user: req.user._id }, { user: null }] } : { user: null };
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    const unreadCount = notifications.filter((n) => !n.read).length;
    return res.json({ notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc   Mark a notification as read
// @route  PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead };
