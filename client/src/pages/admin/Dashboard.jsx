import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const Dashboard = () => {
  // Dữ liệu mẫu cho biểu đồ
  const bookingData = [
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
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Thống kê nhanh */}
        <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng số chuyến bay
              </Typography>
              <Typography variant="h5">150</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đặt chỗ hôm nay
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
                Khách hàng mới
              </Typography>
              <Typography variant="h5">12</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Biểu đồ đặt chỗ */}
        <Grid sx={{ width: { xs: '100%', md: '66.67%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê đặt chỗ
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#8884d8" name="Số đặt chỗ" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Biểu đồ doanh thu */}
        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu theo thời gian
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 