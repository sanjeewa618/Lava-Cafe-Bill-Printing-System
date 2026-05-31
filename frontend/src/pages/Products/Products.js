import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, IconButton, Alert, Switch, FormControlLabel,
  InputAdornment, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ICONS = ['🍔', '🥪', '🍕', '🍟', '🥤', '🍊', '🥭', '🍓', '☕', '🧊', '🍰', '🍫', '🍗', '🥗', '🥙', '🌮', '🍦', '🧁'];

const defaultForm = { name: '', price: '', category_id: '', stock: '', min_stock: '5', unit: 'pcs', icon: '🍽️', description: '', is_available: true };

const Products = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [dialog, setDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories'),
      ]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.categories);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || String(p.category_id) === filterCat;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setForm(defaultForm); setEditId(null); setError(''); setDialog(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, category_id: p.category_id || '', stock: p.stock, min_stock: p.min_stock, unit: p.unit, icon: p.icon, description: p.description || '', is_available: p.is_available });
    setEditId(p.id);
    setError('');
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('Name and price are required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/products/${editId}`, form);
        setSuccess('Product updated!');
      } else {
        await api.post('/products', form);
        setSuccess('Product created!');
      }
      setDialog(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setDeleteDialog(null);
      setSuccess('Product deleted!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Delete failed.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFF' }}>🍔 Products</Typography>
        {isAdmin && (
          <Button id="add-product-btn" variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Product
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" placeholder="Search products..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#FFC107' }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} label="Category">
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Status</TableCell>
                {isAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '1.4rem' }}>{p.icon}</Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFF' }}>{p.name}</Typography>
                        {p.description && <Typography variant="caption" color="textSecondary">{p.description}</Typography>}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.category_name || 'Uncategorized'} size="small" sx={{ bgcolor: 'rgba(255,193,7,0.1)', color: '#FFC107' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 700, color: '#FFC107' }}>Rs. {Number(p.price).toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${p.stock} ${p.unit}`}
                      size="small"
                      color={p.stock <= p.min_stock ? 'error' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={p.is_available ? 'Available' : 'Unavailable'}
                      size="small"
                      color={p.is_available ? 'success' : 'default'}
                    />
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: '#FFC107', mr: 0.5 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteDialog(p)} sx={{ color: '#F44336' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#888' }}>No products found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A1A1A', border: '1px solid rgba(255,193,7,0.2)' } }}>
        <DialogTitle sx={{ color: '#FFC107', fontWeight: 700 }}>
          {editId ? '✏️ Edit Product' : '➕ Add Product'}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {ICONS.map(ic => (
                  <Box key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    sx={{ cursor: 'pointer', fontSize: '1.5rem', p: 0.5, borderRadius: 1, border: form.icon === ic ? '2px solid #FFC107' : '2px solid transparent', '&:hover': { bgcolor: 'rgba(255,193,7,0.1)' } }}>
                    {ic}
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}><TextField label="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth /></Grid>
            <Grid item xs={6}><TextField label="Price (Rs.) *" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} fullWidth inputProps={{ min: 0 }} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} label="Category">
                  {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.icon} {c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}><TextField label="Stock" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} fullWidth inputProps={{ min: 0 }} /></Grid>
            <Grid item xs={4}><TextField label="Min Stock" type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} fullWidth inputProps={{ min: 0 }} /></Grid>
            <Grid item xs={4}><TextField label="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} /></Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} color="primary" />} label="Available on POS" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editId ? 'Save Changes' : 'Add Product')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)}
        PaperProps={{ sx: { bgcolor: '#1A1A1A', border: '1px solid rgba(244,67,54,0.3)' } }}>
        <DialogTitle sx={{ color: '#F44336', fontWeight: 700 }}>🗑️ Delete Product</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong style={{ color: '#FFF' }}>{deleteDialog?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteDialog?.id)} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
