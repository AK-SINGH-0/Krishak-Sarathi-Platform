const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, location, farmSize, primaryCrops } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      location,
      farmSize,
      primaryCrops,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      farmSize: user.farmSize,
      primaryCrops: user.primaryCrops,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc   Login user & get token
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      farmSize: user.farmSize,
      primaryCrops: user.primaryCrops,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc   Get logged-in user's profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  return res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
