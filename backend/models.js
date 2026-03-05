const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

// ── User ──────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:  { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  city:  { type: DataTypes.STRING(100) },
}, { tableName: 'users', timestamps: false });

// ── Product ───────────────────────────────────────────────────────
const Product = sequelize.define('Product', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image_url:   { type: DataTypes.TEXT },
}, { tableName: 'products', timestamps: false });

// ── Order ─────────────────────────────────────────────────────────
const Order = sequelize.define('Order', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:     { type: DataTypes.INTEGER, allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status:      { type: DataTypes.STRING(50), defaultValue: 'pending' },
  created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'orders', timestamps: false });

// ── OrderItem ─────────────────────────────────────────────────────
const OrderItem = sequelize.define('OrderItem', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:   { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity:   { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'order_items', timestamps: false });

// ── Associations ──────────────────────────────────────────────────
Order.hasMany(OrderItem,    { foreignKey: 'order_id' });
OrderItem.belongsTo(Order,  { foreignKey: 'order_id' });
OrderItem.belongsTo(Product,{ foreignKey: 'product_id' });
Product.hasMany(OrderItem,  { foreignKey: 'product_id' });

// ── Seed products if table is empty ──────────────────────────────
async function seedProducts() {
  const count = await Product.count();
  if (count > 0) return;

  await Product.bulkCreate([
    { name: 'Laptop Pro 15"',      description: 'High-performance laptop, 16GB RAM, 512GB SSD', price: 1299.99, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
    { name: 'Smartphone X12',      description: 'Latest flagship phone, 5G, OLED display',      price: 899.99,  image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
    { name: 'Wireless Headphones', description: 'Noise-cancelling, 30h battery',                price: 299.99,  image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { name: 'Mechanical Keyboard', description: 'RGB backlit, tactile switches, TKL layout',    price: 149.99,  image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
    { name: '4K Monitor 27"',      description: 'IPS panel, 144Hz, USB-C hub',                  price: 549.99,  image_url: 'https://images.unsplash.com/photo-1527443224154-c4a573d5b5c1?w=400' },
    { name: 'Wireless Mouse',      description: 'Ergonomic, 70h battery, silent clicks',        price: 59.99,   image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
  ]);
  console.log('🌱  Products seeded');
}

// ── Sync all tables (creates them if they don\'t exist) ───────────
async function syncDatabase() {
  await sequelize.sync({ alter: true });   // alter:true updates columns safely without dropping data
  console.log('✅  All tables synced');
  await seedProducts();
}

module.exports = { User, Product, Order, OrderItem, syncDatabase };