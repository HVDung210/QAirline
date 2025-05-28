import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Bookings = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filter, setFilter] = useState('all');

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'bookingNumber', headerName: 'Mã đặt chỗ', width: 150 },
    { field: 'customerName', headerName: 'Khách hàng', width: 200 },
    { field: 'flightNumber', headerName: 'Chuyến bay', width: 130 },
    { field: 'departure', headerName: 'Điểm đi', width: 130 },
    { field: 'arrival', headerName: 'Điểm đến', width: 130 },
    { field: 'bookingDate', headerName: 'Ngày đặt', width: 180 },
    { field: 'status', headerName: 'Trạng thái', width: 130 },
    { field: 'totalAmount', headerName: 'Tổng tiền', width: 130 },
  ];

  const rows = [
    {
      id: 1,
      bookingNumber: 'BK001',
      customerName: 'Nguyễn Văn A',
      flightNumber: 'QN001',
      departure: 'Hà Nội',
      arrival: 'TP.HCM',
      bookingDate: '2024-03-28',
      status: 'Đã xác nhận',
      totalAmount: '2,500,000',
    },
  ];

  const bookingStats = [
    { name: 'T1', bookings: 4000, revenue: 2400 },
    { name: 'T2', bookings: 3000, revenue: 1398 },
    { name: 'T3', bookings: 2000, revenue: 9800 },
    { name: 'T4', bookings: 2780, revenue: 3908 },
    { name: 'T5', bookings: 1890, revenue: 4800 },
    { name: 'T6', bookings: 2390, revenue: 3800 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý đặt vé
      </Typography>

      <Grid container spacing={3}>
        {/* Thống kê nhanh */}
        <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng số đặt vé
              </Typography>
              <Typography variant="h5">1,234</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đặt vé hôm nay
              </Typography>
              <Typography variant="h5">45</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Doanh thu tháng
              </Typography>
              <Typography variant="h5">$15,000</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tỷ lệ hoàn thành
              </Typography>
              <Typography variant="h5">98%</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Bộ lọc */}
        <Grid sx={{ width: '100%' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Từ ngày"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Đến ngày"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filter}
                    label="Trạng thái"
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                    <MenuItem value="pending">Đang chờ</MenuItem>
                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Biểu đồ thống kê */}
        <Grid sx={{ width: { xs: '100%', md: '66.67%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê đặt vé
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#8884d8" name="Số đặt vé" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bảng danh sách đặt vé */}
        <Grid sx={{ width: '100%' }}>
          <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              disableSelectionOnClick
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Bookings; 