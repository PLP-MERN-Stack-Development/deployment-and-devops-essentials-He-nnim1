const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validateCategoryCreate } = require('../middleware/validation');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorize('admin'), validateCategoryCreate, createCategory);

module.exports = router;

