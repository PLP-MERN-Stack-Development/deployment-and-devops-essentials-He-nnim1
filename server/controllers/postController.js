const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const { createAppError } = require('../utils/AppError');

const buildFilters = async ({ category, author, search }) => {
  const filters = {};

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filters.category = category;
    } else {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filters.category = categoryDoc._id;
      }
    }
  }

  if (author && mongoose.Types.ObjectId.isValid(author)) {
    filters.author = author;
  }

  if (search) {
    filters.$or = [
      { title: new RegExp(search, 'i') },
      { content: new RegExp(search, 'i') },
      { excerpt: new RegExp(search, 'i') },
    ];
  }

  return filters;
};

const removeFileIfExists = (filePath) => {
  if (!filePath) return;
  fs.promises
    .access(filePath, fs.constants.F_OK)
    .then(() => fs.promises.unlink(filePath))
    .catch(() => {});
};

const parseTags = (tagsInput) => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) {
    return tagsInput.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tagsInput === 'string') {
    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const parseBoolean = (value, defaultValue = true) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return defaultValue;
};

exports.getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const filters = await buildFilters({
    category: req.query.category,
    author: req.query.author,
    search: req.query.search,
  });

  const query = Post.find(filters)
    .populate('category', 'name slug')
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  const totalDocs = await Post.countDocuments(filters);
  const posts = await query.skip((page - 1) * limit).limit(limit);

  res.json({
    success: true,
    data: posts,
    pagination: {
      total: totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit) || 1,
    },
  });
});

exports.searchPosts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    throw createAppError(400, 'Search query is required');
  }

  const filters = await buildFilters({ search: q });
  const posts = await Post.find(filters)
    .populate('category', 'name slug')
    .populate('author', 'name email')
    .limit(20);

  res.json({
    success: true,
    data: posts,
  });
});

exports.getPost = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  let post;

  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    post = await Post.findById(idOrSlug);
  }

  if (!post) {
    post = await Post.findOne({ slug: idOrSlug });
  }

  if (!post) {
    throw createAppError(404, 'Post not found');
  }

  await post.incrementViewCount();

  const populatedPost = await post.populate([
    { path: 'category', select: 'name slug' },
    { path: 'author', select: 'name email' },
    { path: 'comments.user', select: 'name email' },
  ]);

  res.json({
    success: true,
    data: populatedPost,
  });
});

exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, isPublished } = req.body;

  let categoryId = category;
  if (category && !mongoose.Types.ObjectId.isValid(category)) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc) {
      throw createAppError(400, 'Category not found');
    }
    categoryId = categoryDoc._id;
  }

  const newPost = new Post({
    title,
    content,
    excerpt,
    category: categoryId,
    tags: parseTags(tags),
    author: req.user._id,
    isPublished: parseBoolean(isPublished, true),
  });

  if (req.file) {
    newPost.featuredImage = `/uploads/${req.file.filename}`;
  }

  const post = await newPost.save();

  const populatedPost = await post.populate([
    { path: 'category', select: 'name slug' },
    { path: 'author', select: 'name email' },
  ]);

  res.status(201).json({
    success: true,
    data: populatedPost,
  });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    throw createAppError(404, 'Post not found');
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw createAppError(403, 'You do not have permission to update this post');
  }

  const updatableFields = ['title', 'content', 'excerpt', 'isPublished'];
  updatableFields.forEach((field) => {
    if (typeof req.body[field] !== 'undefined') {
      if (field === 'isPublished') {
        post[field] = parseBoolean(req.body[field], post[field]);
      } else {
        post[field] = req.body[field];
      }
    }
  });

  if (typeof req.body.tags !== 'undefined') {
    post.tags = parseTags(req.body.tags);
  }

  if (req.body.category) {
    if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
      const categoryDoc = await Category.findOne({ slug: req.body.category });
      if (!categoryDoc) {
        throw createAppError(400, 'Category not found');
      }
      post.category = categoryDoc._id;
    } else {
      post.category = req.body.category;
    }
  }

  if (req.file) {
    const oldImagePath = post.featuredImage && post.featuredImage.startsWith('/uploads/')
      ? path.join(__dirname, '..', post.featuredImage)
      : null;
    post.featuredImage = `/uploads/${req.file.filename}`;
    if (oldImagePath) {
      removeFileIfExists(oldImagePath);
    }
  }

  const updatedPost = await post.save();
  const populatedPost = await updatedPost.populate([
    { path: 'category', select: 'name slug' },
    { path: 'author', select: 'name email' },
  ]);

  res.json({
    success: true,
    data: populatedPost,
  });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) {
    throw createAppError(404, 'Post not found');
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw createAppError(403, 'You do not have permission to delete this post');
  }

  if (post.featuredImage && post.featuredImage.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', post.featuredImage);
    removeFileIfExists(filePath);
  }

  await post.deleteOne();

  res.json({
    success: true,
    message: 'Post removed',
  });
});

exports.addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const post = await Post.findById(id);
  if (!post) {
    throw createAppError(404, 'Post not found');
  }

  post.comments.push({
    user: req.user._id,
    content,
  });

  await post.save();

  const populatedPost = await post.populate([
    { path: 'comments.user', select: 'name email' },
  ]);

  res.status(201).json({
    success: true,
    data: populatedPost.comments.at(-1),
  });
});

