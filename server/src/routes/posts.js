const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { validatePost } = require('../utils/validators');
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);

// Admin routes
router.post('/', auth, adminAuth, validatePost, postController.createPost);
router.put('/:id', auth, adminAuth, validatePost, postController.updatePost);
router.delete('/:id', auth, adminAuth, postController.deletePost);

module.exports = router; 