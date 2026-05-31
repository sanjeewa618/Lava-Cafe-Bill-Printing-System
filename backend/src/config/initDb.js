const pool = require('./db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Initializing Lava Cafe POS Database...');

    // Create ENUM types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'cashier', 'manager');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE order_type AS ENUM ('dine_in', 'take_away', 'delivery');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role DEFAULT 'cashier',
        shift VARCHAR(20) DEFAULT 'Morning',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(10) DEFAULT '🍽️',
        color VARCHAR(20) DEFAULT '#FFC107',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 5,
        unit VARCHAR(20) DEFAULT 'pcs',
        icon VARCHAR(10) DEFAULT '🍽️',
        description TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tables Table (for dine-in)
    await client.query(`
      CREATE TABLE IF NOT EXISTS cafe_tables (
        id SERIAL PRIMARY KEY,
        table_no VARCHAR(10) UNIQUE NOT NULL,
        capacity INTEGER DEFAULT 4,
        is_occupied BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    // Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        invoice_no VARCHAR(20) UNIQUE NOT NULL,
        cashier_id INTEGER REFERENCES users(id),
        cashier_name VARCHAR(100),
        table_id INTEGER REFERENCES cafe_tables(id) ON DELETE SET NULL,
        table_no VARCHAR(10),
        order_type order_type DEFAULT 'dine_in',
        status order_status DEFAULT 'completed',
        subtotal DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        grand_total DECIMAL(10,2) DEFAULT 0,
        cash_received DECIMAL(10,2) DEFAULT 0,
        balance DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Order Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(200) NOT NULL,
        qty INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Invoice Counter Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoice_counter (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        last_number INTEGER DEFAULT 0,
        UNIQUE(year)
      );
    `);

    // Inventory Table (Raw Materials)
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        stock DECIMAL(10,2) DEFAULT 0,
        min_stock DECIMAL(10,2) DEFAULT 5,
        unit VARCHAR(20) DEFAULT 'kg',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert default admin user
    const adminExists = await client.query("SELECT id FROM users WHERE username = 'admin'");
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO users (name, username, password, role, shift)
        VALUES ('Administrator', 'admin', $1, 'admin', 'Morning')
      `, [hashedPassword]);

      const kasunPw = await bcrypt.hash('kasun123', 10);
      await client.query(`
        INSERT INTO users (name, username, password, role, shift)
        VALUES ('Kasun Perera', 'kasun', $1, 'cashier', 'Morning')
      `, [kasunPw]);
      console.log('✅ Default users created: admin / admin123, kasun / kasun123');
    }

    // Insert default categories
    const catExists = await client.query("SELECT id FROM categories LIMIT 1");
    if (catExists.rows.length === 0) {
      await client.query(`
        INSERT INTO categories (name, icon) VALUES
        ('Food', '🍔'),
        ('Juices', '🥤'),
        ('Desserts', '🍰'),
        ('Beverages', '☕'),
        ('Snacks', '🍟')
      `);
      console.log('✅ Default categories created');
    }

    // Insert default products
    const prodExists = await client.query("SELECT id FROM products LIMIT 1");
    if (prodExists.rows.length === 0) {
      await client.query(`
        INSERT INTO products (name, price, category_id, stock, icon) VALUES
        ('Chicken Burger', 850.00, 1, 50, '🍔'),
        ('Chicken Submarine', 750.00, 1, 50, '🥪'),
        ('Veggie Pizza', 1200.00, 1, 30, '🍕'),
        ('French Fries', 350.00, 5, 100, '🍟'),
        ('Orange Juice', 350.00, 2, 80, '🍊'),
        ('Mango Juice', 400.00, 2, 60, '🥭'),
        ('Strawberry Milkshake', 500.00, 2, 40, '🍓'),
        ('Hot Coffee', 250.00, 4, 200, '☕'),
        ('Iced Tea', 300.00, 4, 150, '🧊'),
        ('Chocolate Cake', 450.00, 3, 20, '🍰'),
        ('Brownie', 380.00, 3, 25, '🍫'),
        ('Grilled Chicken', 1100.00, 1, 40, '🍗')
      `);
      console.log('✅ Default products created');
    }

    // Insert default tables
    const tableExists = await client.query("SELECT id FROM cafe_tables LIMIT 1");
    if (tableExists.rows.length === 0) {
      const tables = ['T01','T02','T03','T04','T05','T06','T07','T08'];
      for (const t of tables) {
        await client.query(`INSERT INTO cafe_tables (table_no, capacity) VALUES ($1, 4)`, [t]);
      }
      console.log('✅ Default tables created: T01 - T08');
    }

    // Insert default inventory raw materials
    const invExists = await client.query("SELECT id FROM inventory LIMIT 1");
    if (invExists.rows.length === 0) {
      await client.query(`
        INSERT INTO inventory (name, stock, min_stock, unit) VALUES
        ('Bread', 150, 20, 'pcs'),
        ('Cheese', 5.5, 2.0, 'kg'),
        ('Chicken', 12.0, 5.0, 'kg'),
        ('Orange', 25.0, 8.0, 'kg'),
        ('Milk', 15.0, 4.0, 'liters'),
        ('Sugar', 10.0, 3.0, 'kg'),
        ('Chocolate Syrup', 8.0, 2.0, 'bottles')
      `);
      console.log('✅ Default inventory items seeded');
    }

    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Database init error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
};

initDb();
