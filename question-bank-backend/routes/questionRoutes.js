const express = require('express');
const questionController = require('../controllers/questionController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, questionController.getQuestions);
router.post('/', protect, adminOnly, questionController.createQuestion);

router.get('/:id', protect, questionController.getQuestion);
router.delete('/:id', protect, adminOnly, questionController.deleteQuestion);

module.exports = router;