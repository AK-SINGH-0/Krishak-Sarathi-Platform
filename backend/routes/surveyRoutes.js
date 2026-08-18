const express = require('express');
const router = express.Router();
const { submitSurvey } = require('../controllers/surveyController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, submitSurvey);

module.exports = router;
