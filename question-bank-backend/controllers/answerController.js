const Question = require('../models/Question');
const StudentAnswer = require('../models/StudentAnswer');
const ErrorResponse = require('../utils/errorHandler');
const { evaluateOpenEndedAnswer } = require('../config/gemini');

// @desc    Submit answer
// @route   POST /api/answers
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    const studentId = req.user.id;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return next(new ErrorResponse('Question not found', 404));
    }

    // Check if student already answered this question
    const existingAnswer = await StudentAnswer.findOne({
      studentId,
      questionId
    });

    if (existingAnswer) {
      return next(new ErrorResponse('You have already answered this question', 400));
    }

    let isCorrect = false;
    let feedback = '';
    let score = 0;

    // Evaluate answer based on question type
    if (question.type === 'open_text') {
      // Use Gemini API for open-ended questions
      const evaluation = await evaluateOpenEndedAnswer(question.modelAnswer, answer);
      isCorrect = evaluation.isCorrect;
      feedback = evaluation.feedback;
      score = isCorrect ? question.points : 0;
    } else {
      // For other types, compare with correctAnswer
      isCorrect = answer === question.correctAnswer;
      feedback = isCorrect ? 'Correct answer!' : 'Incorrect answer';
      score = isCorrect ? question.points : 0;
    }

    // Save student answer
    const studentAnswer = await StudentAnswer.create({
      studentId,
      questionId,
      answer,
      isCorrect,
      feedback,
      score
    });

    res.status(201).json({
      success: true,
      data: {
        isCorrect,
        feedback,
        score
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's answer history
// @route   GET /api/answers
// @access  Private
exports.getAnswerHistory = async (req, res, next) => {
  try {
    const answers = await StudentAnswer.find({ studentId: req.user.id })
      .populate({
        path: 'questionId',
        select: 'questionText type subjectId chapter level'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: answers.length,
      data: answers
    });
  } catch (err) {
    next(err);
  }
};