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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Thống kê nhanh */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng số chuyến bay
              </Typography>
              <Typography variant="h5">150</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đặt vé hôm nay
              </Typography>
              <Typography variant="h5">45</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Doanh thu tháng
              </Typography>
              <Typography variant="h5">$15,000</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Khách hàng mới
              </Typography>
              <Typography variant="h5">12</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Biểu đồ */}
      <Grid container spacing={3}>
        {/* Biểu đồ đặt chỗ */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê đặt vé
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
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

        {/* Biểu đồ doanh thu */}
        <Grid item xs={12} md={12}>
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