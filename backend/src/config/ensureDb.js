const pool = require('./db');

const ensureDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
    `);
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);
    await client.query(`
      UPDATE products SET is_available = TRUE WHERE is_available IS NULL;
    `);

    const { rows } = await client.query(
      'SELECT COUNT(*)::int AS count FROM products WHERE is_active = TRUE'
    );
    console.log(`✅ Database ready — ${rows[0].count} active products`);
    return rows[0].count;
  } finally {
    client.release();
  }
};

module.exports = ensureDb;
