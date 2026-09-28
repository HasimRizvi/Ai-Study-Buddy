const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [80, 'Subject cannot exceed 80 characters'],
    },
    content: {
      type: String,
      required: [true, 'Study material content is required'],
    },
    sourceType: {
      type: String,
      enum: ['text', 'file'],
      default: 'text',
    },
    fileName: {
      type: String,
    },
    storedFileName: {
      type: String,
      select: false,
    },
    fileSize: {
      type: Number,
    },
    tags: {
      type: [String],
      default: [],
    },
    aiUsage: {
      summary: { type: Boolean, default: false },
      flashcards: { type: Number, default: 0 },
      quiz: { type: Boolean, default: false },
      studyPlan: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

materialSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema);
