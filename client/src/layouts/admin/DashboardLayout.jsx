import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Flight as FlightIcon,
  AirplanemodeActive as AirplaneIcon,
  Article as ArticleIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log('[Logout] Starting logout process...');
    console.log('[Logout] Current auth state:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      authState: localStorage.getItem('authState')
    });

    // Gọi hàm logout từ AuthContext để xóa cả state và localStorage
    logout();

    console.log('[Logout] After clearing storage:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      authState: localStorage.getItem('authState')
    });

    console.log('[Logout] Redirecting to login page...');
    // Chuyển hướng về trang login
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin'
    },
    {
      text: 'Chuyến bay',
      icon: <FlightIcon />,
      path: '/admin/flights'
    },
    {
      text: 'Máy bay',
      icon: <AirplaneIcon />,
      path: '/admin/airplanes'
    },
    {
      text: 'Đặt vé',
      icon: <ConfirmationNumberIcon />,
      path: '/admin/bookings'
    },
    {
      text: 'Bài viết',
      icon: <ArticleIcon />,
      path: '/admin/posts'
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            QAirline Admin
          </Typography>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Đăng xuất">
              <IconButton onClick={handleLogout} color="inherit">
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};

export default DashboardLayout; 