const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

console.log('[Post Model] Initializing Post model...');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  post_type: {
    type: DataTypes.ENUM('introduction', 'promotion', 'announcement', 'news'),
    allowNull: false
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ngày bắt đầu hiệu lực (dùng cho khuyến mãi)'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ngày kết thúc hiệu lực (dùng cho khuyến mãi)'
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Trạng thái công khai hoặc lưu nháp'
  }
}, {
  timestamps: true
});

console.log('[Post Model] Post model initialized with options:', {
  tableName: Post.tableName,
  attributes: Object.keys(Post.rawAttributes),
  timestamps: true
});

module.exports = Post; 