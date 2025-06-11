# QAirline - Hệ Thống Đặt Vé Máy Bay
Đây là dự án QAirline cho môn học INT3306 - Phát triển Ứng dụng Web. QAirline là một ứng dụng web hiện đại cho việc đặt vé và quản lý chuyến bay, được xây dựng bằng React và Node.js.

## Giao Diện

### Trang Chủ
![Trang Chủ](client/src/assets/home.png)


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
```

3. Khởi động server phát triển:
```bash
# Khởi động server backend (từ thư mục server)
npm start

# Khởi động server frontend (từ thư mục client)
npm run dev
```

Ứng dụng sẽ có sẵn tại:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000




