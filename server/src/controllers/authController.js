const User = require('../models/User');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendToken } = require('../middleware/auth');

const logActivity = async (userId, action, resource, meta) => {
  try {
    await Activity.create({ userId, action, resource, meta });
  } catch (error) {
    console.warn(`[Activity] ${error.message}`);
  }
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, year, college } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email and password are required');
  }
  if (String(password).length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters long');
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    throw ApiError.badRequest('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    department: department || undefined,
    year: year || undefined,
    college: college || undefined,
  });

  await logActivity(user._id, 'REGISTER', 'auth');

  const token = sendToken(user, res);
  res.status(201).json({
    success: true,
    message: 'Account created successfully. Welcome to AI StudyBuddy!',
    token,
    user: user.toPublicJSON(),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated. Please contact the administrator.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  await logActivity(user._id, 'LOGIN', 'auth');

  const token = sendToken(user, res);
  res.json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: user.toPublicJSON(),
  });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', null, { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, department, year, college } = req.body;
  const user = req.user;

  if (name) user.name = name;
  if (department) user.department = department;
  if (year) user.year = year;
  if (college) user.college = college;

  await user.save();
  res.json({ success: true, message: 'Profile updated successfully', user: user.toPublicJSON() });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Current password and new password are required');
  }
  if (String(newPassword).length < 8) {
    throw ApiError.badRequest('New password must be at least 8 characters long');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword, logActivity };
