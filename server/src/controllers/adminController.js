const User = require('../models/User');
const Material = require('../models/Material');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const gemini = require('../utils/gemini');

const getStats = asyncHandler(async (req, res) => {
  const scope = { userId: req.user._id };

  const [userCount, materialCount, summaryCount, flashcardCount, quizCount, planCount, activities] =
    await Promise.all([
      User.countDocuments({}),
      Material.countDocuments({}),
      Summary.countDocuments({}),
      Flashcard.countDocuments({}),
      Quiz.countDocuments({}),
      StudyPlan.countDocuments({}),
      Activity.find({}).sort({ createdAt: -1 }).limit(20).populate('userId', 'name email role'),
    ]);

  const perUser = await User.find({}).select('name email role isActive createdAt lastLoginAt').sort({ createdAt: -1 });

  res.json({
    success: true,
    stats: {
      users: userCount,
      materials: materialCount,
      summaries: summaryCount,
      flashcards: flashcardCount,
      quizzes: quizCount,
      studyPlans: planCount,
      aiEngine: gemini.engineStatus(),
    },
    users: perUser,
    activities,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot deactivate your own administrator account');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: Boolean(isActive) },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}`, user });
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'admin'].includes(role)) throw ApiError.badRequest('Role must be student or admin');
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
  if (!user) throw ApiError.notFound('User not found');

  res.json({ success: true, message: `Role updated to ${role}`, user });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const materials = await Material.find({ userId: user._id }).select('_id');
  const ids = materials.map((m) => m._id);

  await Promise.all([
    Summary.deleteMany({ materialId: { $in: ids } }),
    Flashcard.deleteMany({ materialId: { $in: ids } }),
    Quiz.deleteMany({ materialId: { $in: ids } }),
    Material.deleteMany({ userId: user._id }),
    StudyPlan.deleteMany({ userId: user._id }),
    Activity.deleteMany({ userId: user._id }),
  ]);

  await user.deleteOne();
  res.json({ success: true, message: 'User and all associated data removed' });
});

module.exports = { getStats, getUsers, updateUserStatus, changeUserRole, deleteUser };
