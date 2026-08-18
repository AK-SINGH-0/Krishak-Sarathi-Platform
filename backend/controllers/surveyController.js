const Survey = require('../models/Survey');

// @desc   Submit farmer survey
// @route  POST /api/survey
// @access Public (optionalAuth)
const submitSurvey = async (req, res) => {
  try {
    const { fullName, location, primaryCrop, biggestChallenge, advisorUsefulness, suggestions } = req.body;

    if (!fullName || !location || !primaryCrop || !biggestChallenge || !advisorUsefulness) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const survey = await Survey.create({
      user: req.user ? req.user._id : null,
      fullName,
      location,
      primaryCrop,
      biggestChallenge,
      advisorUsefulness,
      suggestions,
    });

    return res.status(201).json({ message: 'Survey submitted successfully', survey });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { submitSurvey };
