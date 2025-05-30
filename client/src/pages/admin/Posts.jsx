import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, IconButton, 
  Tooltip, Grid, FormControl, InputLabel, Select
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';

const Posts = () => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'news',
    is_published: false
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPosts();
      
      if (response && response.posts) {
        const formattedPosts = response.posts
          .filter(post => post && post.id)
          .map(post => ({
            id: post.id,
            title: post.title || '',
            content: post.content || '',
            post_type: post.post_type || 'news',
            is_published: post.is_published || false,
            created_at: post.createdAt || new Date().toISOString(),
            start_date: post.start_date,
            end_date: post.end_date
          }));
        setPosts(formattedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('[Posts] Error fetching posts:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedPost) {
        await adminService.updatePost(selectedPost.id, formData);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await adminService.createPost(formData);
        toast.success('Tạo bài viết mới thành công');
      }
      handleClose();
      fetchPosts();
    } catch (error) {
      console.error('[Posts] Error submitting post:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (post) => {
    if (!post || !post.id) {
      toast.error('Dữ liệu bài viết không hợp lệ');
      return;
    }
    setSelectedPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      post_type: post.post_type || 'news',
      is_published: post.is_published || false
    });
    setOpen(true);
  };

  const handleDelete = async (post) => {
    if (!post || !post.id) {
      toast.error('Dữ liệu bài viết không hợp lệ');
      return;
    }

    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await adminService.deletePost(post.id);
        toast.success('Xóa bài viết thành công');
        fetchPosts();
      } catch (error) {
        console.error('[Posts] Error deleting post:', error);
        toast.error(error.response?.data?.message || 'Không thể xóa bài viết');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
    setFormData({
      title: '',
      content: '',
      post_type: 'news',
      is_published: false
    });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'title', headerName: 'Tiêu đề', width: 300 },
    { 
      field: 'post_type', 
      headerName: 'Loại', 
      width: 130,
      valueGetter: (params) => {
        const types = {
          news: 'Tin tức',
          promotion: 'Khuyến mãi',
          announcement: 'Thông báo',
          introduction: 'Giới thiệu'
        };
        return types[params] || params || '';
      }
    },
    {
      field: 'is_published',
      headerName: 'Trạng thái',
      width: 130,
      valueGetter: (params) => {
        return params === true ? 'Đã đăng' : 'Nháp';
      }
    },
    {
      field: 'created_at',
      headerName: 'Ngày tạo',
      width: 180,
      valueGetter: (params) => {
        if (!params) return '';
        const date = new Date(params);
        return date.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 130,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Sửa">
            <IconButton color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton color="error" onClick={() => handleDelete(params.row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Thêm bài viết mới
      </Button>

      <DataGrid
        rows={posts}
        columns={columns}
        pageSize={5}
        loading={loading}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        getRowId={(row) => row.id}
        onRowClick={(params) => {
          console.log('[Posts] Row clicked:', params);
        }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Tiêu đề"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Nội dung"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                multiline
                rows={4}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <FormControl fullWidth>
                <InputLabel>Loại bài viết</InputLabel>
                <Select
                  value={formData.post_type}
                  label="Loại bài viết"
                  onChange={(e) => setFormData({...formData, post_type: e.target.value})}
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
                  value={formData.is_published}
                  label="Trạng thái"
                  onChange={(e) => setFormData({...formData, is_published: e.target.value === 'true'})}
                >
                  <MenuItem value="false">Nháp</MenuItem>
                  <MenuItem value="true">Đăng ngay</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPost ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts;