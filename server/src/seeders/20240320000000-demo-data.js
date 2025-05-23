'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Create Users
      console.log('Creating Users...');
      const users = await queryInterface.bulkInsert('Users', [
        {
          email: 'admin@gmail.com',
          phone: '0123456789',
          password: await bcrypt.hash('123456', 10),
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: '1@gmail.com',
          phone: '0987654321',
          password: await bcrypt.hash('123456', 10),
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: '2@gmail.com',
          phone: '0987654322',
          password: await bcrypt.hash('123456', 10),
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: '3@gmail.com',
          phone: '0987654323',
          password: await bcrypt.hash('123456', 10),
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: '4@gmail.com',
          phone: '0987654324',
          password: await bcrypt.hash('123456', 10),
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { returning: true });
      console.log('Users created successfully');

      // Get admin user ID
      const adminUser = await queryInterface.sequelize.query(
        'SELECT id FROM Users WHERE email = ?',
        {
          replacements: ['admin@gmail.com'],
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      const adminId = adminUser[0].id;

      // Create Admin
      console.log('Creating Admin...');
      await queryInterface.bulkInsert('Admins', [
        {
          user_id: adminId,
          permissions: JSON.stringify(['all']),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('Admin created successfully');

      // Get customer user IDs
      const customers = await queryInterface.sequelize.query(
        'SELECT id FROM Users WHERE role = ?',
        {
          replacements: ['customer'],
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      // Create Customers
      console.log('Creating Customers...');
      await queryInterface.bulkInsert('Customers', [
        {
          user_id: customers[0].id,
          address: '123 Main St, Hanoi',
          country_name: 'Vietnam',
          country_code: 'VNM',
          first_name: 'John',
          title: 'Mr',
          middle_name: '',
          last_name: 'Doe',
          date_of_birth: new Date('1990-01-01'),
          gender: 'male',
          promo_code: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: customers[1].id,
          address: '456 Le Loi St, HCMC',
          country_name: 'Vietnam',
          country_code: 'VNM',
          first_name: 'Jane',
          title: 'Ms',
          middle_name: '',
          last_name: 'Smith',
          date_of_birth: new Date('1992-05-15'),
          gender: 'female',
          promo_code: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('Customers created successfully');

      // Create Airlines
      console.log('Creating Airlines...');
      const airlines = await queryInterface.bulkInsert('Airlines', [
        {
          name: 'Vietnam Airlines',
          country_code: 'VNM',
          motto: 'Reaching Further',
          establish_date: new Date('1956-01-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Bamboo Airways',
          country_code: 'VNM',
          motto: 'More Than Just A Flight',
          establish_date: new Date('2017-05-01'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Vietjet Air',
          country_code: 'VNM',
          motto: 'Enjoy Flying',
          establish_date: new Date('2011-12-25'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Pacific Airlines',
          country_code: 'VNM',
          motto: 'Fly Your Way',
          establish_date: new Date('1991-04-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { returning: true });
      console.log('Airlines created successfully');

      // Get airline IDs
      const airlineIds = await queryInterface.sequelize.query(
        'SELECT id FROM Airlines',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      // Create Airplanes
      console.log('Creating Airplanes...');
      const airplanes = await queryInterface.bulkInsert('Airplanes', [
        {
          model: 'Boeing 787-9',
          manufacturer: 'Boeing',
          seat_count: 294,
          airline_id: airlineIds[0].id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          model: 'Airbus A350-900',
          manufacturer: 'Airbus',
          seat_count: 325,
          airline_id: airlineIds[1].id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          model: 'Airbus A321neo',
          manufacturer: 'Airbus',
          seat_count: 240,
          airline_id: airlineIds[2].id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          model: 'Boeing 737-800',
          manufacturer: 'Boeing',
          seat_count: 189,
          airline_id: airlineIds[3].id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          model: 'Boeing 777-300ER',
          manufacturer: 'Boeing',
          seat_count: 370,
          airline_id: airlineIds[0].id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { returning: true });
      console.log('Airplanes created successfully');

      // Get airplane IDs
      const airplaneIds = await queryInterface.sequelize.query(
        'SELECT id FROM Airplanes',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      // Create Flights
      console.log('Creating Flights...');
      const flights = await queryInterface.bulkInsert('Flights', [
        // Hà Nội - Hồ Chí Minh (Khứ hồi)
        {
          airplane_id: airplaneIds[0].id,
          flight_number: 'VN123',
          origin: 'HAN',
          destination: 'SGN',
          departure_time: new Date('2024-04-01T08:00:00+07:00'),
          arrival_time: new Date('2024-04-01T10:00:00+07:00'),
          duration: 120,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          airplane_id: airplaneIds[0].id,
          flight_number: 'VN124',
          origin: 'SGN',
          destination: 'HAN',
          departure_time: new Date('2024-04-02T08:00:00+07:00'),
          arrival_time: new Date('2024-04-02T10:00:00+07:00'),
          duration: 120,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Hồ Chí Minh - Đà Nẵng (Khứ hồi)
        {
          airplane_id: airplaneIds[1].id,
          flight_number: 'QH456',
          origin: 'SGN',
          destination: 'DAD',
          departure_time: new Date('2024-04-02T14:00:00'),
          arrival_time: new Date('2024-04-02T15:30:00'),
          duration: 90,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          airplane_id: airplaneIds[1].id,
          flight_number: 'QH457',
          origin: 'DAD',
          destination: 'SGN',
          departure_time: new Date('2024-04-03T14:00:00'),
          arrival_time: new Date('2024-04-03T15:30:00'),
          duration: 90,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Đà Nẵng - Nha Trang (Khứ hồi)
        {
          airplane_id: airplaneIds[2].id,
          flight_number: 'VJ789',
          origin: 'DAD',
          destination: 'CXR',
          departure_time: new Date('2024-04-03T09:00:00'),
          arrival_time: new Date('2024-04-03T10:00:00'),
          duration: 60,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          airplane_id: airplaneIds[2].id,
          flight_number: 'VJ790',
          origin: 'CXR',
          destination: 'DAD',
          departure_time: new Date('2024-04-04T09:00:00'),
          arrival_time: new Date('2024-04-04T10:00:00'),
          duration: 60,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Hồ Chí Minh - Hải Phòng (Khứ hồi)
        {
          airplane_id: airplaneIds[3].id,
          flight_number: 'BL123',
          origin: 'SGN',
          destination: 'HPH',
          departure_time: new Date('2024-04-04T11:00:00'),
          arrival_time: new Date('2024-04-04T13:00:00'),
          duration: 120,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          airplane_id: airplaneIds[3].id,
          flight_number: 'BL124',
          origin: 'HPH',
          destination: 'SGN',
          departure_time: new Date('2024-04-05T11:00:00'),
          arrival_time: new Date('2024-04-05T13:00:00'),
          duration: 120,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Hà Nội - Tokyo (Khứ hồi)
        {
          airplane_id: airplaneIds[4].id,
          flight_number: 'VN456',
          origin: 'HAN',
          destination: 'TYO',
          departure_time: new Date('2024-04-05T07:00:00'),
          arrival_time: new Date('2024-04-05T13:00:00'),
          duration: 360,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          airplane_id: airplaneIds[4].id,
          flight_number: 'VN457',
          origin: 'TYO',
          destination: 'HAN',
          departure_time: new Date('2024-04-06T07:00:00'),
          arrival_time: new Date('2024-04-06T13:00:00'),
          duration: 360,
          status: 'Scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { returning: true });
      console.log('Flights created successfully');

      // Get flight IDs
      const flightIds = await queryInterface.sequelize.query(
        'SELECT id, flight_number FROM Flights',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      console.log('Flight IDs:', flightIds);

      // Find VN123 flight
      const vn123Flight = flightIds.find(f => f.flight_number === 'VN123');
      const vn124Flight = flightIds.find(f => f.flight_number === 'VN124');
      const qh456Flight = flightIds.find(f => f.flight_number === 'QH456');
      const qh457Flight = flightIds.find(f => f.flight_number === 'QH457');
      const vj789Flight = flightIds.find(f => f.flight_number === 'VJ789');
      const vj790Flight = flightIds.find(f => f.flight_number === 'VJ790');
      const bl123Flight = flightIds.find(f => f.flight_number === 'BL123');
      const bl124Flight = flightIds.find(f => f.flight_number === 'BL124');
      const vn456Flight = flightIds.find(f => f.flight_number === 'VN456');
      const vn457Flight = flightIds.find(f => f.flight_number === 'VN457');

      if (!vn123Flight || !vn124Flight || !qh456Flight || !qh457Flight || !vj789Flight || !vj790Flight || !bl123Flight || !bl124Flight || !vn456Flight || !vn457Flight) {
        console.error('Could not find flights');
        return;
      }

      console.log('Found flights:', {
        vn123: vn123Flight,
        vn124: vn124Flight,
        qh456: qh456Flight,
        qh457: qh457Flight,
        vj789: vj789Flight,
        vj790: vj790Flight,
        bl123: bl123Flight,
        bl124: bl124Flight,
        vn456: vn456Flight,
        vn457: vn457Flight
      });

      // Create Seats
      console.log('Creating Seats...');
      const seats = await queryInterface.bulkInsert('Seats', [
        // Economy Class Seats for Flight 1 (VN123)
        {
          flight_id: vn123Flight.id,
          seat_type: 'Economy',
          price: 1500000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn123Flight.id,
          seat_type: 'Economy',
          price: 1500000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn123Flight.id,
          seat_type: 'Economy',
          price: 1500000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Business Class Seats for Flight 1
        {
          flight_id: vn123Flight.id,
          seat_type: 'Business',
          price: 3000000,
          seat_number: 'B1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn123Flight.id,
          seat_type: 'Business',
          price: 3000000,
          seat_number: 'B2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // First Class Seats for Flight 1
        {
          flight_id: vn123Flight.id,
          seat_type: 'First',
          price: 5000000,
          seat_number: 'C1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 2 (VN124)
        {
          flight_id: vn124Flight.id,
          seat_type: 'Economy',
          price: 1200000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn124Flight.id,
          seat_type: 'Economy',
          price: 1200000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn124Flight.id,
          seat_type: 'Economy',
          price: 1200000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Business Class Seats for Flight 2
        {
          flight_id: vn124Flight.id,
          seat_type: 'Business',
          price: 2500000,
          seat_number: 'B1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn124Flight.id,
          seat_type: 'Business',
          price: 2500000,
          seat_number: 'B2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // First Class Seats for Flight 2
        {
          flight_id: vn124Flight.id,
          seat_type: 'First',
          price: 4500000,
          seat_number: 'C1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 3 (QH456)
        {
          flight_id: qh456Flight.id,
          seat_type: 'Economy',
          price: 800000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: qh456Flight.id,
          seat_type: 'Economy',
          price: 800000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: qh456Flight.id,
          seat_type: 'Economy',
          price: 800000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 4 (QH457)
        {
          flight_id: qh457Flight.id,
          seat_type: 'Economy',
          price: 900000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: qh457Flight.id,
          seat_type: 'Economy',
          price: 900000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: qh457Flight.id,
          seat_type: 'Economy',
          price: 900000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 5 (VJ789)
        {
          flight_id: vj789Flight.id,
          seat_type: 'Economy',
          price: 700000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vj789Flight.id,
          seat_type: 'Economy',
          price: 700000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vj789Flight.id,
          seat_type: 'Economy',
          price: 700000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 6 (VJ790)
        {
          flight_id: vj790Flight.id,
          seat_type: 'Economy',
          price: 750000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vj790Flight.id,
          seat_type: 'Economy',
          price: 750000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vj790Flight.id,
          seat_type: 'Economy',
          price: 750000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 7 (BL123)
        {
          flight_id: bl123Flight.id,
          seat_type: 'Economy',
          price: 1100000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: bl123Flight.id,
          seat_type: 'Economy',
          price: 1100000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: bl123Flight.id,
          seat_type: 'Economy',
          price: 1100000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 8 (BL124)
        {
          flight_id: bl124Flight.id,
          seat_type: 'Economy',
          price: 1150000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: bl124Flight.id,
          seat_type: 'Economy',
          price: 1150000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: bl124Flight.id,
          seat_type: 'Economy',
          price: 1150000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 9 (VN456)
        {
          flight_id: vn456Flight.id,
          seat_type: 'Economy',
          price: 2500000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn456Flight.id,
          seat_type: 'Economy',
          price: 2500000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn456Flight.id,
          seat_type: 'Economy',
          price: 2500000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Economy Class Seats for Flight 10 (VN457)
        {
          flight_id: vn457Flight.id,
          seat_type: 'Economy',
          price: 2600000,
          seat_number: 'A1',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn457Flight.id,
          seat_type: 'Economy',
          price: 2600000,
          seat_number: 'A2',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          flight_id: vn457Flight.id,
          seat_type: 'Economy',
          price: 2600000,
          seat_number: 'A3',
          is_available: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { returning: true });
      console.log('Seats created successfully');

      // Verify seats were created
      const createdSeats = await queryInterface.sequelize.query(
        'SELECT * FROM Seats WHERE flight_id = ?',
        {
          replacements: [vn123Flight.id],
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );
      console.log('Created seats for VN123:', {
        count: createdSeats.length,
        seats: createdSeats.map(seat => ({
          seat_number: seat.seat_number,
          seat_type: seat.seat_type,
          is_available: seat.is_available
        }))
      });

      // Get customer IDs
      const customerIds = await queryInterface.sequelize.query(
        'SELECT id FROM Customers',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      // Get seat IDs
      const seatIds = await queryInterface.sequelize.query(
        'SELECT id FROM Seats',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );      // Skip creating demo bookings in production
      console.log('Skipping demo bookings creation');

      // Get admin ID
      const admin = await queryInterface.sequelize.query(
        'SELECT id FROM Admins WHERE user_id = ?',
        {
          replacements: [adminId],
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      // Create Posts
      console.log('Creating Posts...');
      await queryInterface.bulkInsert('Posts', [
        {
          title: 'Welcome to QAirline',
          content: 'Welcome to our new airline booking system!',
          post_type: 'announcement',
          admin_id: admin[0].id,
          is_published: true,
          start_date: new Date(),
          end_date: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Summer Promotion',
          content: 'Book your summer flights now and get 20% off!',
          post_type: 'promotion',
          admin_id: admin[0].id,
          is_published: true,
          start_date: new Date(),
          end_date: new Date('2024-08-31'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log('Posts created successfully');

    } catch (error) {
      console.error('Error in seeder:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Delete in reverse order to handle foreign key constraints
      await queryInterface.bulkDelete('Posts', null, {});
      await queryInterface.bulkDelete('Bookings', null, {});
      await queryInterface.bulkDelete('Seats', null, {});
      await queryInterface.bulkDelete('Flights', null, {});
      await queryInterface.bulkDelete('Airplanes', null, {});
      await queryInterface.bulkDelete('Airlines', null, {});
      await queryInterface.bulkDelete('Customers', null, {});
      await queryInterface.bulkDelete('Admins', null, {});
      await queryInterface.bulkDelete('Users', null, {});
    } catch (error) {
      console.error('Error in seeder down:', error);
      throw error;
    }
  }
};