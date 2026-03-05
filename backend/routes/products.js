const express = require('express');
const { Product } = require('../models');
const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name', 'description', 'price', 'image_url'],
      order: [['id', 'ASC']],
    });
    res.json(products);
  } catch (err) {
    console.error('Products query error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;