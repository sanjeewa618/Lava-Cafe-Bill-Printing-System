import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress, MenuItem, Select,
  FormControl, InputLabel, Grid, Link
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import api from '../../utils/api';

const SHIFTS = ['Morning', 'Evening', 'Night'];
const ROLES = [
  { value: 'admin', label: 'Admin (Full Access)' },
  { value: 'cashier', label: 'Cashier' }
];

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'cashier',
    shift: 'Morning'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const { token, user } = res.data;
      
      localStorage.setItem('lava_cafe_token', token);
      localStorage.setItem('lava_cafe_user', JSON.stringify(user));
      
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        </Box>
      </Box>

      {/* RIGHT SIDE: FULL HEIGHT LIGHT SIGNUP FORM CONTAINER (40% width on md+, 100% on mobile) */}
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
        overflowY: 'auto',
      }}>
        {/* Mobile Header branding */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#FFC107' }}>LAVA</span>
            <span style={{ color: '#121212' }}> CAFE</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5, letterSpacing: '0.12em', fontSize: '0.7rem' }}>
            CREATE NEW ACCOUNT
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#121212', letterSpacing: '-0.02em' }}>
            Get Started
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
            Create an admin or cashier account below.
          </Typography>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                </Grid>
              )}
              {success && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  id="signup-name"
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: '#FFC107' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="signup-username"
                  name="username"
                  label="Username / Email"
                  value={form.username}
                  onChange={handleChange}
                  fullWidth
                  required
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="signup-password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  autoComplete="new-password"
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
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required sx={inputSx}>
                  <InputLabel id="signup-role-label">Role</InputLabel>
                  <Select
                    labelId="signup-role-label"
                    id="signup-role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    label="Role"
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <WorkIcon sx={{ color: '#FFC107', fontSize: 20 }} />
                      </InputAdornment>
                    }
                  >
                    {ROLES.map(r => (
                      <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required sx={inputSx}>
                  <InputLabel id="signup-shift-label">Shift</InputLabel>
                  <Select
                    labelId="signup-shift-label"
                    id="signup-shift"
                    name="shift"
                    value={form.shift}
                    onChange={handleChange}
                    label="Shift"
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <ScheduleIcon sx={{ color: '#FFC107', fontSize: 20 }} />
                      </InputAdornment>
                    }
                  >
                    {SHIFTS.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  id="signup-submit-btn"
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register & Sign In'}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
                sx={{ 
                  color: '#FFC107', 
                  textDecoration: 'none', 
                  fontWeight: 700,
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                Login Here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
