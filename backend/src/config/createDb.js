const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const createDatabase = async () => {
  console.log('🔑 DB_PASSWORD loaded:', String(process.env.DB_PASSWORD ? '****' : 'undefined'));
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || '1234'),
    database: 'postgres' // Connect to default database
  });

  try {
    await client.connect();
    console.log('📡 Connected to PostgreSQL server...');

    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'lava_cafe_pos'");
    
    if (res.rows.length === 0) {
      console.log('➕ Database "lava_cafe_pos" does not exist. Creating...');
      await client.query('CREATE DATABASE lava_cafe_pos');
      console.log('✅ Database "lava_cafe_pos" created successfully!');
    } else {
      console.log('ℹ️ Database "lava_cafe_pos" already exists.');
    }
  } catch (err) {
    console.error('❌ Error creating database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

createDatabase();
