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
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { adminService } from '../../services/api';

const Posts = () => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'news',
    status: 'published',
  });

  useEffect(() => {
    console.log('[Posts] Component mounted');
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('[Posts] Fetching posts...');
      setLoading(true);
      const response = await adminService.getPosts();
      console.log('[Posts] Received posts data:', response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('[Posts] Error fetching posts:', error);
      toast.error('Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setSelectedPost(null);
    setFormData({
      title: '',
      content: '',
      type: 'news',
      status: 'published',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  const handleEdit = (row) => {
    setSelectedPost(row);
    setFormData({
      title: row.title,
      content: row.content,
      type: row.type,
      status: row.status,
    });
    setOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await adminService.deletePost(row.id);
        toast.success('Xóa bài viết thành công');
        fetchPosts();
      } catch (error) {
        toast.error('Lỗi khi xóa bài viết');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedPost) {
        await adminService.updatePost(selectedPost.id, formData);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await adminService.createPost(formData);
        toast.success('Thêm bài viết thành công');
      }
      handleClose();
      fetchPosts();
    } catch (error) {
      toast.error(selectedPost ? 'Lỗi khi cập nhật bài viết' : 'Lỗi khi thêm bài viết');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'title', headerName: 'Tiêu đề', width: 300 },
    {
      field: 'type',
      headerName: 'Loại',
      width: 130,
      valueGetter: (params) => {
        const types = {
          news: 'Tin tức',
          promotion: 'Khuyến mãi',
          announcement: 'Thông báo',
          introduction: 'Giới thiệu',
        };
        return types[params.row.type] || params.row.type;
      },
    },
    {
      field: 'created_at',
      headerName: 'Ngày tạo',
      width: 180,
      valueGetter: (params) => {
        if (!params.row?.created_at) return '';
        return new Date(params.row.created_at).toLocaleString();
      },
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 130,
      valueGetter: (params) => {
        const statuses = {
          published: 'Đã đăng',
          draft: 'Bản nháp',
          archived: 'Đã lưu trữ',
        };
        return statuses[params.row.status] || params.row.status;
      },
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
        <Typography variant="h4">Quản lý bài viết</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Thêm bài viết
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={posts}
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
          {selectedPost ? 'Sửa bài viết' : 'Thêm bài viết mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Tiêu đề"
                variant="outlined"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <FormControl fullWidth>
                <InputLabel>Loại bài viết</InputLabel>
                <Select
                  value={formData.type}
                  label="Loại bài viết"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="news">Tin tức</MenuItem>
                  <MenuItem value="promotion">Khuyến mãi</MenuItem>
                  <MenuItem value="announcement">Thông báo</MenuItem>
                  <MenuItem value="introduction">Giới thiệu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="published">Đã đăng</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                  <MenuItem value="archived">Đã lưu trữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedPost ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts; 