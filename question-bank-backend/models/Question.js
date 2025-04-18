const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true
  },
  chapter: {
    type: String,
    required: [true, 'Please add a chapter']
  },
  level: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Please add a difficulty level']
  },
  type: {
    type: String,
    enum: ['true_false', 'mcq', 'open_text', 'complete'],
    required: [true, 'Please add a question type']
  },
  questionText: {
    type: String,
    required: function() {
      return !this.questionImage;
    }
  },
  questionImage: {
    type: String
  },
  options: {
    type: [String],
    required: function() {
      return this.type === 'mcq';
    }
  },
  correctAnswer: {
    type: String,
    required: function() {
      return this.type !== 'open_text';
    }
  },
  modelAnswer: {
    type: String,
    required: function() {
      return this.type === 'open_text';
    }
  },
  points: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);