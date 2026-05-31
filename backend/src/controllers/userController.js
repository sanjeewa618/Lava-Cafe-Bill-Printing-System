const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, username, role, shift, is_active, created_at FROM users ORDER BY name'
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create user
const createUser = async (req, res) => {
  const { name, username, password, role, shift } = req.body;
  try {
    const exists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, username, password, role, shift)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, role, shift`,
      [name, username, hashed, role || 'cashier', shift || 'Morning']
    );
    res.status(201).json({ success: true, user: result.rows[0], message: 'User created successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { name, role, shift, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, role=$2, shift=$3, is_active=$4, updated_at=NOW()
       WHERE id=$5 RETURNING id, name, username, role, shift, is_active`,
      [name, role, shift, is_active, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: result.rows[0], message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2', [hashed, req.params.id]);
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getUsers, createUser, updateUser, resetPassword };
