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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';

const Flights = () => {
  const [open, setOpen] = useState(false);
  const [flights, setFlights] = useState([]);
  const [airplanes, setAirplanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [formData, setFormData] = useState({
    flight_number: '',
    airplane_id: '',
    origin: '',
    destination: '',
    departure_time: new Date(),
    arrival_time: new Date(),
    status: 'Scheduled',
  });

  useEffect(() => {
    console.log('[Flights] Component mounted');
    fetchFlights();
    fetchAirplanes();
  }, []);

  const fetchFlights = async () => {
    try {
      console.log('[Flights] Fetching flights...');
      setLoading(true);
      const response = await adminService.getFlights();
      console.log('[Flights] Received flights data:', response.data);
      setFlights(response.data);
    } catch (error) {
      console.error('[Flights] Error fetching flights:', error);
      toast.error('Lỗi khi tải danh sách chuyến bay');
    } finally {
      setLoading(false);
    }
  };

  const fetchAirplanes = async () => {
    try {
      console.log('[Flights] Fetching airplanes...');
      const response = await adminService.getAirplanes();
      console.log('[Flights] Received airplanes data:', response.data);
      setAirplanes(response.data);
    } catch (error) {
      console.error('[Flights] Error fetching airplanes:', error);
      toast.error('Lỗi khi tải danh sách máy bay');
    }
  };

  const handleClickOpen = () => {
    setSelectedFlight(null);
    setFormData({
      flight_number: '',
      airplane_id: '',
      origin: '',
      destination: '',
      departure_time: new Date(),
      arrival_time: new Date(),
      status: 'Scheduled',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFlight(null);
  };

  const handleEdit = (row) => {
    setSelectedFlight(row);
    setFormData({
      flight_number: row.flight_number,
      airplane_id: row.airplane_id,
      origin: row.origin,
      destination: row.destination,
      departure_time: new Date(row.departure_time),
      arrival_time: new Date(row.arrival_time),
      status: row.status,
    });
    setOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chuyến bay này?')) {
      try {
        await adminService.deleteFlight(row.id);
        toast.success('Xóa chuyến bay thành công');
        fetchFlights();
      } catch (error) {
        toast.error('Lỗi khi xóa chuyến bay');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedFlight) {
        await adminService.updateFlight(selectedFlight.id, formData);
        toast.success('Cập nhật chuyến bay thành công');
      } else {
        await adminService.createFlight(formData);
        toast.success('Thêm chuyến bay thành công');
      }
      handleClose();
      fetchFlights();
    } catch (error) {
      toast.error(selectedFlight ? 'Lỗi khi cập nhật chuyến bay' : 'Lỗi khi thêm chuyến bay');
    }
  };

  const handleDelay = async (id, delayTime) => {
    try {
      await adminService.updateFlightDelay(id, delayTime);
      toast.success('Cập nhật thời gian delay thành công');
      fetchFlights();
    } catch (error) {
      toast.error('Lỗi khi cập nhật thời gian delay');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'flight_number', headerName: 'Số hiệu chuyến bay', width: 150 },
    { field: 'origin', headerName: 'Điểm đi', width: 130 },
    { field: 'destination', headerName: 'Điểm đến', width: 130 },
    {
      field: 'departure_time',
      headerName: 'Giờ khởi hành',
      width: 180,
      valueGetter: (params) => {
        if (!params.row?.departure_time) return '';
        return new Date(params.row.departure_time).toLocaleString();
      },
    },
    {
      field: 'arrival_time',
      headerName: 'Giờ đến',
      width: 180,
      valueGetter: (params) => {
        if (!params.row?.arrival_time) return '';
        return new Date(params.row.arrival_time).toLocaleString();
      },
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 130,
    },
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
        <Typography variant="h4">Quản lý chuyến bay</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Thêm chuyến bay
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={flights}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFlight ? 'Sửa chuyến bay' : 'Thêm chuyến bay mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Số hiệu chuyến bay"
                variant="outlined"
                value={formData.flight_number}
                onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel>Máy bay</InputLabel>
                <Select
                  value={formData.airplane_id}
                  label="Máy bay"
                  onChange={(e) => setFormData({ ...formData, airplane_id: e.target.value })}
                >
                  {Array.isArray(airplanes) && airplanes.map((airplane) => (
                    <MenuItem key={airplane.id} value={airplane.id}>
                      {airplane.model} - {airplane.registration}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                fullWidth
                label="Điểm đi"
                variant="outlined"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                fullWidth
                label="Điểm đến"
                variant="outlined"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Giờ khởi hành"
                  value={formData.departure_time}
                  onChange={(newValue) => setFormData({ ...formData, departure_time: newValue })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Giờ đến"
                  value={formData.arrival_time}
                  onChange={(newValue) => setFormData({ ...formData, arrival_time: newValue })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Scheduled">Đã lên lịch</MenuItem>
                  <MenuItem value="Delayed">Bị trễ</MenuItem>
                  <MenuItem value="Cancelled">Đã hủy</MenuItem>
                  <MenuItem value="Completed">Đã hoàn thành</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedFlight ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Flights; 