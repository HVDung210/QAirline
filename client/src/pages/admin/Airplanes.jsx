import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';

const Airplanes = () => {
  const [open, setOpen] = useState(false);
  const [airplanes, setAirplanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    manufacturer: '',
    seat_count: '',
    airline_id: 1,
  });

  useEffect(() => {
    fetchAirplanes();
  }, []);

  const fetchAirplanes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAirplanes();
      setAirplanes(response.data.airplanes);
    } catch (error) {
      console.error('[Airplanes] Error fetching airplanes:', error);
      toast.error('Lỗi khi tải danh sách máy bay');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setFormData({
      model: '',
      manufacturer: '',
      seat_count: '',
      airline_id: 1,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await adminService.createAirplane(formData);
      toast.success('Thêm máy bay thành công');
      handleClose();
      fetchAirplanes();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'model', headerName: 'Model', width: 200 },
    { field: 'manufacturer', headerName: 'Hãng sản xuất', width: 200 },
    { field: 'seat_count', headerName: 'Số ghế', width: 150 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Quản lý máy bay</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Thêm máy bay
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={airplanes}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm máy bay mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Model"
                variant="outlined"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hãng sản xuất"
                variant="outlined"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số ghế"
                variant="outlined"
                type="number"
                value={formData.seat_count}
                onChange={(e) => setFormData({ ...formData, seat_count: e.target.value })}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Thêm mới
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Airplanes; 