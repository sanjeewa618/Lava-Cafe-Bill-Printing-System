import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip,
  LinearProgress, Avatar, Divider, useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{
      position: 'absolute', right: -20, top: -20,
      width: 100, height: 100, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
    }} />
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary', letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>{subtitle}</Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}22`, width: 52, height: 52 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Avatar>
      </Box>
    </CardContent>
</Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/orders/dashboard-stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const chartData = stats?.week_sales?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' }),
    sales: parseFloat(d.sales),
  })) || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {loading && <LinearProgress color="primary" sx={{ mb: 3, borderRadius: 1 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Sales"
            value={formatCurrency(stats?.today_sales)}
            icon={<TrendingUpIcon fontSize="medium" />}
            color="#FFC107"
            subtitle="Total revenue today"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Orders"
            value={stats?.today_orders || 0}
            icon={<ShoppingCartIcon fontSize="medium" />}
            color="#4CAF50"
            subtitle="Completed transactions"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Products"
            value={stats?.total_products || 0}
            icon={<RestaurantMenuIcon fontSize="medium" />}
            color="#29B6F6"
            subtitle="Active menu items"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Low Stock Alert"
            value={stats?.low_stock_items || 0}
            icon={<WarningAmberIcon fontSize="medium" />}
            color="#F44336"
            subtitle="Items need restocking"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                📈 Weekly Sales Overview
              </Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, color: theme.palette.text.primary }}
                      formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Sales']}
                    />
                    <Bar dataKey="sales" fill="#FFC107" radius={[6, 6, 0, 0]}
                      background={{ fill: theme.palette.action.hover, radius: [6, 6, 0, 0] }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">No sales data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: 'text.primary' }}>
                🔥 Top Products Today
              </Typography>
              {stats?.top_products?.length > 0 ? stats.top_products.map((p, i) => (
                <Box key={i}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%',
                        bgcolor: i === 0 ? 'rgba(255,193,7,0.2)' : 'action.hover',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: i === 0 ? '#FFC107' : 'text.secondary', fontSize: '0.75rem' }}>
                          #{i + 1}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                          {p.product_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {p.total_qty} sold
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`Rs. ${Number(p.total_sales).toLocaleString()}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,193,7,0.1)', color: '#FFC107', fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </Box>
                  {i < stats.top_products.length - 1 && <Divider />}
                </Box>
              )) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary" variant="body2">No orders today yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
