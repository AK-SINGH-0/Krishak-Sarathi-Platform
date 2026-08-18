const User = require('../models/User');
const Detection = require('../models/Detection');
const Survey = require('../models/Survey');

// @desc   Public platform statistics shown on the About page
// @route  GET /api/stats
// @access Public
const getStats = async (req, res) => {
  try {
    const [farmers, crops, surveys] = await Promise.all([
      User.countDocuments(),
      Detection.distinct('crop'),
      Survey.countDocuments(),
    ]);

    return res.json({
      farmers,
      cropsMonitored: crops.length,
      surveys,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
