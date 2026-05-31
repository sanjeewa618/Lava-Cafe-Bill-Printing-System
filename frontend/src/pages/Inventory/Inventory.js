import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, IconButton, Alert, CircularProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, Paper, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const defaultForm = { name: '', stock: '', min_stock: '', unit: 'kg' };
const UNITS = ['kg', 'pcs', 'liters', 'bottles', 'g', 'ml', 'packs'];

const Inventory = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);

  useEffect(() => {
    loadInventory();
  }, [filterLowStock]);

  const loadInventory = async () => {
    try {
      const res = await api.get(`/inventory?lowStock=${filterLowStock}`);
      setItems(res.data.inventory);
    } catch (err) {
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setError('');
    setDialog(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      stock: item.stock,
      min_stock: item.min_stock,
      unit: item.unit
    });
    setEditId(item.id);
    setError('');
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || form.stock === '' || form.min_stock === '') {
      setError('Name, stock level, and minimum stock are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/inventory/${editId}`, form);
        setSuccess('Inventory item updated successfully!');
      } else {
        await api.post('/inventory', form);
        setSuccess('New inventory item added successfully!');
      }
      setDialog(false);
      loadInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAdjust = async (id, currentStock, delta, name) => {
    const newStock = Math.max(0, parseFloat(currentStock) + delta);
    try {
      const item = items.find(i => i.id === id);
      await api.put(`/inventory/${id}`, {
        name: item.name,
        stock: newStock,
        min_stock: item.min_stock,
        unit: item.unit
      });
      setSuccess(`Updated stock for ${name} to ${newStock} ${item.unit}`);
      loadInventory();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError('Failed to adjust stock.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setDeleteDialog(null);
      setSuccess('Item deleted from inventory!');
      loadInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Delete failed.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFF' }}>
          📦 Raw Materials Inventory
        </Typography>
        {isAdmin && (
          <Button
            id="add-inventory-btn"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
            Add Material
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            id="inventory-search"
            fullWidth
            size="small"
            placeholder="Search raw materials (e.g. Cheese, Bread)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#FFC107' }} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant={filterLowStock ? 'contained' : 'outlined'}
            color={filterLowStock ? 'error' : 'primary'}
            onClick={() => setFilterLowStock(!filterLowStock)}
            startIcon={<WarningAmberIcon />}
            sx={{
              height: '40px',
              fontWeight: 700,
              borderColor: filterLowStock ? '#F44336' : 'rgba(255,193,7,0.3)',
              color: filterLowStock ? '#FFF' : (filterLowStock ? '#121212' : '#FFC107')
            }}
          >
            {filterLowStock ? 'Showing Low Stock' : 'Filter Low Stock'}
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Material Name</TableCell>
                <TableCell align="center">Stock Status</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Min Stock Limit</TableCell>
                <TableCell align="center">Quick Adjust</TableCell>
                {isAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(item => {
                const isLow = parseFloat(item.stock) <= parseFloat(item.min_stock);
                return (
                  <TableRow key={item.id} sx={{
                    bgcolor: isLow ? 'rgba(244,67,54,0.03)' : 'transparent',
                    '&:hover': { bgcolor: isLow ? 'rgba(244,67,54,0.06)' : 'rgba(255,193,7,0.03)' }
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '1.4rem' }}>
                          {item.name.toLowerCase().includes('cheese') ? '🧀' :
                           item.name.toLowerCase().includes('bread') ? '🍞' :
                           item.name.toLowerCase().includes('chicken') ? '🍗' :
                           item.name.toLowerCase().includes('orange') ? '🍊' :
                           item.name.toLowerCase().includes('milk') ? '🥛' :
                           item.name.toLowerCase().includes('sugar') ? '🍬' : '📦'}
                        </Typography>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFF' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date(item.updated_at).toLocaleDateString('en-GB')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {isLow ? (
                        <Chip
                          icon={<WarningAmberIcon sx={{ fontSize: '14px !important', color: '#F44336 !important' }} />}
                          label="Restock Needed"
                          size="small"
                          sx={{ bgcolor: 'rgba(244,67,54,0.15)', color: '#F44336', fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important', color: '#4CAF50 !important' }} />}
                          label="In Stock"
                          size="small"
                          sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#4CAF50', fontWeight: 700 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700, color: isLow ? '#F44336' : '#FFC107', fontSize: '1rem' }}>
                        {item.stock} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#888' }}>{item.unit}</span>
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#888', fontWeight: 600 }}>
                        {item.min_stock} {item.unit}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title={`Decrease Stock (-5 ${item.unit})`}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuickAdjust(item.id, item.stock, -5, item.name)}
                            sx={{ color: '#F44336', bgcolor: 'rgba(244,67,54,0.08)', p: 0.5 }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Decrease Stock (-1 ${item.unit})`}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuickAdjust(item.id, item.stock, -1, item.name)}
                            sx={{ color: '#F44336', bgcolor: 'rgba(244,67,54,0.08)', p: 0.5 }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>-1</Typography>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Increase Stock (+1 ${item.unit})`}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuickAdjust(item.id, item.stock, 1, item.name)}
                            sx={{ color: '#4CAF50', bgcolor: 'rgba(76,175,80,0.08)', p: 0.5 }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>+1</Typography>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Increase Stock (+5 ${item.unit})`}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuickAdjust(item.id, item.stock, 5, item.name)}
                            sx={{ color: '#4CAF50', bgcolor: 'rgba(76,175,80,0.08)', p: 0.5 }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: '#FFC107', mr: 0.5 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteDialog(item)} sx={{ color: '#F44336' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 4, color: '#888' }}>
                    No inventory materials found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A1A1A', border: '1px solid rgba(255,193,7,0.2)' } }}>
        <DialogTitle sx={{ color: '#FFC107', fontWeight: 700 }}>
          {editId ? '✏️ Edit Material' : '➕ Add Raw Material'}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Material Name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Current Stock *"
                type="number"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Min Stock Limit *"
                type="number"
                value={form.min_stock}
                onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))}
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Measurement Unit</InputLabel>
                <Select
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  label="Measurement Unit"
                >
                  {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editId ? 'Save Changes' : 'Add Material')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)}
        PaperProps={{ sx: { bgcolor: '#1A1A1A', border: '1px solid rgba(244,67,54,0.3)' } }}>
        <DialogTitle sx={{ color: '#F44336', fontWeight: 700 }}>🗑️ Delete Material</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong style={{ color: '#FFF' }}>{deleteDialog?.name}</strong> from inventory?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteDialog?.id)} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
