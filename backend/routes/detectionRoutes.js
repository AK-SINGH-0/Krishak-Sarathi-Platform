const express = require('express');
const router = express.Router();
const { createDetection } = require('../controllers/detectionController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createDetection);

module.exports = router;
