const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Airline = sequelize.define('Airline', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country_code: {
    type: DataTypes.CHAR(3),
    allowNull: true
  },
  motto: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  establish_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Airline; 