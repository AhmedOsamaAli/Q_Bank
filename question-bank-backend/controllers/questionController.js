const mongoose = require('mongoose');
const Question = require('../models/Question');
const StudentAnswer = require('../models/StudentAnswer');
const ErrorResponse = require('../utils/errorHandler');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'solved'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Check if solved filter is applied
    if (req.query.solved) {
      const answers = await StudentAnswer.find({ studentId: req.user.id });
      const answeredQuestionIds = answers.map(answer => answer.questionId);

      if (req.query.solved === 'true') {
        reqQuery._id = { $in: answeredQuestionIds };
      } else if (req.query.solved === 'false') {
        reqQuery._id = { $nin: answeredQuestionIds };
      }
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Question.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Question.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const questions = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      pagination,
      data: questions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question ID format'
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: `Question not found with id of ${id}`
      });
    }

    // Don't send correct answer to student
    if (req.user.role !== 'admin') {
      question.correctAnswer = undefined;
      question.modelAnswer = undefined;
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const question = await Question.create(req.body);

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: `Question not found with id of ${req.params.id}`
      });
    }

    await Question.deleteOne({ _id: req.params.id }); // Use deleteOne instead of remove

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  deleteQuestion,
};