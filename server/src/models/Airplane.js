const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Airline = require('./Airline');

const Airplane = sequelize.define('Airplane', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seat_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  airline_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Airline,
      key: 'id'
    }
  }
}, {
  timestamps: true // This will use createdAt and updatedAt
});

// Define association
Airplane.belongsTo(Airline, { foreignKey: 'airline_id' });

module.exports = Airplane; 