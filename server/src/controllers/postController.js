const { Post } = require('../models');

class PostController {
  async getPosts(req, res) {
    try {
      console.log('[PostController] Getting posts with params:', req.query);
      const { type, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (type) {
        where.post_type = type;
      }

      console.log('[PostController] Query options:', {
        where,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const posts = await Post.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      console.log('[PostController] Query result:', {
        total: posts.count,
        currentPage: parseInt(page),
        postsFound: posts.rows.length
      });

      res.json({
        total: posts.count,
        pages: Math.ceil(posts.count / limit),
        currentPage: parseInt(page),
        posts: posts.rows
      });
    } catch (error) {
      console.error('[PostController] Error getting posts:', error);
      res.status(500).json({ 
        message: 'Lỗi khi lấy danh sách bài viết',
        error: error.message 
      });
    }
  }

  async getPost(req, res) {
    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createPost(req, res) {
    try {
      const post = await Post.create({
        ...req.body,
        admin_id: req.admin.id
      });
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updatePost(req, res) {
    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }

      if (post.admin_id !== req.admin.id) {
        return res.status(403).json({ message: 'Không có quyền chỉnh sửa bài viết này' });
      }

      await post.update(req.body);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deletePost(req, res) {
    try {
      console.log('[PostController] Deleting post:', {
        postId: req.params.id,
        adminId: req.admin?.id,
        admin: req.admin,
        user: req.user
      });

      const post = await Post.findByPk(req.params.id);
      console.log('[PostController] Found post:', {
        postId: post?.id,
        postAdminId: post?.admin_id,
        post: post
      });

      if (!post) {
        console.log('[PostController] Post not found:', req.params.id);
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }

      if (post.admin_id !== req.admin.id) {
        console.log('[PostController] Permission denied:', {
          postAdminId: post.admin_id,
          currentAdminId: req.admin.id,
          post: post,
          admin: req.admin
        });
        return res.status(403).json({ message: 'Không có quyền xóa bài viết này' });
      }

      await post.destroy();
      console.log('[PostController] Post deleted successfully:', req.params.id);
      res.json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
      console.error('[PostController] Error deleting post:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PostController(); 