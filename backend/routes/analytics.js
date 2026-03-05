const express = require('express');
const { runQuery, FULL_TABLE } = require('../bigquery');
const router = express.Router();

// ── GET /api/analytics/revenue ─────────────────────────────
router.get('/revenue', async (req, res) => {
  try {
    const rows = await runQuery(`
      SELECT
        ROUND(SUM(price), 2)  AS total_revenue,
        COUNT(*)              AS total_orders,
        ROUND(AVG(price), 2)  AS avg_order_value
      FROM ${FULL_TABLE}
    `);
    res.json(rows[0] || { total_revenue: 0, total_orders: 0, avg_order_value: 0 });
  } catch (err) {
    console.error('Revenue query error:', err);
    res.status(500).json({ error: 'BigQuery query failed' });
  }
});

// ── GET /api/analytics/top-products ───────────────────────
router.get('/top-products', async (req, res) => {
  try {
    const rows = await runQuery(`
      SELECT
        product_id,
        COUNT(*)              AS sales,
        ROUND(SUM(price), 2)  AS revenue
      FROM ${FULL_TABLE}
      GROUP BY product_id
      ORDER BY sales DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error('Top-products query error:', err);
    res.status(500).json({ error: 'BigQuery query failed' });
  }
});

// ── GET /api/analytics/revenue-by-city ────────────────────
router.get('/revenue-by-city', async (req, res) => {
  try {
    const rows = await runQuery(`
      SELECT
        city,
        ROUND(SUM(price), 2) AS revenue,
        COUNT(*)             AS orders
      FROM ${FULL_TABLE}
      GROUP BY city
      ORDER BY revenue DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Revenue-by-city query error:', err);
    res.status(500).json({ error: 'BigQuery query failed' });
  }
});

// ── GET /api/analytics/sales-over-time ────────────────────
router.get('/sales-over-time', async (req, res) => {
  try {
    const rows = await runQuery(`
      SELECT
        DATE(timestamp)       AS date,
        COUNT(*)              AS orders,
        ROUND(SUM(price), 2)  AS revenue
      FROM ${FULL_TABLE}
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY date
      ORDER BY date ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Sales-over-time query error:', err);
    res.status(500).json({ error: 'BigQuery query failed' });
  }
});

module.exports = router;
