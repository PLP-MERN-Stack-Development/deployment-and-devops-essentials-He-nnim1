const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { createAppError } = require('../utils/AppError');

const handleValidation = (validations) => [
  ...validations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formatted = errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }));
      return next(createAppError(400, formatted[0].message));
    }
    return next();
  },
];

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validatePostCreate = handleValidation([
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').optional().isLength({ max: 200 }).withMessage('Excerpt cannot exceed 200 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
]);

const validatePostUpdate = handleValidation([
  param('id').custom((value) => {
    if (!isObjectId(value)) {
      throw new Error('Post ID must be a valid ID');
    }
    return true;
  }),
  body('title').optional().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('excerpt').optional().isLength({ max: 200 }).withMessage('Excerpt cannot exceed 200 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
]);

const validateCommentCreate = handleValidation([
  param('id').custom((value) => {
    if (!isObjectId(value)) {
      throw new Error('Post ID must be a valid ID');
    }
    return true;
  }),
  body('content').trim().notEmpty().withMessage('Comment content is required'),
]);

const validateCategoryCreate = handleValidation([
  body('name').trim().notEmpty().withMessage('Category name is required'),
]);

const validateAuthRegister = handleValidation([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]);

const validateAuthLogin = handleValidation([
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]);

const validatePagination = handleValidation([
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
]);

module.exports = {
  validatePostCreate,
  validatePostUpdate,
  validateCommentCreate,
  validateCategoryCreate,
  validateAuthRegister,
  validateAuthLogin,
  validatePagination,
};

