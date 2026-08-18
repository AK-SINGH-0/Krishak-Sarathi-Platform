const Detection = require('../models/Detection');

// @desc   Save a crop disease detection result
// @route  POST /api/detections
// @access Optional auth (saved against the account when logged in)
const createDetection = async (req, res) => {
  try {
    const { crop, disease, confidence, severity } = req.body;

    if (!crop || !disease) {
      return res.status(400).json({ message: 'Crop and disease are required' });
    }

    const detection = await Detection.create({
      user: req.user ? req.user._id : null,
      crop,
      disease,
      confidence,
      severity,
    });

    return res.status(201).json(detection);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createDetection };
