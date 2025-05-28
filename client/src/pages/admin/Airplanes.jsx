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
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';

const Airplanes = () => {
  const [open, setOpen] = useState(false);
  const [airplanes, setAirplanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAirplane, setSelectedAirplane] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    registration: '',
    capacity: '',
    airline_id: 1, // Mặc định là 1, có thể thay đổi sau
  });

  useEffect(() => {
    console.log('[Airplanes] Component mounted');
    fetchAirplanes();
  }, []);

  const fetchAirplanes = async () => {
    try {
      console.log('[Airplanes] Fetching airplanes...');
      setLoading(true);
      const response = await adminService.getAirplanes();
      console.log('[Airplanes] Received airplanes data:', response.data);
      setAirplanes(response.data);
    } catch (error) {
      console.error('[Airplanes] Error fetching airplanes:', error);
      toast.error('Lỗi khi tải danh sách máy bay');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setSelectedAirplane(null);
    setFormData({
      model: '',
      registration: '',
      capacity: '',
      airline_id: 1,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAirplane(null);
  };

  const handleEdit = (row) => {
    setSelectedAirplane(row);
    setFormData({
      model: row.model,
      registration: row.registration,
      capacity: row.capacity,
      airline_id: row.airline_id,
    });
    setOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa máy bay này?')) {
      try {
        await adminService.deleteAirplane(row.id);
        toast.success('Xóa máy bay thành công');
        fetchAirplanes();
      } catch (error) {
        toast.error('Lỗi khi xóa máy bay');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedAirplane) {
        await adminService.updateAirplane(selectedAirplane.id, formData);
        toast.success('Cập nhật máy bay thành công');
      } else {
        await adminService.createAirplane(formData);
        toast.success('Thêm máy bay thành công');
      }
      handleClose();
      fetchAirplanes();
    } catch (error) {
      toast.error(selectedAirplane ? 'Lỗi khi cập nhật máy bay' : 'Lỗi khi thêm máy bay');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'model', headerName: 'Model', width: 150 },
    { field: 'registration', headerName: 'Số đăng ký', width: 150 },
    { field: 'capacity', headerName: 'Sức chứa', width: 130 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 130,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Sửa">
            <IconButton
              color="primary"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
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
          checkboxSelection
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAirplane ? 'Sửa máy bay' : 'Thêm máy bay mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Model"
                variant="outlined"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Số đăng ký"
                variant="outlined"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Sức chứa"
                variant="outlined"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedAirplane ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Airplanes; 