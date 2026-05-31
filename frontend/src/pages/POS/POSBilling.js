import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Grid, Box, Card, CardContent, Typography, TextField, Button,
  Chip, IconButton, Divider, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  InputAdornment, Fab, Tooltip, Badge, CircularProgress, Tabs, Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PaymentIcon from '@mui/icons-material/Payment';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Receipt from './Receipt';

const ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In', icon: <RestaurantIcon fontSize="small" /> },
  { value: 'take_away', label: 'Take Away', icon: <ShoppingBagIcon fontSize="small" /> },
  { value: 'delivery', label: 'Delivery', icon: <DeliveryDiningIcon fontSize="small" /> },
];

const POSBilling = () => {
  const { user } = useAuth();
  const receiptRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState('');
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [prodRes, catRes, tableRes] = await Promise.all([
        api.get('/products?available=true'),
        api.get('/products/categories'),
        api.get('/orders/tables'),
      ]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.categories);
      setTables(tableRes.data.tables);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setProductLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || p.category_id === parseInt(activeCategory);
    return matchSearch && matchCat;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i => i.product_id === product.id
          ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.unit_price }
          : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        icon: product.icon,
        unit_price: parseFloat(product.price),
        qty: 1,
        total: parseFloat(product.price),
      }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev
      .map(i => i.product_id === productId
        ? { ...i, qty: Math.max(0, i.qty + delta), total: Math.max(0, i.qty + delta) * i.unit_price }
        : i
      )
      .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount('');
    setCashReceived('');
    setSelectedTable('');
    setOrderType('dine_in');
    setCompletedOrder(null);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.total, 0);
  const discountAmt = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmt);
  const balance = (parseFloat(cashReceived) || 0) - grandTotal;

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${completedOrder?.invoice_no || 'draft'}`,
  });

  const handleProcessPayment = async () => {
    if (cart.length === 0) { setError('Add items to cart first.'); return; }
    if (orderType === 'dine_in' && !selectedTable) { setError('Select a table for dine-in orders.'); return; }
    if (!cashReceived || parseFloat(cashReceived) < grandTotal) { setError('Cash received must be ≥ Grand Total.'); return; }

    setLoading(true);
    setError('');
    try {
      const tableObj = tables.find(t => t.id === parseInt(selectedTable));
      const res = await api.post('/orders', {
        items: cart,
        order_type: orderType,
        table_id: selectedTable || null,
        table_no: tableObj?.table_no || null,
        subtotal,
        discount: discountAmt,
        tax: 0,
        grand_total: grandTotal,
        cash_received: parseFloat(cashReceived),
        balance,
      });
      setCompletedOrder(res.data.order);
      setPaymentDialog(false);
      
      // Clear cart and current inputs but KEEP completedOrder for printing
      setCart([]);
      setDiscount('');
      setCashReceived('');
      
      setSuccessMsg(`✅ Order ${res.data.order.invoice_no} saved successfully!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 100px)', 
      display: 'flex', 
      flexDirection: 'column',
      animation: 'fadeIn 0.5s ease-in-out',
      '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' }
      }
    }}>
      {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* LEFT - Products */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,193,7,0.1)' }}>
              <TextField
                id="pos-search"
                fullWidth
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#FFC107' }} /></InputAdornment>
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
                <Chip
                  label="All"
                  onClick={() => setActiveCategory('all')}
                  color={activeCategory === 'all' ? 'primary' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                {categories.map(cat => (
                  <Chip
                    key={cat.id}
                    label={`${cat.icon} ${cat.name}`}
                    onClick={() => setActiveCategory(String(cat.id))}
                    color={activeCategory === String(cat.id) ? 'primary' : 'default'}
                    size="small"
                    sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {productLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : (
                <Grid container spacing={1.5}>
                  {filteredProducts.map(product => {
                    const inCart = cart.find(i => i.product_id === product.id);
                    return (
                      <Grid item xs={6} sm={4} key={product.id}>
                        <Card
                          id={`product-${product.id}`}
                          onClick={() => addToCart(product)}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: inCart ? '2px solid #FFC107' : '1px solid rgba(255,193,7,0.1)',
                            bgcolor: inCart ? 'rgba(255,193,7,0.08)' : '#1A1A1A',
                            '&:hover': { 
                              transform: 'translateY(-5px)', 
                              border: '2px solid #FFC107',
                              boxShadow: '0 10px 20px rgba(255,193,7,0.2)'
                            },
                            '&:active': { transform: 'scale(0.95)' },
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {inCart && (
                            <Badge
                              badgeContent={inCart.qty}
                              color="primary"
                              sx={{ position: 'absolute', top: 8, right: 8, '& .MuiBadge-badge': { bgcolor: '#FFC107', color: '#121212', fontWeight: 700 } }}
                            />
                          )}
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography sx={{ fontSize: '1.8rem', textAlign: 'center', mb: 0.5 }}>
                              {product.icon}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFF', textAlign: 'center', fontSize: '0.78rem', lineHeight: 1.3 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#FFC107', fontWeight: 700, textAlign: 'center', mt: 0.5 }}>
                              Rs. {Number(product.price).toLocaleString()}
                            </Typography>
                            {product.stock <= product.min_stock && (
                              <Chip label="Low Stock" size="small" sx={{ mt: 0.5, width: '100%', bgcolor: 'rgba(244,67,54,0.1)', color: '#F44336', fontSize: '0.6rem' }} />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 6, color: '#888' }}>
                        <RestaurantIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                        <Typography>No products found</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>

        {/* RIGHT - Cart */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Order Config */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,193,7,0.1)' }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 900, 
                color: '#FFC107', 
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                animation: 'pulseGlow 2s infinite ease-in-out',
                '@keyframes pulseGlow': {
                  '0%, 100%': { textShadow: '0 0 5px rgba(255,193,7,0.2)' },
                  '50%': { textShadow: '0 0 15px rgba(255,193,7,0.5)' }
                }
              }}>
                🛒 Order Cart
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {ORDER_TYPES.map(ot => (
                      <Button
                        key={ot.value}
                        size="small"
                        variant={orderType === ot.value ? 'contained' : 'outlined'}
                        onClick={() => setOrderType(ot.value)}
                        startIcon={ot.icon}
                        sx={{
                          flex: 1, fontSize: '0.7rem',
                          borderColor: 'rgba(255,193,7,0.3)',
                          color: orderType === ot.value ? '#121212' : 'text.secondary',
                        }}
                      >
                        {ot.label}
                      </Button>
                    ))}
                  </Box>
                </Grid>
                {orderType === 'dine_in' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: '#888' }}>
                        <TableRestaurantIcon sx={{ fontSize: 16, mr: 0.5 }} />Table
                      </InputLabel>
                      <Select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} label="Table">
                        {tables.map(t => (
                          <MenuItem key={t.id} value={t.id}>{t.table_no} (Capacity: {t.capacity})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Cart Items */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <ShoppingBagIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">Cart is empty</Typography>
                  <Typography variant="caption">Tap products to add them</Typography>
                </Box>
              ) : (
                cart.map(item => (
                  <Box key={item.product_id} sx={{
                    display: 'flex', alignItems: 'center', gap: 1, py: 1.5,
                    borderBottom: '1px solid divider',
                    animation: 'slideIn 0.3s ease-out',
                    '@keyframes slideIn': {
                      from: { opacity: 0, transform: 'translateX(20px)' },
                      to: { opacity: 1, transform: 'translateX(0)' }
                    }
                  }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.82rem', lineHeight: 1.2 }}>
                        {item.product_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#FFC107' }}>
                        Rs. {item.unit_price.toLocaleString()} each
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => updateQty(item.product_id, -1)} sx={{ bgcolor: 'action.hover', p: 0.5 }}>
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography sx={{ fontWeight: 700, color: 'text.primary', minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {item.qty}
                      </Typography>
                      <IconButton size="small" onClick={() => updateQty(item.product_id, 1)} sx={{ bgcolor: 'rgba(255,193,7,0.15)', p: 0.5 }}>
                        <AddIcon sx={{ fontSize: 14, color: '#FFC107' }} />
                      </IconButton>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem', minWidth: '60px', textAlign: 'right' }}>
                      Rs. {item.total.toLocaleString()}
                    </Typography>
                    <IconButton size="small" onClick={() => removeFromCart(item.product_id)} sx={{ color: '#F44336', p: 0.5 }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>

            {/* Totals */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,193,7,0.1)', bgcolor: 'action.selected' }}>
              <TextField
                label="Discount (Rs.)"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                type="number"
                size="small"
                fullWidth
                sx={{ mb: 1.5 }}
                inputProps={{ min: 0 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="textSecondary">Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Rs. {subtotal.toLocaleString()}</Typography>
              </Box>
              {discountAmt > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="textSecondary">Discount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#F44336' }}>- Rs. {discountAmt.toLocaleString()}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 900, 
                  color: '#FFC107',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>TOTAL</Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 900, 
                  color: '#FFC107',
                  textShadow: '0 0 10px rgba(255,193,7,0.3)'
                }}>Rs. {grandTotal.toLocaleString()}</Typography>
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    id="pos-clear-btn"
                    fullWidth
                    variant="outlined"
                    startIcon={<ClearAllIcon />}
                    onClick={clearCart}
                    disabled={cart.length === 0}
                    sx={{ borderColor: 'divider', color: 'text.secondary', py: 1.2 }}
                  >
                    Clear
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    id="pos-pay-btn"
                    fullWidth
                    variant="contained"
                    startIcon={<PaymentIcon />}
                    onClick={() => {
                      setCashReceived(''); // Reset cash input for new payment
                      setPaymentDialog(true);
                    }}
                    disabled={cart.length === 0}
                    sx={{ 
                      py: 1.5,
                      borderRadius: '12px',
                      color: '#FFFFFF !important',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
                      boxShadow: '0 4px 15px rgba(255,193,7,0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255,193,7,0.5)',
                        background: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'action.disabledBackground',
                        color: 'text.disabled !important',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Pay
                  </Button>
                </Grid>
                {completedOrder && (
                  <Grid item xs={12}>
                    <Button
                      id="pos-print-btn"
                      fullWidth
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                      sx={{ 
                        borderColor: '#FFC107', 
                        color: '#FFC107', 
                        py: 1.2,
                        borderRadius: '12px',
                        borderWidth: '2px',
                        fontWeight: 800,
                        '&:hover': {
                          borderWidth: '2px',
                          bgcolor: 'rgba(255,193,7,0.05)',
                        }
                      }}
                    >
                      Print Receipt
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => { setPaymentDialog(false); setError(''); }} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#1A1A1A', border: '1px solid rgba(255,193,7,0.2)' } }}>
        <DialogTitle sx={{ color: '#FFC107', fontWeight: 700 }}>💳 Process Payment</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography color="textSecondary" variant="body2">Subtotal</Typography>
              <Typography color="white" variant="body2">Rs. {subtotal.toLocaleString()}</Typography>
            </Box>
            {discountAmt > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography color="textSecondary" variant="body2">Discount</Typography>
                <Typography sx={{ color: '#F44336' }} variant="body2">- Rs. {discountAmt.toLocaleString()}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#FFC107', fontWeight: 800 }}>Grand Total</Typography>
              <Typography sx={{ color: '#FFC107', fontWeight: 800, fontSize: '1.1rem' }}>Rs. {grandTotal.toLocaleString()}</Typography>
            </Box>
          </Box>

          <TextField
            id="payment-cash-input"
            label="Cash Received (Rs.)"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            type="number"
            fullWidth
            autoFocus
            inputProps={{ min: 0 }}
            sx={{ mb: 2 }}
          />

          {cashReceived && parseFloat(cashReceived) >= grandTotal && (
            <Box sx={{ p: 2, bgcolor: 'rgba(76,175,80,0.1)', borderRadius: 2, border: '1px solid rgba(76,175,80,0.3)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#4CAF50', fontWeight: 700 }}>Balance</Typography>
                <Typography sx={{ color: '#4CAF50', fontWeight: 800, fontSize: '1.1rem' }}>Rs. {balance.toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setPaymentDialog(false); setError(''); }} sx={{ color: '#888' }}>Cancel</Button>
          <Button
            id="payment-confirm-btn"
            onClick={handleProcessPayment}
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{ 
              py: 1.5,
              borderRadius: '12px',
              color: '#FFFFFF !important',
              fontWeight: 900,
              fontSize: '1.1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(76,175,80,0.5)',
                background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(76,175,80,0.2)',
                color: 'rgba(255, 255, 255, 0.3) !important',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Receipt for printing */}
      <Box sx={{ display: 'none' }}>
        <Receipt
          ref={receiptRef}
          order={completedOrder}
          cashier={user?.name}
          balance={balance}
          cashReceived={cashReceived}
        />
      </Box>
    </Box>
  );
};

export default POSBilling;
