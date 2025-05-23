const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Define association
Admin.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Admin; 