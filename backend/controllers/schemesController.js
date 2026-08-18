const Scheme = require('../models/Scheme');

// @desc   Get all government schemes (optionally filter by category/search)
// @route  GET /api/schemes?search=&category=
// @access Public
const getSchemes = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (category && category.toLowerCase() !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const schemes = await Scheme.find(query).sort({ createdAt: -1 });
    return res.json(schemes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getSchemes };
