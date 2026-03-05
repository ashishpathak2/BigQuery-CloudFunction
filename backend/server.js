require('dotenv').config();
const express = require('express');
const cors = require('cors');

const ordersRouter   = require('./routes/orders');
const analyticsRouter = require('./routes/analytics');
const productsRouter  = require('./routes/products');
const { syncDatabase } = require('./models');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/products',  productsRouter);
app.use('/api/orders',    ordersRouter);
app.use('/api/analytics', analyticsRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Sync DB tables first, then start server
syncDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`✅  Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌  Failed to sync database:', err);
    process.exit(1);
  });