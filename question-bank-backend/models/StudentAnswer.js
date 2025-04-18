const mongoose = require('mongoose');

const StudentAnswerSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer']
  },
  isCorrect: {
    type: Boolean
  },
  feedback: {
    type: String
  },
  score: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Re-add the unique index
StudentAnswerSchema.index({ studentId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('StudentAnswer', StudentAnswerSchema);