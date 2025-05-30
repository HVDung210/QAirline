const { Flight, Airplane, Airline, Seat } = require('../models');
const { Op } = require('sequelize');
const flightService = require('../services/flightService');

class FlightController {
  async getAllFlights(req, res) {
    try {
      const flights = await Flight.findAll({
        include: [
          {
            model: Airplane,
            include: [Airline]
          }
        ]
      });

      res.json({
        status: 'success',
        data: flights.map(flight => ({
          id: flight.id,
          flight_number: flight.flight_number,
          airplane_id: flight.airplane_id,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          duration: flight.duration,
          status: flight.status,
          airplane: flight.Airplane ? {
            id: flight.Airplane.id,
            model: flight.Airplane.model,
            manufacturer: flight.Airplane.manufacturer,
            seat_count: flight.Airplane.seat_count,
            airline: flight.Airplane.Airline ? {
              id: flight.Airplane.Airline.id,
              name: flight.Airplane.Airline.name
            } : null
          } : null
        }))
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }

  async getFlightById(req, res) {
    try {
      const flight = await Flight.findByPk(req.params.id, {
        include: [
          {
            model: Airplane,
            include: [Airline]
          },
          {
            model: Seat
          }
        ]
      });

      if (!flight) {
        return res.status(404).json({
          status: 'error',
          message: 'Flight not found'
        });
      }

      res.json({
        status: 'success',
        data: flight
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }

  async searchFlights(req, res) {
    try {
      const {
        origin,
        destination,
        departure_date,
        return_date,
        passengers,
        class: seatClass
      } = req.query;

      console.log('Search request params:', {
        origin,
        destination,
        departure_date,
        return_date,
        passengers,
        seatClass
      });

      if (!origin || !destination || !departure_date) {
        console.log('Missing required parameters');
        return res.status(400).json({
          error: 'Missing required parameters: origin, destination, and departure_date are required'
        });
      }

      // Parse date from either dd/mm/yyyy or yyyy-mm-dd format
      let startDate, endDate;
      if (departure_date.includes('/')) {
        const [depDay, depMonth, depYear] = departure_date.split('/');
        startDate = new Date(depYear, depMonth - 1, depDay);
        endDate = new Date(depYear, depMonth - 1, depDay);
      } else {
        // For yyyy-mm-dd format, create date in local timezone
        const [year, month, day] = departure_date.split('-');
        startDate = new Date(year, month - 1, day);
        endDate = new Date(year, month - 1, day);
      }
      // Set time to start and end of day in local timezone
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      console.log('Date range:', {
        startDate: startDate.toLocaleString(),
        endDate: endDate.toLocaleString()
      });

      // Format seat class to match database enum
      const formattedSeatClass = seatClass ? 
        seatClass.charAt(0).toUpperCase() + seatClass.slice(1).toLowerCase() : 
        'Economy';

      console.log('Formatted seat class:', formattedSeatClass);

      // Find matching flights
      console.log('Searching for flights with criteria:', {
        origin,
        destination,
        startDate: startDate.toLocaleString(),
        endDate: endDate.toLocaleString(),
        formattedSeatClass
      });

      // First, find flights without seat conditions
      const flightsWithoutSeats = await Flight.findAll({
        where: {
          origin: origin,
          destination: destination,
          departure_time: {
            [Op.between]: [startDate, endDate]
          },
          status: 'Scheduled'
        },
        include: [
          {
            model: Airplane,
            include: [{
              model: Airline,
              attributes: ['name']
            }]
          }
        ]
      });

      console.log('Found flights without seat conditions:', flightsWithoutSeats.length);
      if (flightsWithoutSeats.length > 0) {
        console.log('First flight details:', {
          id: flightsWithoutSeats[0].id,
          flight_number: flightsWithoutSeats[0].flight_number,
          origin: flightsWithoutSeats[0].origin,
          destination: flightsWithoutSeats[0].destination,
          departure_time: flightsWithoutSeats[0].departure_time.toLocaleString(),
          airplane: flightsWithoutSeats[0].Airplane.model,
          airline: flightsWithoutSeats[0].Airplane.Airline.name
        });

        // Check seats for this flight
        const seats = await Seat.findAll({
          where: {
            flight_id: flightsWithoutSeats[0].id
          }
        });

        console.log('Seats for flight:', {
          total_seats: seats.length,
          seats_by_type: seats.reduce((acc, seat) => {
            acc[seat.seat_type] = (acc[seat.seat_type] || 0) + 1;
            return acc;
          }, {}),
          seats_details: seats.map(seat => ({
            seat_number: seat.seat_number,
            seat_type: seat.seat_type,
            is_available: seat.is_available,
            price: seat.price
          }))
        });
      }

      // Then find flights with seat conditions
      const flights = await Flight.findAll({
        where: {
          origin: origin,
          destination: destination,
          departure_time: {
            [Op.between]: [startDate, endDate]
          },
          status: 'Scheduled'
        },
        include: [
          {
            model: Airplane,
            include: [{
              model: Airline,
              attributes: ['name']
            }]
          },
          {
            model: Seat,
            where: {
              seat_type: formattedSeatClass
            },
            required: false
          }
        ]
      });

      // Filter flights to only include those with enough available seats
      const availableFlights = flights.filter(flight => {
        const availableSeats = flight.Seats.filter(seat => seat.is_available);
        return availableSeats.length >= passengers;
      });

      console.log('Found flights with seat conditions:', availableFlights.length);
      if (availableFlights.length > 0) {
        console.log('First flight with seats details:', {
          id: availableFlights[0].id,
          flight_number: availableFlights[0].flight_number,
          origin: availableFlights[0].origin,
          destination: availableFlights[0].destination,
          departure_time: availableFlights[0].departure_time.toLocaleString(),
          seats: availableFlights[0].Seats.map(seat => ({
            seat_number: seat.seat_number,
            seat_type: seat.seat_type,
            price: seat.price,
            is_available: seat.is_available
          }))
        });
      } else {
        console.log('No flights found with available seats');
      }

      // Format response
      const formattedFlights = availableFlights.map(flight => ({
        id: flight.id,
        flight_number: flight.flight_number,
        airline: flight.Airplane.Airline.name,
        airplane: flight.Airplane.model,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        duration: flight.duration,
        seats: flight.Seats.map(seat => ({
          id: seat.id,
          seat_number: seat.seat_number,
          seat_type: seat.seat_type,
          price: seat.price,
          is_available: seat.is_available
        })),
        status: flight.status
      }));

      res.json({
        status: 'success',
        data: formattedFlights,
        total_flights: availableFlights.length,
        total_seats: availableFlights.reduce((acc, flight) => 
          acc + flight.Seats.filter(seat => seat.is_available).length, 0)
      });
    } catch (error) {
      console.error('Error searching flights:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  async getAvailableSeats(req, res) {
    try {
      const { class: flightClass } = req.query;
      const seats = await flightService.getAvailableSeats(req.params.id, flightClass);
      res.json(seats);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async createFlight(req, res) {
    try {
      const flight = await flightService.createFlight(req.body);
      res.status(201).json(flight);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateFlight(req, res) {
    try {
      console.log('[FlightController] Updating flight:', {
        id: req.params.id,
        body: req.body
      });

      const flight = await Flight.findByPk(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
      }

      // Update only the fields that are provided in the request
      await flight.update(req.body);
      
      console.log('[FlightController] Flight updated successfully:', {
        id: flight.id,
        updatedFields: Object.keys(req.body)
      });

      res.json({
        status: 'success',
        data: flight
      });
    } catch (error) {
      console.error('[FlightController] Error updating flight:', error);
      res.status(400).json({ 
        status: 'error',
        message: error.message,
        errors: error.errors
      });
    }
  }

  async deleteFlight(req, res) {
    try {
      const flight = await Flight.findByPk(req.params.id);
      
      if (!flight) {
        return res.status(404).json({
          status: 'error',
          message: 'Flight not found'
        });
      }

      // Delete associated seats first
      await Seat.destroy({
        where: {
          flight_id: flight.id
        }
      });

      // Then delete the flight
      await flight.destroy();

      res.json({
        status: 'success',
        message: 'Flight deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting flight:', error);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong while deleting the flight'
      });
    }
  }
}

module.exports = new FlightController(); 