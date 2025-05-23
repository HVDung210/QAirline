const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Flight = require('./Flight');

const Seat = sequelize.define('Seat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  flight_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Flight,
      key: 'id'
    }
  },
  seat_type: {
    type: DataTypes.ENUM('Economy', 'Business', 'First'),
    allowNull: false,
    defaultValue: 'Economy'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  seat_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

// Define association
Seat.belongsTo(Flight, { foreignKey: 'flight_id' });

module.exports = Seat; 