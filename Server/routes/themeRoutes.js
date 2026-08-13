const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/themes - Fetch all themes from database table
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM theme_modes');
    res.status(200).json({
      status: 'success',
      results: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error('Error fetching themes from database table:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch themes from database table',
    });
  }
});

module.exports = router;
