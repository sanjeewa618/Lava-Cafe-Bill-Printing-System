import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, TextField, Button, Typography, InputAdornment,
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
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Shared sx for inputs (Light Mode / White & Yellow styling)
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#FFFFFF',
      '&:hover': { backgroundColor: '#FFFFFF' },
      '&.Mui-focused': { backgroundColor: '#FFFFFF' },
      '& fieldset': { borderColor: 'rgba(255,193,7,0.4)' },
      '&:hover fieldset': { borderColor: '#FFC107' },
      '&.Mui-focused fieldset': { borderColor: '#FFC107', borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.6)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#FFB300' },
    '& .MuiInputBase-input': {
      color: '#121212',
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset',
        WebkitTextFillColor: '#121212',
        transition: 'background-color 5000s ease-in-out 0s',
      },
    },
  };

  // Formatted datetime
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
      background: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* LEFT SIDE: RESTAURANT ILLUSTRATION (60% width on md+, hidden on mobile) */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '60%',
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 6,
        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url(/lava_cafe_login_art.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: 'inset -20px 0 80px rgba(0,0,0,0.8)',
      }}>
        {/* Branding text overlay inside Left Section */}
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 500 }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFC107 0%, #FF6F00 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3,
            boxShadow: '0 0 40px rgba(255,193,7,0.6)',
          }}>
            <LocalFireDepartmentIcon sx={{ fontSize: 44, color: '#121212' }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: '#FFFFFF', mb: 2 }}>
            <span style={{ color: '#FFC107' }}>LAVA</span> CAFE
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, mb: 4, letterSpacing: '0.05em' }}>
            Smart POS & Billing Management System
          </Typography>
          <Box sx={{
            display: 'inline-block',
            p: 2,
            borderRadius: 3,
            background: 'rgba(255,193,7,0.08)',
            border: '1px solid rgba(255,193,7,0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography sx={{
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#FFC107',
              fontFamily: "'Outfit', monospace",
              lineHeight: 1.2,
            }}>
              {time}
            </Typography>
            <Typography sx={{
              fontSize: '0.85rem',
              color: '#FFFFFF',
              letterSpacing: '0.12em',
              mt: 0.5,
              fontWeight: 700,
            }}>
              {date}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* RIGHT SIDE: FULL HEIGHT LIGHT LOGIN FORM CONTAINER (40% width on md+, 100% on mobile) */}
      <Box sx={{
        width: { xs: '100%', md: '40%' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 4, md: 6, lg: 8 },
        bgcolor: '#FFFDF9', // Warm white/yellow background
        borderLeft: '1px solid rgba(255,193,7,0.2)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.03)',
        zIndex: 2,
      }}>
        {/* Mobile Header branding */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#FFC107' }}>LAVA</span>
            <span style={{ color: '#121212' }}> CAFE</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5, letterSpacing: '0.12em', fontSize: '0.7rem' }}>
            POS SYSTEM
          </Typography>

          {/* Mobile Clock */}
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.15)' }}>
            <Typography sx={{ color: '#000000', fontWeight: 700, fontSize: '1.2rem' }}>
              {time}
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>
              {date}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#121212', letterSpacing: '-0.02em' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
            Please enter your login credentials below.
          </Typography>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#999' }}>
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
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  borderRadius: 3,
                  boxShadow: '0 4px 15px rgba(255,193,7,0.35)',
                  '&:hover': {
                    boxShadow: '0 6px 22px rgba(255,193,7,0.55)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/signup"
                sx={{
                  color: '#FFC107',
                  textDecoration: 'none',
                  fontWeight: 700,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>

          <Box sx={{
            mt: 4,
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(255,193,7,0.04)',
            border: '1px solid rgba(255,193,7,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': { bgcolor: 'rgba(255,193,7,0.06)' }
          }}>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', textAlign: 'center', mb: 0.5, fontWeight: 600 }}>
              Demo Credentials
            </Typography>
            <Typography variant="caption" sx={{ color: '#B58500', display: 'block', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
              Admin: admin / admin123 &nbsp;|&nbsp; Cashier: kasun / kasun123
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
