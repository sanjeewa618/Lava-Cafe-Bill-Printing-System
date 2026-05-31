const pool = require('../config/db');

// Generate invoice number: LC-2026-00001
const generateInvoiceNo = async (client) => {
  const year = new Date().getFullYear();
  
  await client.query(`
    INSERT INTO invoice_counter (year, last_number) VALUES ($1, 0)
    ON CONFLICT (year) DO NOTHING
  `, [year]);
  
  const result = await client.query(`
    UPDATE invoice_counter SET last_number = last_number + 1
    WHERE year = $1 RETURNING last_number
  `, [year]);
  
  const num = result.rows[0].last_number;
  return `LC-${year}-${String(num).padStart(5, '0')}`;
};

// Create new order
const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      items, order_type, table_id, table_no,
      subtotal, discount, tax, grand_total,
      cash_received, balance, notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    const invoice_no = await generateInvoiceNo(client);

    const orderResult = await client.query(`
      INSERT INTO orders (
        invoice_no, cashier_id, cashier_name, table_id, table_no,
        order_type, subtotal, discount, tax, grand_total,
        cash_received, balance, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `, [
      invoice_no, req.user.id, req.user.name,
      table_id || null, table_no || null,
      order_type || 'dine_in',
      subtotal, discount || 0, tax || 0, grand_total,
      cash_received, balance, notes
    ]);

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, qty, unit_price, total)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [order.id, item.product_id, item.product_name, item.qty, item.unit_price, item.total]);

      // Reduce stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock > 0',
        [item.qty, item.product_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: { ...order, items }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  } finally {
    client.release();
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const { date, cashier_id, status, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT o.*, u.name as cashier_full_name
      FROM orders o
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      query += ` AND DATE(o.created_at) = $${params.length}`;
    }
    if (cashier_id) {
      params.push(cashier_id);
      query += ` AND o.cashier_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single order with items
const getOrder = async (req, res) => {
  try {
    const orderResult = await pool.query(
      `SELECT o.*, u.name as cashier_full_name FROM orders o
       LEFT JOIN users u ON o.cashier_id = u.id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
      [req.params.id]
    );
    res.json({
      success: true,
      order: { ...orderResult.rows[0], items: itemsResult.rows }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get order by invoice number
const getOrderByInvoice = async (req, res) => {
  try {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE invoice_no = $1',
      [req.params.invoiceNo]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderResult.rows[0].id]
    );
    res.json({ success: true, order: { ...orderResult.rows[0], items: itemsResult.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const salesResult = await pool.query(`
      SELECT COALESCE(SUM(grand_total), 0) as total_sales,
             COUNT(*) as total_orders
      FROM orders WHERE DATE(created_at) = $1 AND status = 'completed'
    `, [today]);

    const productCount = await pool.query('SELECT COUNT(*) FROM products WHERE is_active=TRUE');
    const lowStock = await pool.query('SELECT COUNT(*) FROM products WHERE stock <= min_stock AND is_active=TRUE');

    const weekSales = await pool.query(`
      SELECT DATE(created_at) as date, COALESCE(SUM(grand_total), 0) as sales
      FROM orders WHERE created_at >= NOW() - INTERVAL '7 days' AND status='completed'
      GROUP BY DATE(created_at) ORDER BY date
    `);

    const topProducts = await pool.query(`
      SELECT oi.product_name, SUM(oi.qty) as total_qty, SUM(oi.total) as total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = $1 AND o.status = 'completed'
      GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 5
    `, [today]);

    res.json({
      success: true,
      stats: {
        today_sales: parseFloat(salesResult.rows[0].total_sales),
        today_orders: parseInt(salesResult.rows[0].total_orders),
        total_products: parseInt(productCount.rows[0].count),
        low_stock_items: parseInt(lowStock.rows[0].count),
        week_sales: weekSales.rows,
        top_products: topProducts.rows,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get tables
const getTables = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cafe_tables WHERE is_active=TRUE ORDER BY table_no');
    res.json({ success: true, tables: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createOrder, getOrders, getOrder, getOrderByInvoice, getDashboardStats, getTables };
