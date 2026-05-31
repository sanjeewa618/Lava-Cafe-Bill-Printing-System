import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, InputAdornment,
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
  { value: 'manager', label: 'Manager' },
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
      
      // Store credentials to automatically log in the user after signing up
      localStorage.setItem('lava_cafe_token', token);
      localStorage.setItem('lava_cafe_user', JSON.stringify(user));
      
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        // Reload page to update layout or navigate straight to dashboard
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      py: 4,
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
        maxWidth: 480,
        p: 4,
        mx: 2,
        bgcolor: '#1A1A1A',
        border: '1px solid rgba(255,193,7,0.2)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,193,7,0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFC107 0%, #FF6F00 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
            boxShadow: '0 0 25px rgba(255,193,7,0.4)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%,100%': { boxShadow: '0 0 25px rgba(255,193,7,0.4)' },
              '50%': { boxShadow: '0 0 45px rgba(255,193,7,0.7)' },
            },
          }}>
            <LocalFireDepartmentIcon sx={{ fontSize: 36, color: '#121212' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#FFC107' }}>LAVA</span>
            <span style={{ color: '#FFFFFF' }}> CAFE</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5, letterSpacing: '0.15em', fontSize: '0.75rem' }}>
            CREATE NEW ACCOUNT
          </Typography>
        </Box>

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
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth required>
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
              <FormControl fullWidth required>
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
                  py: 1.5, 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(255,193,7,0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(255,193,7,0.5)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register & Sign In'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#888' }}>
            Already have an account?{' '}
            <Link 
              component={RouterLink} 
              to="/login" 
              sx={{ 
                color: '#FFC107', 
                textDecoration: 'none', 
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' } 
              }}
            >
              Login Here
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Signup;
