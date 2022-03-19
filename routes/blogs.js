const express = require('express');
const router = express.Router();

const blogs = require('../controllers/blogs');
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validateBlog } = require('../middleware');

router.get('/', catchAsync(blogs.index));

router.get('/usersBlog', isLoggedIn, catchAsync(blogs.userBlogs));

router.get('/new', isLoggedIn, blogs.renderNewForm);

router.post('/', isLoggedIn, validateBlog, catchAsync(blogs.createBlog));

router.get('/:id', catchAsync(blogs.showBlog));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(blogs.renderEditForm));

router.put('/:id', isLoggedIn, validateBlog, isAuthor, catchAsync(blogs.updateBlog));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(blogs.deleteBlog));

module.exports = router;