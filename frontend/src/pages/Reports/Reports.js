import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Select, MenuItem,
  FormControl, InputLabel, Divider, Alert, CircularProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../utils/api';

const COLORS = ['#FFC107', '#FF8F00', '#FFD54F', '#FFF8E1', '#FF6F00'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReport();
  }, [selectedDate]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/reports/daily?date=${selectedDate}`);
      setReport(res.data.report);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Access denied. Admin/Manager only.' : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const orderTypeData = report?.by_order_type?.map(t => ({
    name: { dine_in: 'Dine In', take_away: 'Take Away', delivery: 'Delivery' }[t.order_type] || t.order_type,
    value: parseInt(t.count),
    total: parseFloat(t.total),
  })) || [];

  const hourlyData = report?.hourly_data?.map(h => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    orders: parseInt(h.orders),
    sales: parseFloat(h.sales || 0),
  })) || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFF' }}>📈 Daily Sales Report</Typography>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            background: '#1A1A1A', color: '#FFF', border: '1px solid rgba(255,193,7,0.3)',
            borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none',
            fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress color="primary" size={48} /></Box>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[
              { label: 'Total Sales', value: formatCurrency(report.summary.total_sales), color: '#FFC107' },
              { label: 'Total Orders', value: report.summary.total_orders, color: '#4CAF50' },
              { label: 'Total Discount', value: formatCurrency(report.summary.total_discount), color: '#F44336' },
              { label: 'Avg Order Value', value: formatCurrency(report.summary.avg_order_value), color: '#29B6F6' },
            ].map((s, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Card>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.68rem' }}>
                      {s.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, mt: 0.5 }}>{s.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Hourly Sales Chart */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#FFF' }}>⏰ Hourly Sales</Typography>
                  {hourlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,193,7,0.08)" />
                        <XAxis dataKey="hour" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 8 }} />
                        <Bar dataKey="orders" fill="#FFC107" radius={[4, 4, 0, 0]} name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="textSecondary">No data for this date</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Order Type Pie */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#FFF' }}>🧾 Order Types</Typography>
                  {orderTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={orderTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                          {orderTypeData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="textSecondary">No orders yet</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Top Items */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#FFF' }}>🔥 Top Selling Items</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.top_items.slice(0, 8).map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ color: '#FFC107', fontWeight: 700 }}>#{i + 1}</Typography>
                                <Typography variant="body2" sx={{ color: '#FFF' }}>{item.product_name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center"><Chip label={item.total_qty} size="small" sx={{ bgcolor: 'rgba(255,193,7,0.1)', color: '#FFC107', fontWeight: 700 }} /></TableCell>
                            <TableCell align="right"><Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{formatCurrency(item.total_revenue)}</Typography></TableCell>
                          </TableRow>
                        ))}
                        {report.top_items.length === 0 && (
                          <TableRow><TableCell colSpan={3} align="center" sx={{ color: '#888', py: 3 }}>No data</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* By Cashier */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#FFF' }}>👤 By Cashier</Typography>
                  {report.by_cashier.length > 0 ? report.by_cashier.map((c, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600 }}>{c.cashier_name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Chip label={`${c.orders} orders`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888' }} />
                        <Typography variant="body2" sx={{ color: '#FFC107', fontWeight: 700 }}>{formatCurrency(c.total)}</Typography>
                      </Box>
                    </Box>
                  )) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#888' }}>
                      <Typography variant="body2">No cashier data</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8, color: '#888' }}>
          <Typography variant="h6">Select a date to view report</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
