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
          first_name: 'A',
          title: 'Mr',
          middle_name: '',
          last_name: 'Nguyen',
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
          first_name: 'B',
          title: 'Ms',
          middle_name: '',
          last_name: 'Tran',
          date_of_birth: new Date('1992-05-15'),
          gender: 'female',
          promo_code: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: customers[2].id,
          address: '789 Tran Phu St, Da Nang',
          country_name: 'Vietnam',
          country_code: 'VNM',
          first_name: 'C',
          title: 'Mr',
          middle_name: '',
          last_name: 'Le',
          date_of_birth: new Date('1988-11-20'),
          gender: 'male',
          promo_code: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: customers[3].id,
          address: '321 Nguyen Hue St, HCMC',
          country_name: 'Vietnam',
          country_code: 'VNM',
          first_name: 'D',
          title: 'Ms',
          middle_name: '',
          last_name: 'Pham',
          date_of_birth: new Date('1995-03-08'),
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
      });      // Create Seats
      console.log('Creating Seats...');
        // Function to create seats for a flight
      const createSeatsForFlight = (flightId) => {
        const seats = [];
        let seatCounter = 1;
        
        // Economy Class - 50% of total seats (rows 20-40)
        for (let row = 20; row <= 40; row++) {
          for (let col of ['A', 'B', 'C', 'D', 'E', 'F']) {
            seats.push({
              flight_id: flightId,
              seat_type: 'Economy',
              price: 1500000,
              is_available: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            seatCounter++;
          }
        }
        
        // Business Class - 30% of total seats (rows 10-19)
        for (let row = 10; row <= 19; row++) {
          for (let col of ['A', 'C', 'D', 'F']) {  // Wider seats, skip B and E
            seats.push({
              flight_id: flightId,
              seat_type: 'Business',
              price: 3000000,
              is_available: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            seatCounter++;
          }
        }
        
        // First Class - 20% of total seats (rows 1-9)
        for (let row = 1; row <= 9; row++) {
          for (let col of ['A', 'F']) {  // Only window seats for First Class
            seats.push({
              flight_id: flightId,
              seat_type: 'First',
              price: 5000000,
              is_available: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            seatCounter++;
          }
        }
        return seats;
      };

      // Create seats for all flights
      const allFlightIds = [
        vn123Flight.id, vn124Flight.id,
        qh456Flight.id, qh457Flight.id,
        vj789Flight.id, vj790Flight.id,
        bl123Flight.id, bl124Flight.id,
        vn456Flight.id, vn457Flight.id
      ];

      for (const flightId of allFlightIds) {
        const seats = createSeatsForFlight(flightId);
        await queryInterface.bulkInsert('Seats', seats);
      }

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

      console.log('[Seeder] Found admin:', admin);

      if (!admin || !admin[0]) {
        console.error('[Seeder] No admin found for posts creation');
        return;
      }

      // Create Posts
      console.log('[Seeder] Starting to create posts...');
      const posts = await queryInterface.bulkInsert('Posts', [
        {
          title: 'Chào mừng đến với QAirline',
          content: 'Chào mừng đến với hệ thống đặt vé máy bay mới của chúng tôi! Chúng tôi rất vui mừng mang đến cho bạn trải nghiệm đặt vé tốt nhất với giá cả cạnh tranh và dịch vụ xuất sắc.',
          post_type: 'announcement',
          admin_id: admin[0].id,
          is_published: true,
          start_date: new Date(),
          end_date: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Khuyến mãi mùa hè',
          content: 'Đặt vé máy bay mùa hè ngay bây giờ và nhận giảm giá 20%! Áp dụng cho tất cả các chuyến bay nội địa từ tháng 6 đến tháng 8 năm 2024. Sử dụng mã SUMMER2024 khi thanh toán.',
          post_type: 'promotion',
          admin_id: admin[0].id,
          is_published: true,
          start_date: new Date('2024-06-01'),
          end_date: new Date('2024-08-31'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Thêm tuyến bay mới',
          content: 'Chúng tôi vui mừng thông báo về việc mở thêm các tuyến bay mới kết nối các thành phố lớn tại Việt Nam. Hãy khám phá mạng lưới mở rộng của chúng tôi và lên kế hoạch cho chuyến đi tiếp theo!',
          post_type: 'news',
          admin_id: admin[0].id,
          is_published: true,
          start_date: new Date(),
          end_date: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Về QAirline',
          content: 'QAirline là hãng hàng không hàng đầu tại Việt Nam, cam kết cung cấp dịch vụ hàng không an toàn, thoải mái và giá cả phải chăng cho khách hàng.',
          post_type: 'introduction',
          admin_id: admin[0].id,
          is_published: true,
          start_date: new Date(),
          end_date: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Ưu đãi đặc biệt mùa đông',
          content: 'Hãy chuẩn bị cho mùa đông với những ưu đãi đặc biệt của chúng tôi! Đặt vé cho tháng 12 và tháng 1 để tận hưởng những ưu đãi độc quyền.',
          post_type: 'promotion',
          admin_id: admin[0].id,
          is_published: false,
          start_date: new Date('2024-12-01'),
          end_date: new Date('2025-01-31'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      console.log('[Seeder] Posts created:', posts);

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