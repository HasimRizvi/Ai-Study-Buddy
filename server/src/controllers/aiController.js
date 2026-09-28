const Material = require('../models/Material');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const gemini = require('../utils/gemini');
const { logActivity } = require('./authController');

const loadMaterial = async (req) => {
  const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
  if (!material) throw ApiError.notFound('Study material not found');
  return material;
};

const generateSummary = asyncHandler(async (req, res) => {
  const material = await loadMaterial(req);

  const result = await gemini.generateSummary(material.title, material.subject, material.content);

  const summary = await Summary.create({
    userId: req.user._id,
    materialId: material._id,
    summary: result.summary,
    keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
    generatedBy: result.generatedBy,
  });

  material.aiUsage.summary = true;
  await material.save();

  await logActivity(req.user._id, 'GENERATE_SUMMARY', material.title, { engine: result.generatedBy });

  res.status(201).json({
    success: true,
    message: 'AI summary generated successfully',
    engine: result.generatedBy,
    summary,
  });
});

const generateFlashcards = asyncHandler(async (req, res) => {
  const material = await loadMaterial(req);
  const count = Number(req.body.count) || 8;

  const result = await gemini.generateFlashcards(
    material.title,
    material.subject,
    material.content,
    count
  );

  let cards = Array.isArray(result.cards) ? result.cards : [];

  if (cards.length === 0) {
    const { buildFlashcards } = require('../utils/demoEngine');
    cards = buildFlashcards(material.content, count);
  }

  await Flashcard.deleteMany({ materialId: material._id, userId: req.user._id });
  const docs = await Flashcard.insertMany(
    cards.slice(0, 20).map((c) => ({
      userId: req.user._id,
      materialId: material._id,
      question: String(c.question || '').slice(0, 500),
      answer: String(c.answer || '').slice(0, 2000),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(c.difficulty) ? c.difficulty : 'Medium',
    }))
  );

  material.aiUsage.flashcards = docs.length;
  await material.save();

  await logActivity(req.user._id, 'GENERATE_FLASHCARDS', material.title, { count: docs.length });

  res.status(201).json({
    success: true,
    message: `${docs.length} flashcards generated successfully`,
    engine: result.generatedBy,
    flashcards: docs,
  });
});

const generateQuiz = asyncHandler(async (req, res) => {
  const material = await loadMaterial(req);
  const count = Number(req.body.count) || 5;

  const result = await gemini.generateQuiz(material.title, material.subject, material.content, count);

  let questions = Array.isArray(result.questions) ? result.questions : [];

  if (questions.length === 0) {
    const { buildQuiz } = require('../utils/demoEngine');
    questions = buildQuiz(material.content, count);
  }

  const valid = questions
    .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer)
    .map((q) => {
      const options = q.options.map((o) => String(o));
      let correct = String(q.correctAnswer);
      const match = options.find((o) => o.toLowerCase() === correct.toLowerCase());
      if (!match) return null;
      correct = match;
      return {
        question: String(q.question).slice(0, 500),
        options: options.map((o) => o.slice(0, 300)),
        correctAnswer: correct,
        explanation: String(q.explanation || '').slice(0, 1000),
      };
    })
    .filter(Boolean);

  if (valid.length === 0) throw ApiError.internal('AI could not generate valid quiz questions. Try a longer study material.');

  const quiz = await Quiz.create({
    userId: req.user._id,
    materialId: material._id,
    title: `${material.subject} - ${material.title} Quiz`,
    questions: valid,
    generatedBy: result.generatedBy,
  });

  material.aiUsage.quiz = true;
  await material.save();

  await logActivity(req.user._id, 'GENERATE_QUIZ', material.title, { count: valid.length });

  res.status(201).json({
    success: true,
    message: `Quiz generated with ${valid.length} questions`,
    engine: result.generatedBy,
    quiz,
  });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers)) throw ApiError.badRequest('Answers must be an array');

  const quiz = await Quiz.findOne({ _id: req.params.quizId, userId: req.user._id });
  if (!quiz) throw ApiError.notFound('Quiz not found');

  let score = 0;
  const results = quiz.questions.map((q, i) => {
    const correct = answers[i] === q.correctAnswer;
    if (correct) score += 1;
    return {
      question: q.question,
      yourAnswer: answers[i] || null,
      correctAnswer: q.correctAnswer,
      correct,
      explanation: q.explanation,
    };
  });

  const total = quiz.questions.length;
  const percentage = total ? Math.round((score / total) * 100) : 0;

  quiz.attempts.push({ score, total, percentage });
  await quiz.save();

  await logActivity(req.user._id, 'SUBMIT_QUIZ', quiz.title, { score, total, percentage });

  res.json({
    success: true,
    score,
    total,
    percentage,
    results,
  });
});

const getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ userId: req.user._id })
    .populate('materialId', 'title subject')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: quizzes.length, quizzes });
});

const getFlashcards = asyncHandler(async (req, res) => {
  const flashcards = await Flashcard.find({ userId: req.user._id })
    .populate('materialId', 'title subject')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: flashcards.length, flashcards });
});

const generateStudyPlan = asyncHandler(async (req, res) => {
  const { subject, examDate, availableHoursPerDay, weakAreas, materialId } = req.body;

  if (!subject) throw ApiError.badRequest('Subject is required');
  if (!examDate) throw ApiError.badRequest('Exam date is required');

  const exam = new Date(examDate);
  if (Number.isNaN(exam.getTime())) throw ApiError.badRequest('Exam date is invalid');
  if (exam.getTime() < Date.now()) throw ApiError.badRequest('Exam date must be in the future');

  let content = '';
  let linkedMaterial = null;
  if (materialId) {
    linkedMaterial = await Material.findOne({ _id: materialId, userId: req.user._id });
    if (!linkedMaterial) throw ApiError.notFound('Linked study material not found');
    content = linkedMaterial.content;
  }

  const result = await gemini.generateStudyPlan({
    subject,
    examDate: exam,
    availableHoursPerDay: Number(availableHoursPerDay) || 2,
    weakAreas: Array.isArray(weakAreas) ? weakAreas : String(weakAreas || '').split(',').map((t) => t.trim()).filter(Boolean),
    content,
  });

  const plan = await StudyPlan.create({
    userId: req.user._id,
    subject,
    examDate: exam,
    availableHoursPerDay: Number(availableHoursPerDay) || 2,
    weakAreas: Array.isArray(weakAreas) ? weakAreas : String(weakAreas || '').split(',').map((t) => t.trim()).filter(Boolean),
    studyPlan: result.studyPlan || result.plan,
    dailyTasks: Array.isArray(result.dailyTasks) ? result.dailyTasks : [],
    generatedBy: result.generatedBy,
  });

  await logActivity(req.user._id, 'GENERATE_STUDY_PLAN', subject, { engine: result.generatedBy });

  res.status(201).json({
    success: true,
    message: 'Personalised study plan generated successfully',
    engine: result.generatedBy,
    plan,
  });
});

const getStudyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ userId: req.user._id }).sort({ examDate: 1 });
  res.json({ success: true, count: plans.length, plans });
});

const deleteStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!plan) throw ApiError.notFound('Study plan not found');
  res.json({ success: true, message: 'Study plan deleted' });
});

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  submitQuiz,
  getQuizzes,
  getFlashcards,
  generateStudyPlan,
  getStudyPlans,
  deleteStudyPlan,
};
