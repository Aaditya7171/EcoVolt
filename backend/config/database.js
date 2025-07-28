const { Pool } = require('pg');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Debug environment variables
console.log('Database config debug:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'dpg-d0skslqdbo4c73f672c0-a.oregon-postgres.render.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'eco_volt_user',
  password: process.env.DB_PASS || 'tSMqWjKkZ8fr06MViYMPPers4XkNBfhu',
  database: process.env.DB_NAME || 'eco_volt',
  ssl: {
    rejectUnauthorized: false // Required for Render.com hosted PostgreSQL
  },
  max: 20, // Increased maximum number of clients in the pool
  idleTimeoutMillis: 60000, // Increased to 60 seconds - close idle clients after 60 seconds
  connectionTimeoutMillis: 30000, // Increased to 30 seconds - timeout for connection establishment
  acquireTimeoutMillis: 30000, // Increased to 30 seconds - timeout for client acquisition
  statement_timeout: 60000, // Increased to 60 seconds - timeout for statement execution
  query_timeout: 60000, // Increased to 60 seconds - timeout for query execution
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Function to get a client from the pool for transactions
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  query,
  getClient,
  pool
};
