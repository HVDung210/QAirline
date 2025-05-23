const { Flight, Seat, Airplane, Airline } = require('../models');
const { Op } = require('sequelize');

class FlightService {
  async searchFlights(query) {
    const {
      origin,
      destination,
      departure_date,
      return_date,
      passengers = 1,
      class: flightClass = 'Economy'
    } = query;

    const where = {
      origin,
      destination,
      departure_time: {
        [Op.between]: [
          new Date(departure_date),
          new Date(departure_date + 'T23:59:59')
        ]
      }
    };

    const flights = await Flight.findAll({
      where,
      include: [{
        model: Seat,
        where: {
          class: flightClass,
          is_available: true
        },
        required: true
      }, {
        model: Airplane,
        include: [Airline]
      }],
      order: [['departure_time', 'ASC']]
    });

    // Filter flights with enough available seats
    return flights.filter(flight => 
      flight.Seats.length >= passengers
    );
  }

  async getFlightDetails(flightId) {
    const flight = await Flight.findByPk(flightId, {
      include: [{
        model: Seat,
        where: { is_available: true },
        required: false
      }, {
        model: Airplane,
        include: [Airline]
      }]
    });

    if (!flight) {
      throw new Error('Không tìm thấy chuyến bay');
    }

    return flight;
  }

  async getAvailableSeats(flightId, flightClass) {
    const seats = await Seat.findAll({
      where: {
        flight_id: flightId,
        class: flightClass,
        is_available: true
      }
    });

    return seats;
  }

  async createFlight(flightData) {
    const flight = await Flight.create(flightData);
    return flight;
  }

  async updateFlight(flightId, updateData) {
    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      throw new Error('Không tìm thấy chuyến bay');
    }

    await flight.update(updateData);
    return flight;
  }

  async deleteFlight(flightId) {
    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      throw new Error('Không tìm thấy chuyến bay');
    }

    await flight.destroy();
  }
}

module.exports = new FlightService(); 