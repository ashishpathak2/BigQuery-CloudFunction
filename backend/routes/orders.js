const express = require('express');
const { Order, OrderItem, Product } = require('../models');
const { publishPurchaseEvent } = require('../pubsub');
const router = express.Router();

// POST /api/orders
router.post('/', async (req, res) => {
  const { productId, price, userId, city } = req.body;

  if (!productId || !price || !userId || !city) {
    return res.status(400).json({ error: 'productId, price, userId and city are required' });
  }

  const transaction = await Order.sequelize.transaction();
  try {
    // 1. Create order
    const order = await Order.create(
      { user_id: userId, total_price: price, status: 'completed', created_at: new Date() },
      { transaction }
    );

    // 2. Create order item
    await OrderItem.create(
      { order_id: order.id, product_id: productId, quantity: 1, unit_price: price },
      { transaction }
    );

    await transaction.commit();

    // 3. Publish analytics event to Pub/Sub (non-blocking)
    const event = {
      user_id:    parseInt(userId),
      product_id: parseInt(productId),
      price:      parseFloat(price),
      city,
      timestamp:  new Date().toISOString(),
      order_id:   order.id,
    };

    publishPurchaseEvent(event).catch((err) =>
      console.error('⚠️  Pub/Sub publish failed (order still saved):', err)
    );

    res.status(201).json({ message: 'Order placed successfully', orderId: order.id, event });
  } catch (err) {
    await transaction.rollback();
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['name'] }],
      }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json(orders);
  } catch (err) {
    console.error('Orders list error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;