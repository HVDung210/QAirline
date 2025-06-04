# QAirline - Flight Booking System

QAirline is a modern web application for flight booking and management, built with React and Node.js.

## Features

### Customer Features
- User authentication (login/register)
- Flight search and booking
- Seat selection
- Booking management
- User profile management
- Flight history
- Booking confirmation and notifications

### Admin Features
- Admin dashboard with statistics
- Flight management
- Airplane management
- Booking management
- Post management
- User management
- Real-time notifications

## Tech Stack

### Frontend
- React 19.1.0
- Material-UI (MUI) v7
- React Router v7
- Axios
- TailwindCSS
- React Quill
- Recharts
- React Toastify

### Backend
- Node.js
- Express.js
- Sequelize ORM
- SQLite3
- JWT Authentication
- Bcrypt
- Express Validator

## Project Structure

```
qairline/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── layouts/       # Layout components
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
│
└── server/                # Backend Node.js application
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── middleware/    # Custom middleware
    │   ├── utils/         # Utility functions
    │   └── config/        # Configuration files
    └── public/            # Public assets
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/qairline.git
cd qairline
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# In server directory
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
# In server directory
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

5. Start the development servers:
```bash
# Start backend server (from server directory)
npm start

# Start frontend server (from client directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Documentation

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- POST /api/auth/admin/login - Admin login

### Flights
- GET /api/flights - Get all flights
- GET /api/flights/search - Search flights
- GET /api/flights/:id - Get flight details
- POST /api/flights - Create new flight (admin)
- PUT /api/flights/:id - Update flight (admin)
- DELETE /api/flights/:id - Delete flight (admin)

### Bookings
- GET /api/bookings - Get user bookings
- POST /api/bookings - Create new booking
- GET /api/bookings/:id - Get booking details
- PUT /api/bookings/:id - Update booking
- DELETE /api/bookings/:id - Cancel booking

### Admin Routes
- GET /api/admin/dashboard - Get dashboard statistics
- GET /api/admin/bookings - Get all bookings
- GET /api/admin/airplanes - Get all airplanes
- POST /api/admin/airplanes - Add new airplane
- GET /api/admin/posts - Get all posts
- POST /api/admin/posts - Create new post

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.


