const User = require('./User');
const Customer = require('./Customer');
const Admin = require('./Admin');
const Flight = require('./Flight');
const Booking = require('./Booking');
const Seat = require('./Seat');
const Airplane = require('./Airplane');
const Airline = require('./Airline');
const Post = require('./Post');

// Define additional associations
User.hasOne(Customer, { foreignKey: 'user_id' });
User.hasOne(Admin, { foreignKey: 'user_id' });

Airline.hasMany(Airplane, { foreignKey: 'airline_id' });
Airplane.hasMany(Flight, { foreignKey: 'airplane_id' });

Flight.hasMany(Seat, { foreignKey: 'flight_id' });
Flight.hasMany(Booking, { foreignKey: 'flight_id' });

Customer.hasMany(Booking, { foreignKey: 'customer_id' });
Seat.hasMany(Booking, { foreignKey: 'seat_id' });

Admin.hasMany(Post, { foreignKey: 'admin_id' });

module.exports = {
  User,
  Customer,
  Admin,
  Flight,
  Booking,
  Seat,
  Airplane,
  Airline,
  Post
}; 