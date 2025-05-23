const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { validatePost } = require('../utils/validators');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);

// Admin routes
router.post('/', adminAuth, validatePost, postController.createPost);
router.put('/:id', adminAuth, validatePost, postController.updatePost);
router.delete('/:id', adminAuth, postController.deletePost);

module.exports = router; 