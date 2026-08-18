const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { optionalAuth, protect } = require('../middleware/auth');

router.get('/', optionalAuth, getNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
