const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  searchPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  validatePostCreate,
  validatePostUpdate,
  validateCommentCreate,
  validatePagination,
} = require('../middleware/validation');

const router = express.Router();

router.get('/', validatePagination, getPosts);
router.get('/search', searchPosts);
router.get('/:idOrSlug', getPost);

router.post('/', protect, upload.single('featuredImage'), validatePostCreate, createPost);
router.put('/:id', protect, upload.single('featuredImage'), validatePostUpdate, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/comments', protect, validateCommentCreate, addComment);

module.exports = router;

