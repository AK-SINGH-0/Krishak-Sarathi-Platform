const User = require('../models/User');

// @desc   Update logged-in user's profile
// @route  PUT /api/users/me
// @access Private
const updateProfile = async (req, res) => {
  try {
    const fields = ['name', 'phone', 'location', 'farmSize', 'primaryCrops', 'preferredLanguage'];
    const updates = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile };
