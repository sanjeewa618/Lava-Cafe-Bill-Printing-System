const express = require('express');
const cors = require('cors');
const { port: PORT } = require('./config/env');
const ensureDb = require('./config/ensureDb');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/inventory', require('./routes/inventory'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🌋 Lava Cafe POS Server is running!', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, async () => {
  console.log(`🌋 Lava Cafe POS Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  try {
    await ensureDb();
  } catch (err) {
    console.error('❌ Database startup check failed:', err.message);
    console.error('   Run: npm run db:init');
  }
});

module.exports = app;
