import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { adminService } from '../../services/api';
import { getCityName } from '../../data/cityMapping';

const Bookings = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'booking_reference', headerName: 'Mã đặt chỗ', width: 180 },
    { field: 'flight_number', headerName: 'Chuyến bay', width: 120 },
    { field: 'origin', headerName: 'Điểm đi', width: 100 },
    { field: 'destination', headerName: 'Điểm đến', width: 100 },
    { field: 'booking_date', headerName: 'Ngày đặt', width: 150 },
    { 
      field: 'class', 
      headerName: 'Hạng vé', 
      width: 120,
      renderCell: (params) => {
        try {
          const value = params.row.class;
          if (!value) return 'N/A';
          return (
            <Chip 
              label={value} 
              color={
                value === 'First' ? 'error' :
                value === 'Business' ? 'warning' :
                'success'
              }
              size="small"
            />
          );
        } catch (error) {
          console.error('Error rendering class:', error);
          return 'N/A';
        }
      }
    },
    { field: 'total_price', headerName: 'Tổng tiền', width: 150 }
  ];

  useEffect(() => {
    fetchBookings();
  }, [startDate, endDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      
      const response = await adminService.getBookings(params);
      
      if (!response?.data?.bookings) {
        console.error('Invalid response format');
        setBookings([]);
        return;
      }

      // Log response để debug
      console.log('API Response:', response.data);
      console.log('First booking:', response.data.bookings[0]);

      // Đảm bảo dữ liệu có đúng cấu trúc
      const formattedBookings = response.data.bookings.map(booking => {
        try {
          // Format date
          const bookingDate = booking.booking_date ? format(new Date(booking.booking_date), 'dd/MM/yyyy HH:mm') : 'N/A';
          
          // Format price
          const totalPrice = booking.total_price ? 
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price) : 
            'N/A';

          return {
            id: booking.id,
            booking_reference: booking.booking_reference,
            flight_number: booking.Flight?.flight_number || 'N/A',
            origin: getCityName(booking.Flight?.origin) || 'N/A',
            destination: getCityName(booking.Flight?.destination) || 'N/A',
            booking_date: bookingDate,
            class: booking.class || 'N/A',
            total_price: totalPrice
          };
        } catch (error) {
          console.error('Error formatting booking:', error);
          return null;
        }
      }).filter(Boolean); // Lọc bỏ các booking null

      console.log('First formatted booking:', formattedBookings[0]);
      setBookings(formattedBookings);

    } catch (error) {
      console.error('Error fetching bookings:', error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Danh sách vé đã đặt
      </Typography>

      <Grid container spacing={3}>
        {/* Bộ lọc */}
        <Grid xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Từ ngày"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Đến ngày"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Bảng danh sách vé đã đặt */}
        <Grid xs={12}>
          <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={bookings}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight
              getRowId={(row) => row.id}
              sx={{
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  lineHeight: 'normal',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Bookings; 