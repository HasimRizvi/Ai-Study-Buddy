const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    availableHoursPerDay: {
      type: Number,
      default: 2,
      min: [0.5, 'Minimum 0.5 hours per day'],
      max: [16, 'Maximum 16 hours per day'],
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    studyPlan: {
      type: String,
      required: true,
    },
    dailyTasks: {
      type: [
        {
          day: Number,
          date: Date,
          focus: String,
          tasks: [String],
          duration: String,
        },
      ],
      default: [],
    },
    generatedBy: {
      type: String,
      enum: ['gemini', 'demo'],
      default: 'gemini',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
