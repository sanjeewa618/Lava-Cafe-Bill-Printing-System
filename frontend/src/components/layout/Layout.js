import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
  Divider, Tooltip, useMediaQuery, useTheme as useMuiTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LiveClock from '../common/LiveClock';
import { useColorMode } from '../../context/ThemeContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'POS Billing', icon: <PointOfSaleIcon />, path: '/pos' },
  { label: 'Products', icon: <RestaurantMenuIcon />, path: '/products' },
  { label: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { label: 'Reports', icon: <BarChartIcon />, path: '/reports', adminOnly: true },
  { label: 'Users', icon: <PeopleIcon />, path: '/users', adminOnly: true },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElTheme, setAnchorElTheme] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleThemeMenuOpen = (e) => setAnchorElTheme(e.currentTarget);
  const handleThemeMenuClose = () => setAnchorElTheme(null);
  const handleThemeChange = (newMode) => {
    toggleColorMode(newMode);
    handleThemeMenuClose();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFC107, #FF6F00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: mode === 'dark' ? '0 0 20px rgba(255,193,7,0.4)' : '0 0 15px rgba(255,193,7,0.2)',
          animation: 'pulseGlow 2s infinite ease-in-out',
          '@keyframes pulseGlow': {
            '0%, 100%': { boxShadow: mode === 'dark' ? '0 0 15px rgba(255,193,7,0.3)' : '0 0 10px rgba(255,193,7,0.1)', transform: 'scale(1)' },
            '50%': { boxShadow: mode === 'dark' ? '0 0 25px rgba(255,193,7,0.6)' : '0 0 20px rgba(255,193,7,0.4)', transform: 'scale(1.05)' }
          }
        }}>
          <LocalFireDepartmentIcon sx={{ color: '#121212', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 900, 
            lineHeight: 1, 
            letterSpacing: '-0.02em',
            animation: 'textShadowPop 3s infinite alternate ease-in-out',
            '@keyframes textShadowPop': {
              '0%': { textShadow: 'none' },
              '100%': { textShadow: mode === 'dark' ? '0 0 10px rgba(255,193,7,0.3)' : '0 0 8px rgba(255,193,7,0.1)' }
            }
          }}>
            <Box component="span" sx={{ color: '#FFC107' }}>LAVA</Box>
            <Box component="span" sx={{ color: 'text.primary' }}> CAFE</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            POS SYSTEM
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav Items */}
      <List sx={{ flex: 1, py: 1 }}>
        {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  mx: 1, borderRadius: 2, mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,193,7,0.15)',
                    '& .MuiListItemIcon-root': { color: '#FFC107' },
                    '& .MuiListItemText-primary': { color: '#FFC107', fontWeight: 700 },
                    borderLeft: '3px solid #FFC107',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? '#FFC107' : '#888' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(255,193,7,0.08)' : 'rgba(255,193,7,0.04)' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFC107', color: '#121212', fontSize: '0.85rem', fontWeight: 700 }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>{user?.name}</Typography>
            <Typography variant="caption" sx={{ color: '#FFC107', fontSize: '0.7rem', textTransform: 'capitalize' }}>
              {user?.role} • {user?.shift}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.paper' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.paper', border: 'none', borderRight: '1px solid rgba(255,193,7,0.1)' } }}
          open>
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* AppBar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,193,7,0.1)', zIndex: 1100 }}>
          <Toolbar sx={{ gap: 2 }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: '#FFC107', display: { xs: 'none', sm: 'block' } }}>
              LAVA CAFE POS
            </Typography>
            <Box sx={{ flex: 1 }} />

            <Tooltip title="Change Theme">
              <IconButton 
                onClick={handleThemeMenuOpen} 
                onMouseEnter={handleThemeMenuOpen}
                sx={{ 
                  color: '#FFC107',
                  bgcolor: mode === 'dark' ? 'rgba(255,193,7,0.05)' : 'rgba(255,193,7,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,193,7,0.15)' }
                }}
              >
                {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElTheme}
              open={Boolean(anchorElTheme)}
              onClose={handleThemeMenuClose}
              MenuListProps={{ onMouseLeave: handleThemeMenuClose }}
              PaperProps={{
                sx: { 
                  mt: 1, 
                  bgcolor: mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
                  border: `1px solid ${mode === 'dark' ? 'rgba(255,193,7,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <MenuItem onClick={() => handleThemeChange('light')} sx={{ gap: 1.5, py: 1, minWidth: 140 }}>
                <LightModeIcon sx={{ fontSize: 20, color: '#FFC107' }} />
                <Typography variant="body2" sx={{ fontWeight: mode === 'light' ? 700 : 400 }}>Light Mode</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleThemeChange('dark')} sx={{ gap: 1.5, py: 1 }}>
                <DarkModeIcon sx={{ fontSize: 20, color: '#FFC107' }} />
                <Typography variant="body2" sx={{ fontWeight: mode === 'dark' ? 700 : 400 }}>Dark Mode</Typography>
              </MenuItem>
            </Menu>

            <LiveClock />

            <Tooltip title="Account">
              <IconButton onClick={handleMenuOpen} sx={{ gap: 1 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#FFC107', color: '#121212', fontSize: '0.85rem', fontWeight: 700 }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <Typography variant="body2" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
              </IconButton>
            </Tooltip>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
              PaperProps={{ sx: { bgcolor: '#1A1A1A', border: '1px solid rgba(255,193,7,0.2)', minWidth: 180 } }}>
              <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                <SettingsIcon sx={{ mr: 1.5, fontSize: 18 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#F44336' }}>
                <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
