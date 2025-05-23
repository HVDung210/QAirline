'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      flight_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Flights',
          key: 'id'
        }
      },
      seat_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Seats',
          key: 'id'
        }
      },
      departure_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      return_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      booking_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('Confirmed', 'Cancelled', 'Pending'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      passengers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      class: {
        type: Sequelize.ENUM('Economy', 'Premium'),
        allowNull: false,
        defaultValue: 'Economy'
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_status: {
        type: Sequelize.ENUM('Pending', 'Paid', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      payment_method: {
        type: Sequelize.ENUM('Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Cash'),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
}; 