import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Alert, CircularProgress, Divider, Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Settings = () => {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) { setError('All fields are required.'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSaving(true); setError('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setSuccess('✅ Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 3 }}>⚙️ Settings</Typography>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#FFC107', color: '#121212', fontSize: '2rem', fontWeight: 800, mx: 'auto', mb: 2 }}>
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>{user?.name}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>@{user?.username}</Typography>
              <Typography variant="caption" sx={{ color: '#FFC107', fontWeight: 600, textTransform: 'capitalize', bgcolor: 'rgba(255,193,7,0.1)', px: 1.5, py: 0.5, borderRadius: 10 }}>
                {user?.role} • {user?.shift} Shift
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.68rem' }}>System Info</Typography>
                {[
                  { label: 'System', value: 'Lava Cafe POS v1.0' },
                  { label: 'Business', value: 'Lava Cafe Food & Juice Bar' },
                  { label: 'Database', value: 'PostgreSQL' },
                  { label: 'Build', value: '2026.05.31' },
                ].map((info, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                    <Typography variant="caption" color="textSecondary">{info.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>{info.value}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <LockIcon sx={{ color: '#FFC107' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Change Password</Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handlePasswordChange}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      id="settings-current-pw"
                      label="Current Password"
                      type="password"
                      value={pwForm.currentPassword}
                      onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="settings-new-pw"
                      label="New Password"
                      type="password"
                      value={pwForm.newPassword}
                      onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="settings-confirm-pw"
                      label="Confirm New Password"
                      type="password"
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button id="settings-save-pw-btn" type="submit" variant="contained" disabled={saving} sx={{ mt: 1 }}>
                      {saving ? <CircularProgress size={20} color="inherit" /> : '🔐 Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* Color Theme Info */}
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>🎨 Theme Colors</Typography>
              <Grid container spacing={1.5}>
                {[
                  { name: 'Primary Yellow', hex: '#FFC107', bg: '#FFC107' },
                  { name: 'Dark Background', hex: '#121212', bg: '#121212', border: '1px solid rgba(255,255,255,0.1)' },
                  { name: 'White Text', hex: '#FFFFFF', bg: '#FFFFFF' },
                  { name: 'Success Green', hex: '#4CAF50', bg: '#4CAF50' },
                  { name: 'Danger Red', hex: '#F44336', bg: '#F44336' },
                ].map(color => (
                  <Grid item xs={6} sm={4} key={color.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: color.bg, border: color.border || 'none', flexShrink: 0 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>{color.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{color.hex}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
