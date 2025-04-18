const express = require('express');
const {
  getSubjects,
  createSubject
} = require('../controllers/subjectController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getSubjects); // No need to pass `next` explicitly
router.post('/', protect, adminOnly, createSubject); // Middleware and controller will receive `next` automatically

module.exports = router;