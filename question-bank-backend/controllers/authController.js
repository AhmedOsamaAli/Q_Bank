const User = require('../models/User');
const ErrorResponse = require('../utils/errorHandler');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Create a new user
    const user = await User.create({
      email,
      password
    });

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    if (err.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user with that email'
      });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Hash the temporary password and update the user
    user.password = tempPassword;
    await user.save();

    // Send the temporary password via email
    const message = `Your new password is: ${tempPassword}\n\nHope to see you.`;

    await sendEmail({
      email: user.email,
      subject: 'Your Temporary Password',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Temporary password sent to your email'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      userId: user._id,
      role: user.role
    });
};