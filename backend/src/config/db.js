const { Pool } = require('pg');
const { db } = require('./env');

const pool = new Pool({
  host: db.host,
  port: db.port,
  database: db.database,
  user: db.user,
  password: db.password,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL Database - Lava Cafe POS');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;
