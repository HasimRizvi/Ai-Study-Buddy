const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [(v) => v.length === 4, 'Each question must have exactly 4 options'],
    },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
      index: true,
    },
    title: { type: String, default: 'Practice Quiz' },
    questions: {
      type: [questionSchema],
      default: [],
    },
    generatedBy: {
      type: String,
      enum: ['gemini', 'demo'],
      default: 'gemini',
    },
    attempts: {
      type: [
        {
          score: Number,
          total: Number,
          percentage: Number,
          attemptedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
