const pool = require('../config/db');

// Daily sales report
const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(grand_total), 0) as total_sales,
        COALESCE(SUM(discount), 0) as total_discount,
        COALESCE(AVG(grand_total), 0) as avg_order_value
      FROM orders 
      WHERE DATE(created_at) = $1 AND status = 'completed'
    `, [reportDate]);

    const byOrderType = await pool.query(`
      SELECT order_type, COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total
      FROM orders WHERE DATE(created_at) = $1 AND status = 'completed'
      GROUP BY order_type
    `, [reportDate]);

    const topItems = await pool.query(`
      SELECT oi.product_name, SUM(oi.qty) as total_qty, SUM(oi.total) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = $1 AND o.status = 'completed'
      GROUP BY oi.product_name
      ORDER BY total_qty DESC LIMIT 10
    `, [reportDate]);

    const byCashier = await pool.query(`
      SELECT cashier_name, COUNT(*) as orders, COALESCE(SUM(grand_total), 0) as total
      FROM orders WHERE DATE(created_at) = $1 AND status = 'completed'
      GROUP BY cashier_name ORDER BY total DESC
    `, [reportDate]);

    const hourlyData = await pool.query(`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as orders, SUM(grand_total) as sales
      FROM orders WHERE DATE(created_at) = $1 AND status = 'completed'
      GROUP BY EXTRACT(HOUR FROM created_at) ORDER BY hour
    `, [reportDate]);

    res.json({
      success: true,
      report: {
        date: reportDate,
        summary: summary.rows[0],
        by_order_type: byOrderType.rows,
        top_items: topItems.rows,
        by_cashier: byCashier.rows,
        hourly_data: hourlyData.rows,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Monthly sales report
const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = year || new Date().getFullYear();
    const m = month || (new Date().getMonth() + 1);

    const daily = await pool.query(`
      SELECT DATE(created_at) as date,
             COUNT(*) as orders,
             COALESCE(SUM(grand_total), 0) as sales
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = $1
        AND EXTRACT(MONTH FROM created_at) = $2
        AND status = 'completed'
      GROUP BY DATE(created_at) ORDER BY date
    `, [y, m]);

    const summary = await pool.query(`
      SELECT COUNT(*) as total_orders, COALESCE(SUM(grand_total), 0) as total_sales
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = $1
        AND EXTRACT(MONTH FROM created_at) = $2
        AND status = 'completed'
    `, [y, m]);

    res.json({ success: true, report: { year: y, month: m, summary: summary.rows[0], daily_data: daily.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDailyReport, getMonthlyReport };
