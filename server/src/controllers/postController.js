const { Post } = require('../models');

class PostController {
  async getPosts(req, res) {
    try {
      const { type, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (type) {
        where.post_type = type;
      }

      const posts = await Post.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        total: posts.count,
        pages: Math.ceil(posts.count / limit),
        currentPage: parseInt(page),
        posts: posts.rows
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }

      if (post.admin_id !== req.admin.id) {
        return res.status(403).json({ message: 'Không có quyền xóa bài viết này' });
      }

      await post.destroy();
      res.json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PostController(); 