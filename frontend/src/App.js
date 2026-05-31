import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ColorModeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import POSBilling from './pages/POS/POSBilling';
import Products from './pages/Products/Products';
import Reports from './pages/Reports/Reports';
import Users from './pages/Users/Users';
import Settings from './pages/Settings/Settings';
import { CircularProgress, Box } from '@mui/material';
import Inventory from './pages/Inventory/Inventory';

const PrivateRoute = ({ children, adminOnly }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" size={48} />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" size={48} />
      </Box>
    );
  }
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/pos" element={<PrivateRoute><POSBilling /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
      <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute adminOnly><Reports /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute adminOnly><Users /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => (
  <ColorModeProvider>
    <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </ColorModeProvider>
);

export default App;
