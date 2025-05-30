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
import { getCityName } from '../../data/cityMapping';
import { cities } from '../../data/cities';

const Flights = () => {
  const [open, setOpen] = useState(false);
  const [flights, setFlights] = useState([]);
  const [airplanes, setAirplanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [formData, setFormData] = useState({
    flight_number: '',
    origin: '',
    destination: '',
    departure_time: new Date(),
    arrival_time: new Date(),
    airplane_id: '',
    status: 'Scheduled',
    duration: '00:00:00'
  });

  useEffect(() => {
    fetchFlights();
    fetchAirplanes();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      console.log('[Flights] Fetching flights...');
      const response = await adminService.getFlights();
      console.log('[Flights] Fetch response:', response);
      
      if (response?.data?.data) {
        const formattedFlights = response.data.data
          .filter(flight => flight && flight.id)
          .map(flight => ({
            id: flight.id,
            flight_number: flight.flight_number || '',
            departure_time: flight.departure_time || new Date().toISOString(),
            arrival_time: flight.arrival_time || new Date().toISOString(),
            status: flight.status || 'Scheduled',
          }));
        console.log('[Flights] Formatted flights:', formattedFlights);
        setFlights(formattedFlights);
      } else {
        console.log('[Flights] No flights data in response');
        setFlights([]);
      }
    } catch (error) {
      console.error('[Flights] Error fetching flights:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Không thể tải danh sách chuyến bay');
    } finally {
      setLoading(false);
    }
  };

  const fetchAirplanes = async () => {
    try {
      const response = await adminService.getAirplanes();
      setAirplanes(response.data.airplanes);
    } catch (error) {
      console.error('[Flights] Error fetching airplanes:', error);
      toast.error('Lỗi khi tải danh sách máy bay');
    }
  };

  const calculateDuration = (departure, arrival) => {
    const diff = arrival.getTime() - departure.getTime();
    return Math.floor(diff / (1000 * 60)); // Convert to minutes
  };

  const resetForm = () => {
    setFormData({
      flight_number: '',
      origin: '',
      destination: '',
      departure_time: new Date(),
      arrival_time: new Date(),
      airplane_id: '',
      status: 'Scheduled',
      duration: '00:00:00'
    });
  };

  const handleClickOpen = () => {
    setSelectedFlight(null);
    resetForm();
    setOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedFlight(row);
    const newFormData = {
      flight_number: row.flight_number || '',
      origin: row.origin || '',
      destination: row.destination || '',
      departure_time: new Date(row.departure_time),
      arrival_time: new Date(row.arrival_time),
      airplane_id: row.airplane_id || '',
      status: row.status || 'Scheduled',
      duration: calculateDuration(new Date(row.departure_time), new Date(row.arrival_time))
    };
    setFormData(newFormData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFlight(null);
    resetForm();
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
      // Validate only for new flights
      if (!selectedFlight) {
        // Check origin and destination
        if (formData.origin === formData.destination) {
          toast.error('Điểm đi và điểm đến không được trùng nhau');
          return;
        }

        // Check arrival time is after departure time
        if (formData.arrival_time <= formData.departure_time) {
          toast.error('Giờ đến phải sau giờ khởi hành');
          return;
        }
      }

      // Calculate duration in minutes
      const duration = calculateDuration(formData.departure_time, formData.arrival_time);
      
      // Prepare submit data based on whether it's create or update
      const submitData = selectedFlight ? {
        flight_number: formData.flight_number,
        departure_time: formData.departure_time.toISOString(),
        arrival_time: formData.arrival_time.toISOString(),
        status: formData.status,
        duration
      } : {
        ...formData,
        duration,
        departure_time: formData.departure_time.toISOString(),
        arrival_time: formData.arrival_time.toISOString(),
        status: 'Scheduled' // Set default status for new flights
      };

      console.log('[Flights] Form data before submission:', formData);
      console.log('[Flights] Calculated duration (minutes):', duration);
      console.log('[Flights] Final submit data:', submitData);

      if (selectedFlight) {
        console.log('[Flights] Updating flight with data:', submitData);
        const response = await adminService.updateFlight(selectedFlight.id, submitData);
        
        console.log('[Flights] Update response:', response);
        
        if (response?.data?.data) {
          toast.success('Cập nhật chuyến bay thành công');
          handleClose();
          fetchFlights();
        } else {
          const errorMessage = response?.data?.errors?.[0]?.msg || response?.data?.message || 'Lỗi khi cập nhật chuyến bay';
          console.error('[Flights] Update error response:', response?.data);
          toast.error(errorMessage);
        }
      } else {
        console.log('[Flights] Creating flight with data:', submitData);
        try {
          const response = await adminService.createFlight(submitData);
          console.log('[Flights] Create response:', response);
          
          if (response?.data?.id || response?.data?.flight_number) {
            toast.success('Thêm chuyến bay thành công');
            handleClose();
            fetchFlights();
          } else if (response?.data?.errors) {
            const errorMessage = response.data.errors[0]?.msg || response.data.message || 'Lỗi khi thêm chuyến bay';
            console.error('[Flights] Create error response:', response.data);
            toast.error(errorMessage);
          } else {
            console.error('[Flights] Invalid response format:', response);
            toast.error('Lỗi không xác định khi thêm chuyến bay');
          }
        } catch (createError) {
          console.error('[Flights] Create error details:', {
            error: createError,
            response: createError.response?.data,
            status: createError.response?.status,
            headers: createError.response?.headers
          });
          throw createError;
        }
      }
    } catch (error) {
      console.error('[Flights] Error submitting flight:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        formData,
        selectedFlight
      });
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          error.message || 
                          'Đã xảy ra lỗi';
      toast.error(errorMessage);
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
    {
      field: 'departure_time',
      headerName: 'Giờ khởi hành',
      width: 180,
      renderCell: (params) => {
        if (!params.row.departure_time) return '';
        const date = new Date(params.row.departure_time);
        return date.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    },
    {
      field: 'arrival_time',
      headerName: 'Giờ đến',
      width: 180,
      renderCell: (params) => {
        if (!params.row.arrival_time) return '';
        const date = new Date(params.row.arrival_time);
        return date.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 130,
      renderCell: (params) => {
        const statusMap = {
          'Scheduled': 'Đã lên lịch',
          'Delayed': 'Bị trễ'
        };
        return statusMap[params.row.status] || params.row.status;
      }
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
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row.id}
          components={{
            NoRowsOverlay: () => (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                Không có dữ liệu chuyến bay
              </Box>
            ),
          }}
        />
      </Paper>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
        keepMounted
        disablePortal
      >
        <DialogTitle>
          {selectedFlight ? 'Sửa chuyến bay' : 'Thêm chuyến bay mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!selectedFlight && (
              <>
                <Grid sx={{ width: '100%' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Điểm đi</InputLabel>
                    <Select
                      value={formData.origin}
                      label="Điểm đi"
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    >
                      {cities.map(city => (
                        <MenuItem key={city.id} value={city.code}>
                          {city.name} ({city.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid sx={{ width: '100%' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Điểm đến</InputLabel>
                    <Select
                      value={formData.destination}
                      label="Điểm đến"
                      onChange={(e) => {
                        if (e.target.value === formData.origin) {
                          toast.error('Điểm đến không được trùng với điểm đi');
                          return;
                        }
                        setFormData(prev => ({ ...prev, destination: e.target.value }));
                      }}
                    >
                      {cities.map(city => (
                        <MenuItem key={city.id} value={city.code}>
                          {city.name} ({city.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid sx={{ width: '100%' }}>
                  <FormControl fullWidth required>
                    <InputLabel>Máy bay</InputLabel>
                    <Select
                      value={formData.airplane_id}
                      label="Máy bay"
                      onChange={(e) => setFormData(prev => ({ ...prev, airplane_id: e.target.value }))}
                    >
                      {airplanes.map((airplane) => (
                        <MenuItem key={airplane.id} value={airplane.id}>
                          {airplane.model} - {airplane.registration}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Số hiệu chuyến bay"
                value={formData.flight_number}
                onChange={(e) => setFormData(prev => ({ ...prev, flight_number: e.target.value }))}
                required
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Giờ khởi hành"
                  value={formData.departure_time}
                  onChange={(newValue) => {
                    if (!selectedFlight && newValue >= formData.arrival_time) {
                      toast.error('Giờ khởi hành phải trước giờ đến');
                      return;
                    }
                    setFormData(prev => ({ 
                      ...prev, 
                      departure_time: newValue,
                      duration: calculateDuration(newValue, prev.arrival_time)
                    }));
                  }}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Giờ đến"
                  value={formData.arrival_time}
                  onChange={(newValue) => {
                    if (!selectedFlight && newValue <= formData.departure_time) {
                      toast.error('Giờ đến phải sau giờ khởi hành');
                      return;
                    }
                    setFormData(prev => ({ 
                      ...prev, 
                      arrival_time: newValue,
                      duration: calculateDuration(prev.departure_time, newValue)
                    }));
                  }}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            {selectedFlight && (
              <Grid sx={{ width: '100%' }}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.status}
                    label="Trạng thái"
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="Scheduled">Đã lên lịch</MenuItem>
                    <MenuItem value="Delayed">Bị trễ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
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