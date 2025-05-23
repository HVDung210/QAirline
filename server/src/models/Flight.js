const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Airplane = require('./Airplane');

const Flight = sequelize.define('Flight', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  airplane_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Airplane,
      key: 'id'
    }
  },
  flight_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departure_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  arrival_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Delayed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Scheduled'
  }
});

// Define association
Flight.belongsTo(Airplane, { foreignKey: 'airplane_id' });

module.exports = Flight; 