const express = require('express');
const router = express.Router();
const { chat, getHistory } = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, chat);
router.get('/history', protect, getHistory);

module.exports = router;
