const pool = require('../config/db');

// Get all inventory items
const getInventoryItems = async (req, res) => {
  try {
    const { search, lowStock } = req.query;
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (lowStock === 'true') {
      query += ' AND stock <= min_stock';
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json({ success: true, inventory: result.rows });
  } catch (err) {
    console.error('getInventoryItems error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single item
const getInventoryItem = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create raw material item
const createInventoryItem = async (req, res) => {
  const { name, stock, min_stock, unit } = req.body;
  try {
    const exists = await pool.query('SELECT id FROM inventory WHERE name = $1', [name]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Raw material already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO inventory (name, stock, min_stock, unit)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, stock || 0, min_stock || 0, unit || 'kg']
    );
    res.status(201).json({ success: true, item: result.rows[0], message: 'Item created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update raw material item
const updateInventoryItem = async (req, res) => {
  const { name, stock, min_stock, unit } = req.body;
  try {
    const result = await pool.query(
      `UPDATE inventory SET name=$1, stock=$2, min_stock=$3, unit=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, stock, min_stock, unit, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }
    res.json({ success: true, item: result.rows[0], message: 'Item updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete raw material item
const deleteInventoryItem = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};
