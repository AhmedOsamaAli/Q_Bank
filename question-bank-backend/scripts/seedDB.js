require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Question = require('../models/Question');
const StudentAnswer = require('../models/StudentAnswer');
const bcrypt = require('bcryptjs');

// Connect to DB
connectDB();

// Clear existing data
const clearDatabase = async () => {
  await User.deleteMany();
  await Subject.deleteMany();
  await Question.deleteMany();
  await StudentAnswer.deleteMany();
  console.log('Database cleared');
};

// Seed data
const seedDatabase = async () => {
  try {
    // Create admin user
    const admin = await User.create({
      email: 'admin@questionbank.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create student user
    const student = await User.create({
      email: 'student@questionbank.com',
      password: 'student123',
      role: 'student'
    });

    // Create subjects
    const math = await Subject.create({
      name: 'Mathematics',
      description: 'Algebra, Calculus, Geometry'
    });

    const cs = await Subject.create({
      name: 'Computer Science',
      description: 'Programming, Algorithms, Data Structures'
    });

    // Create questions
    const questions = await Question.create([
      // Math questions
      {
        subjectId: math._id,
        chapter: 'Algebra',
        level: 'easy',
        type: 'true_false',
        questionText: '2 + 2 equals 4',
        correctAnswer: 'true',
        points: 1
      },
      {
        subjectId: math._id,
        chapter: 'Calculus',
        level: 'medium',
        type: 'mcq',
        questionText: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2'],
        correctAnswer: '2x',
        points: 2
      },
      {
        subjectId: math._id,
        chapter: 'Geometry',
        level: 'hard',
        type: 'open_text',
        questionText: 'Explain the Pythagorean theorem',
        modelAnswer: 'In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.',
        points: 3
      },
      // CS questions
      {
        subjectId: cs._id,
        chapter: 'Programming',
        level: 'easy',
        type: 'complete',
        questionText: 'In JavaScript, the === operator performs ______ equality check',
        correctAnswer: 'strict',
        points: 1
      },
      {
        subjectId: cs._id,
        chapter: 'Algorithms',
        level: 'medium',
        type: 'mcq',
        questionText: 'What is the time complexity of binary search?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 'O(log n)',
        points: 2
      },
      {
        subjectId: cs._id,
        chapter: 'Data Structures',
        level: 'hard',
        type: 'open_text',
        questionText: 'Describe the difference between a stack and a queue',
        modelAnswer: 'A stack is LIFO (Last In First Out) while a queue is FIFO (First In First Out)',
        points: 3
      }
    ]);

    // Create some student answers
    await StudentAnswer.create([
      {
        studentId: student._id,
        questionId: questions[0]._id,
        answer: 'true',
        isCorrect: true,
        feedback: 'Correct answer!',
        score: 1
      },
      {
        studentId: student._id,
        questionId: questions[1]._id,
        answer: 'x',
        isCorrect: false,
        feedback: 'Incorrect, the derivative of x² is 2x',
        score: 0
      }
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// Run the seed
const runSeed = async () => {
  await clearDatabase();
  await seedDatabase();
};

runSeed();