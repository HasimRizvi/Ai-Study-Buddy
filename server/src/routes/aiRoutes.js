const express = require('express');
const {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  submitQuiz,
  getQuizzes,
  getFlashcards,
  generateStudyPlan,
  getStudyPlans,
  deleteStudyPlan,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/materials/:id/summarize', generateSummary);
router.post('/materials/:id/flashcards', generateFlashcards);
router.post('/materials/:id/quiz', generateQuiz);

router.get('/flashcards', getFlashcards);
router.get('/quizzes', getQuizzes);
router.post('/quizzes/:quizId/submit', submitQuiz);

router.post('/study-plan', generateStudyPlan);
router.get('/study-plan', getStudyPlans);
router.delete('/study-plan/:id', deleteStudyPlan);

module.exports = router;
