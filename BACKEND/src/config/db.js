// src/config/db.js

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'your_postgres_password',
  database: process.env.PGDATABASE || 'ayush_terminology_db',
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres client error', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};



