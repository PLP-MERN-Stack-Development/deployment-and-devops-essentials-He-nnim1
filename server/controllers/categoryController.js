const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const { createAppError } = require('../utils/AppError');

exports.getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  res.json({
    success: true,
    data: categories,
  });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (existing) {
    throw createAppError(400, 'Category already exists');
  }

  const category = await Category.create({ name, description });

  res.status(201).json({
    success: true,
    data: category,
  });
});

