# QAirline - Hệ Thống Đặt Vé Máy Bay
Đây là dự án QAirline cho môn học INT3306 - Phát triển Ứng dụng Web. QAirline là một ứng dụng web hiện đại cho việc đặt vé và quản lý chuyến bay, được xây dựng bằng React và Node.js.

## Tính Năng

### Tính Năng Cho Khách Hàng
- Xác thực người dùng (đăng nhập/đăng ký)
- Tìm kiếm và đặt vé máy bay
- Chọn chỗ ngồi
- Quản lý đặt vé
- Quản lý hồ sơ người dùng
- Lịch sử chuyến bay
- Xác nhận đặt vé và thông báo

### Tính Năng Cho Quản Trị Viên
- Bảng điều khiển với thống kê
- Quản lý chuyến bay
- Quản lý máy bay
- Quản lý đặt vé
- Quản lý bài viết
- Quản lý người dùng
- Thông báo thời gian thực

## Công Nghệ Sử Dụng

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
- Xác thực JWT
- Bcrypt
- Express Validator

## Cấu Trúc Dự Án

```
qairline/
├── client/                 # Ứng dụng React Frontend
│   ├── src/
│   │   ├── pages/         # Các component trang
│   │   ├── components/    # Các component tái sử dụng
│   │   ├── services/      # Các service API
│   │   ├── contexts/      # React contexts
│   │   ├── layouts/       # Các component layout
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Các hàm tiện ích
│   │   └── assets/        # Tài nguyên tĩnh
│   └── public/            # Tài nguyên công khai
│
└── server/                # Ứng dụng Node.js Backend
    ├── src/
    │   ├── controllers/   # Các controller route
    │   ├── models/        # Các model database
    │   ├── routes/        # Các route API
    │   ├── middleware/    # Middleware tùy chỉnh
    │   ├── utils/         # Các hàm tiện ích
    │   └── config/        # Các file cấu hình
    └── public/            # Tài nguyên công khai
```

## Bắt Đầu

### Yêu Cầu
- Node.js (v14 trở lên)
- npm hoặc yarn

### Cài Đặt

1. Clone repository:
```bash
git clone https://github.com/yourusername/qairline.git
cd qairline
```

2. Cài đặt dependencies:
```bash
# Cài đặt dependencies cho server
cd server
npm install

# Cài đặt dependencies cho client
cd ../client
npm install
```

3. Thiết lập biến môi trường:
```bash
# Trong thư mục server
cp .env.example .env
# Chỉnh sửa .env với cấu hình của bạn
```

4. Khởi tạo database:
```bash
# Trong thư mục server
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

5. Khởi động server phát triển:
```bash
# Khởi động server backend (từ thư mục server)
npm start

# Khởi động server frontend (từ thư mục client)
npm run dev
```

Ứng dụng sẽ có sẵn tại:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Tài Liệu API

### Xác Thực
- POST /api/auth/register - Đăng ký người dùng mới
- POST /api/auth/login - Đăng nhập người dùng
- POST /api/auth/admin/login - Đăng nhập quản trị viên

### Chuyến Bay
- GET /api/flights - Lấy tất cả chuyến bay
- GET /api/flights/search - Tìm kiếm chuyến bay
- GET /api/flights/:id - Lấy chi tiết chuyến bay
- POST /api/flights - Tạo chuyến bay mới (admin)
- PUT /api/flights/:id - Cập nhật chuyến bay (admin)
- DELETE /api/flights/:id - Xóa chuyến bay (admin)

### Đặt Vé
- GET /api/bookings - Lấy danh sách đặt vé của người dùng
- POST /api/bookings - Tạo đặt vé mới
- GET /api/bookings/:id - Lấy chi tiết đặt vé
- PUT /api/bookings/:id - Cập nhật đặt vé
- DELETE /api/bookings/:id - Hủy đặt vé

### Route Quản Trị
- GET /api/admin/dashboard - Lấy thống kê bảng điều khiển
- GET /api/admin/bookings - Lấy tất cả đặt vé
- GET /api/admin/airplanes - Lấy tất cả máy bay
- POST /api/admin/airplanes - Thêm máy bay mới
- GET /api/admin/posts - Lấy tất cả bài viết
- POST /api/admin/posts - Tạo bài viết mới




