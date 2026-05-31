const pool = require('../config/db');

// Get all products
const getProducts = async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND p.category_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.name ILIKE $${params.length}`;
    }
    if (available === 'true') {
      query += ` AND p.is_available = TRUE`;
    }

    query += ' ORDER BY c.name, p.name';

    const result = await pool.query(query, params);
    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = TRUE`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create product
const createProduct = async (req, res) => {
  const { name, price, category_id, stock, min_stock, unit, icon, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, category_id, stock, min_stock, unit, icon, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, price, category_id, stock || 0, min_stock || 5, unit || 'pcs', icon || '🍽️', description]
    );
    res.status(201).json({ success: true, product: result.rows[0], message: 'Product created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const { name, price, category_id, stock, min_stock, unit, icon, description, is_available } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, price=$2, category_id=$3, stock=$4, min_stock=$5, unit=$6,
       icon=$7, description=$8, is_available=$9, updated_at=NOW()
       WHERE id=$10 AND is_active=TRUE RETURNING *`,
      [name, price, category_id, stock, min_stock, unit, icon, description, is_available, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product: result.rows[0], message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete product (soft delete)
const deleteProduct = async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active=FALSE WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE is_active=TRUE ORDER BY name');
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create category
const createCategory = async (req, res) => {
  const { name, icon, color } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING *',
      [name, icon || '🍽️', color || '#FFC107']
    );
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, createCategory };
