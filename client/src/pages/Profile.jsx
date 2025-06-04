import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        setLoading(true);
        const response = await authService.getCustomerInfo(user.id - 1);
        setCustomerInfo(response.data);
      } catch (error) {
        console.error('Error fetching customer info:', error);
        toast.error('Không thể tải thông tin khách hàng');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCustomerInfo();
    }
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!customerInfo) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Không tìm thấy thông tin khách hàng
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Thông tin cá nhân
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Họ và tên
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {customerInfo.first_name} {customerInfo.middle_name} {customerInfo.last_name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Ngày sinh
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {new Date(customerInfo.date_of_birth).toLocaleDateString('vi-VN')}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Giới tính
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {customerInfo.gender === 'male' ? 'Nam' : customerInfo.gender === 'female' ? 'Nữ' : 'Khác'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Địa chỉ
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {customerInfo.address}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quốc gia
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {customerInfo.country_name} ({customerInfo.country_code})
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.email}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Profile; 