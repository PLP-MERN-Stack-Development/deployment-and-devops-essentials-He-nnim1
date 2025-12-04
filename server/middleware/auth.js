const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');
const { createAppError } = require('../utils/AppError');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw createAppError(401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      throw createAppError(401, 'User not found');
    }
    next();
  } catch (error) {
    throw createAppError(401, 'Not authorized, token failed');
  }
});

const authorize = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw createAppError(403, 'You do not have permission to perform this action');
    }
    next();
  };

module.exports = {
  protect,
  authorize,
};

