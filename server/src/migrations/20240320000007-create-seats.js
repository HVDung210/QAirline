'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Seats', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      flight_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Flights',
          key: 'id'
        }
      },
      seat_type: {
        type: Sequelize.ENUM('Economy', 'Business', 'First'),
        allowNull: false,
        defaultValue: 'Economy'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },      seat_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('Seats');
  }
}; 