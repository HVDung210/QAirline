const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = require('./Customer');
const Flight = require('./Flight');
const Seat = require('./Seat');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Customer,
      key: 'id'
    }
  },
  flight_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Flight,
      key: 'id'
    }
  },
  seat_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Seat,
      key: 'id'
    }
  },
  departure_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  return_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  booking_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('Confirmed', 'Cancelled', 'Pending'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  passengers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  class: {
    type: DataTypes.ENUM('Economy', 'Premium'),
    allowNull: false,
    defaultValue: 'Economy'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  payment_method: {
    type: DataTypes.ENUM('Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Cash'),
    allowNull: false
  }
});

// Define associations
Booking.belongsTo(Customer, { foreignKey: 'customer_id' });
Booking.belongsTo(Flight, { foreignKey: 'flight_id' });
Booking.belongsTo(Seat, { foreignKey: 'seat_id' });

module.exports = Booking; 