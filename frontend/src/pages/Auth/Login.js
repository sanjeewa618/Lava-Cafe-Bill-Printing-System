import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Card, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress, Link
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A0A 50%, #0A0A0A 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,193,7,0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }}>
      {/* Animated background particles */}
      {[...Array(6)].map((_, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          width: `${20 + i * 10}px`,
          height: `${20 + i * 10}px`,
          borderRadius: '50%',
          background: `rgba(255,193,7,${0.03 + i * 0.01})`,
          top: `${10 + i * 15}%`,
          left: `${5 + i * 15}%`,
          animation: `float${i} ${4 + i}s ease-in-out infinite`,
          '@keyframes float0': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        }} />
      ))}

      <Card sx={{
        width: '100%',
        maxWidth: 420,
        p: 4,
        bgcolor: '#1A1A1A',
        border: '1px solid rgba(255,193,7,0.2)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,193,7,0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFC107 0%, #FF6F00 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
            boxShadow: '0 0 30px rgba(255,193,7,0.5), 0 0 60px rgba(255,193,7,0.2)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%,100%': { boxShadow: '0 0 30px rgba(255,193,7,0.5)' },
              '50%': { boxShadow: '0 0 50px rgba(255,193,7,0.8)' },
            },
          }}>
            <LocalFireDepartmentIcon sx={{ fontSize: 42, color: '#121212' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#FFC107' }}>LAVA</span>
            <span style={{ color: '#FFFFFF' }}> CAFE</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5, letterSpacing: '0.15em', fontSize: '0.75rem' }}>
            POS MANAGEMENT SYSTEM
          </Typography>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              id="login-username"
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              autoComplete="username"
              sx={{
                '& .MuiInputBase-input': {
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px #1A1A1A inset',
                    WebkitTextFillColor: '#fff',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#FFC107' }} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              id="login-password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              fullWidth
              autoComplete="current-password"
              sx={{
                '& .MuiInputBase-input': {
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px #1A1A1A inset',
                    WebkitTextFillColor: '#fff',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#FFC107' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#666' }}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              id="login-submit-btn"
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ 
                mt: 1, 
                py: 1.5, 
                fontSize: '1.1rem', 
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(255,193,7,0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(255,193,7,0.5)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Don't have an account?{' '}
            <Link 
              component={RouterLink} 
              to="/signup" 
              sx={{ 
                color: '#FFC107', 
                textDecoration: 'none', 
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' } 
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>

        <Box sx={{ 
          mt: 3, 
          p: 2, 
          borderRadius: 2, 
          bgcolor: 'rgba(255,193,7,0.03)', 
          border: '1px solid rgba(255,193,7,0.05)',
          opacity: 0.7,
          transition: 'opacity 0.3s ease',
          '&:hover': { opacity: 1 }
        }}>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', textAlign: 'center', mb: 0.5 }}>
            Demo Credentials
          </Typography>
          <Typography variant="caption" sx={{ color: '#997400', display: 'block', textAlign: 'center' }}>
            Admin: admin / admin123 &nbsp;|&nbsp; Cashier: kasun / kasun123
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
