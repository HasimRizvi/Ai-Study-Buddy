const fs = require('fs');
const path = require('path');
const Material = require('../models/Material');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { UPLOAD_DIR } = require('../middleware/upload');
const { logActivity } = require('./authController');

const getMaterials = asyncHandler(async (req, res) => {
  const { subject, search } = req.query;
  const filter = { userId: req.user._id };
  if (subject) filter.subject = new RegExp(subject, 'i');
  if (search) filter.title = new RegExp(search, 'i');

  const materials = await Material.find(filter).sort({ createdAt: -1 });

  const enriched = await Promise.all(
    materials.map(async (m) => ({
      ...m.toObject(),
      hasSummary: (await Summary.countDocuments({ materialId: m._id })) > 0,
      flashcardCount: await Flashcard.countDocuments({ materialId: m._id }),
      hasQuiz: (await Quiz.countDocuments({ materialId: m._id })) > 0,
    }))
  );

  res.json({ success: true, count: enriched.length, materials: enriched });
});

const getMaterialById = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
  if (!material) throw ApiError.notFound('Study material not found');

  const [summary, flashcards, quizzes] = await Promise.all([
    Summary.find({ materialId: material._id }).sort({ createdAt: -1 }),
    Flashcard.find({ materialId: material._id }).sort({ createdAt: -1 }),
    Quiz.find({ materialId: material._id }).sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    material,
    summary: summary[0] || null,
    summaries: summary,
    flashcards,
    quizzes,
  });
});

const createMaterial = asyncHandler(async (req, res) => {
  const { title, subject, content, tags } = req.body;

  if (!title || !subject || !content) {
    throw ApiError.badRequest('Title, subject and content are required');
  }
  if (String(content).trim().length < 30) {
    throw ApiError.badRequest('Content must be at least 30 characters long');
  }

  const material = await Material.create({
    userId: req.user._id,
    title,
    subject,
    content,
    sourceType: 'text',
    tags: Array.isArray(tags)
      ? tags
      : String(tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
  });

  await logActivity(req.user._id, 'CREATE_MATERIAL', material.title);

  res.status(201).json({
    success: true,
    message: 'Study material saved successfully',
    material,
  });
});

const uploadMaterial = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file was uploaded. Attach a .txt, .md, .csv or .json file.');
  }

  const { title, subject } = req.body;
  if (!subject) {
    fs.unlink(req.file.path, () => {});
    throw ApiError.badRequest('Subject is required');
  }

  let content;
  try {
    content = fs.readFileSync(req.file.path, 'utf-8');
  } catch (error) {
    throw ApiError.internal('Uploaded file could not be read');
  }

  if (String(content).trim().length < 30) {
    fs.unlink(req.file.path, () => {});
    throw ApiError.badRequest('Uploaded file does not contain enough text to process');
  }

  const material = await Material.create({
    userId: req.user._id,
    title: title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
    subject,
    content,
    sourceType: 'file',
    fileName: req.file.originalname,
    storedFileName: req.file.filename,
    fileSize: req.file.size,
  });

  await logActivity(req.user._id, 'UPLOAD_MATERIAL', material.title);

  res.status(201).json({
    success: true,
    message: 'File uploaded and saved as study material',
    material,
  });
});

const updateMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
  if (!material) throw ApiError.notFound('Study material not found');

  const { title, subject, content, tags } = req.body;
  if (title) material.title = title;
  if (subject) material.subject = subject;
  if (content) material.content = content;
  if (tags) material.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim());

  await material.save();
  res.json({ success: true, message: 'Study material updated', material });
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, userId: req.user._id }).select('+storedFileName');
  if (!material) throw ApiError.notFound('Study material not found');

  if (material.storedFileName) {
    const filePath = path.join(UPLOAD_DIR, path.basename(material.storedFileName));
    fs.unlink(filePath, () => {});
  }

  await Promise.all([
    Summary.deleteMany({ materialId: material._id }),
    Flashcard.deleteMany({ materialId: material._id }),
    Quiz.deleteMany({ materialId: material._id }),
  ]);
  await material.deleteOne();

  await logActivity(req.user._id, 'DELETE_MATERIAL', material.title);

  res.json({ success: true, message: 'Study material and its AI resources were deleted' });
});

const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Material.distinct('subject', { userId: req.user._id });
  res.json({ success: true, subjects });
});

module.exports = {
  getMaterials,
  getMaterialById,
  createMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  getSubjects,
};
