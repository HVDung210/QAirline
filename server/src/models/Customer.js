const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Customer = sequelize.define('Customer', {
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
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country_code: {
    type: DataTypes.CHAR(3),
    allowNull: true,
    defaultValue: 'VN'
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  middle_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  promo_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

// Define association
Customer.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Customer; 