const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'busapp_db',
  user:     process.env.DB_USER     || 'busapp_user',
  password: process.env.DB_PASSWORD || 'BusApp@2024#Kenya',
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅  PostgreSQL pool connected');
  }
});

pool.on('error', (err) => {
  console.error('❌  PostgreSQL pool error:', err.message);
});

/**
 * Execute a single parameterised query.
 * @param {string} text  – SQL string
 * @param {Array}  params – bind parameters
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
