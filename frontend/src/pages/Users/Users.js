import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, Alert, CircularProgress, Chip, Switch,
  FormControlLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../../utils/api';

const defaultForm = { name: '', username: '', password: '', role: 'cashier', shift: 'Morning', is_active: true };
const SHIFTS = ['Morning', 'Evening', 'Night'];
const ROLES = [{ value: 'admin', label: 'Admin', color: '#F44336' }, { value: 'manager', label: 'Manager', color: '#FFC107' }, { value: 'cashier', label: 'Cashier', color: '#4CAF50' }];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetDialog, setResetDialog] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Admin access required.' : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setForm(defaultForm); setEditId(null); setError(''); setDialog(true); };
  const openEdit = (u) => {
    setForm({ name: u.name, username: u.username, password: '', role: u.role, shift: u.shift, is_active: u.is_active });
    setEditId(u.id); setError(''); setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.username) { setError('Name and username required.'); return; }
    if (!editId && !form.password) { setError('Password required for new user.'); return; }
    setSaving(true); setError('');
    try {
      if (editId) {
        await api.put(`/users/${editId}`, { name: form.name, role: form.role, shift: form.shift, is_active: form.is_active });
        setSuccess('User updated!');
      } else {
        await api.post('/users', form);
        setSuccess('User created!');
      }
      setDialog(false); loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError('Minimum 6 characters required.'); return; }
    try {
      await api.put(`/users/${resetDialog.id}/reset-password`, { newPassword });
      setSuccess(`Password reset for ${resetDialog.name}`);
      setResetDialog(null); setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Reset failed.');
    }
  };

  const getRoleChip = (role) => {
    const r = ROLES.find(x => x.value === role) || { color: '#888' };
    return <Chip label={role} size="small" sx={{ bgcolor: `${r.color}20`, color: r.color, fontWeight: 700, textTransform: 'capitalize' }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>👥 User Management</Typography>
        <Button id="add-user-btn" variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add User</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFC107', color: '#121212', fontSize: '0.9rem', fontWeight: 700 }}>
                        {u.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{u.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="textSecondary">@{u.username}</Typography></TableCell>
                  <TableCell>{getRoleChip(u.role)}</TableCell>
                  <TableCell><Typography variant="body2" color="textSecondary">{u.shift}</Typography></TableCell>
                  <TableCell align="center">
                    <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small" color={u.is_active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: '#FFC107', mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => { setResetDialog(u); setError(''); }} sx={{ color: '#29B6F6' }}><LockResetIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}>
        <DialogTitle sx={{ color: '#FFC107', fontWeight: 700 }}>{editId ? '✏️ Edit User' : '➕ Add User'}</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Username *" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} fullWidth disabled={Boolean(editId)} /></Grid>
            {!editId && <Grid item xs={12}><TextField label="Password *" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} fullWidth /></Grid>}
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Role</InputLabel>
                <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} label="Role">
                  {ROLES.map(r => <MenuItem key={r.value} value={r.value} sx={{ color: r.color }}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Shift</InputLabel>
                <Select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))} label="Shift">
                  {SHIFTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {editId && (
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} color="primary" />} label="Active" />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editId ? 'Save' : 'Add User')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={Boolean(resetDialog)} onClose={() => { setResetDialog(null); setError(''); }}
        PaperProps={{ sx: { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}>
        <DialogTitle sx={{ color: '#29B6F6', fontWeight: 700 }}>🔑 Reset Password - {resetDialog?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setResetDialog(null); setError(''); }} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" sx={{ bgcolor: '#29B6F6', '&:hover': { bgcolor: '#0288D1' } }}>Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
