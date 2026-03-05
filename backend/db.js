const { Sequelize } = require('sequelize');

// Set DATABASE_URL in your .env:
// Local:     postgresql://user:password@localhost:5432/ecommerce
// Cloud SQL: postgresql://user:password@/ecommerce?host=/cloudsql/PROJECT:REGION:INSTANCE

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
});

sequelize
  .authenticate()
  .then(() => console.log('✅  PostgreSQL connected'))
  .catch((err) => console.error('❌  PostgreSQL connection error:', err));

module.exports = { sequelize };