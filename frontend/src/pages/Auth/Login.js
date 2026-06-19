import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme-aware colors
  const inputBg    = isDark ? '#1A1A1A' : '#FFFFFF';
  const inputText  = isDark ? '#FFFFFF' : '#121212';
  const accentClr  = isDark ? '#FFFFFF' : '#FFC107';
  const borderDim  = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,193,7,0.4)';
  const autofillBg = isDark ? '#1A1A1A' : '#FFFFFF';

  // Shared sx for both inputs
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: inputBg,
      '&:hover': { backgroundColor: inputBg },
      '&.Mui-focused': { backgroundColor: inputBg },
      '& fieldset': { borderColor: borderDim },
      '&:hover fieldset': { borderColor: accentClr },
      '&.Mui-focused fieldset': { borderColor: accentClr, borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: accentClr },
    '& .MuiInputBase-input': {
      color: inputText,
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px ' + autofillBg + ' inset',
        WebkitTextFillColor: inputText,
        transition: 'background-color 5000s ease-in-out 0s',
      },
    },
  };

  // Formatted datetime: "19 Jun 2026  11:23:02 AM"
  const formatDate = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day  = String(d.getDate()).padStart(2, '0');
    const mon  = months[d.getMonth()];
    const yr   = d.getFullYear();
    let   hr   = d.getHours();
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    const min  = String(d.getMinutes()).padStart(2, '0');
    const sec  = String(d.getSeconds()).padStart(2, '0');
    return { date: `${day} ${mon} ${yr}`, time: `${String(hr).padStart(2,'0')}:${min}:${sec} ${ampm}` };
  };

  const { date, time } = formatDate(now);

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
      background: isDark
        ? 'linear-gradient(135deg, #0A0A0A 0%, #1A1A0A 50%, #0A0A0A 100%)'
        : 'linear-gradient(135deg, #F8F9FA 0%, #FFF8E1 50%, #F8F9FA 100%)',
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
        bgcolor: isDark ? '#1A1A1A' : '#FFFFFF',
        border: isDark ? '1px solid rgba(255,193,7,0.2)' : '1px solid rgba(255,193,7,0.3)',
        boxShadow: isDark
          ? '0 25px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,193,7,0.05)'
          : '0 25px 80px rgba(0,0,0,0.08), 0 0 60px rgba(255,193,7,0.08)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Live Date & Time */}
        <Box sx={{
          textAlign: 'center',
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          background: isDark ? 'rgba(255,193,7,0.05)' : 'rgba(255,193,7,0.08)',
          border: isDark ? '1px solid rgba(255,193,7,0.1)' : '1px solid rgba(255,193,7,0.2)',
        }}>
          <Typography sx={{
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#FFC107',
            fontFamily: "'Outfit', monospace",
            lineHeight: 1.2,
          }}>
            {time}
          </Typography>
          <Typography sx={{
            fontSize: '0.75rem',
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
            letterSpacing: '0.12em',
            mt: 0.3,
          }}>
            {date}
          </Typography>
        </Box>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
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
            <LocalFireDepartmentIcon sx={{ fontSize: 38, color: '#121212' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#FFC107' }}>LAVA</span>
            <span style={{ color: isDark ? '#FFFFFF' : '#121212' }}> CAFE</span>
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#888' : '#999', mt: 0.5, letterSpacing: '0.15em', fontSize: '0.75rem' }}>
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
              sx={inputSx}
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
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#FFC107' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: isDark ? '#888' : '#999' }}>
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
          <Typography variant="body2" sx={{ color: isDark ? '#888' : '#999' }}>
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
          <Typography variant="caption" sx={{ color: isDark ? '#666' : '#999', display: 'block', textAlign: 'center', mb: 0.5 }}>
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
