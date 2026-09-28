const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema(
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
    summary: {
      type: String,
      required: true,
    },
    keyPoints: {
      type: [String],
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

summarySchema.index({ materialId: 1, createdAt: -1 });

module.exports = mongoose.model('Summary', summarySchema);
