const { Pool } = require('pg');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Debug environment variables
console.log('Database config debug:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// Create a connection pool with better error handling
const pool = new Pool({
  host: process.env.DB_HOST || 'dpg-d0skslqdbo4c73f672c0-a.oregon-postgres.render.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'eco_volt_user',
  password: process.env.DB_PASS || 'tSMqWjKkZ8fr06MViYMPPers4XkNBfhu',
  database: process.env.DB_NAME || 'eco_volt',
  ssl: {
    rejectUnauthorized: false // Required for Render.com hosted PostgreSQL
  },
  max: 10, // Reduced to avoid overwhelming the database
  min: 2, // Minimum connections to keep alive
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 60000, // Increased to 60 seconds for connection establishment
  acquireTimeoutMillis: 60000, // Increased to 60 seconds for client acquisition
  statement_timeout: 120000, // Increased to 120 seconds for statement execution
  query_timeout: 120000, // Increased to 120 seconds for query execution
  keepAlive: true, // Keep connections alive
  keepAliveInitialDelayMillis: 10000, // Initial delay for keep-alive
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
  // The pool will handle reconnection automatically
});

// Function to execute queries with retry logic
const query = async (text, params, retryCount = 0) => {
  const maxRetries = 3;
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 5000) {
      console.log('Slow query detected', { text: text.substring(0, 100), duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Database query error:', {
      error: error.message,
      code: error.code,
      duration,
      query: text.substring(0, 100),
      retryCount
    });

    // Retry on connection errors
    if (retryCount < maxRetries && (
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.message.includes('Connection terminated') ||
      error.message.includes('connection')
    )) {
      console.log(`Retrying query... (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return query(text, params, retryCount + 1);
    }

    throw error;
  }
};

// Function to get a client from the pool for transactions
const getClient = async () => {
  try {
    return await pool.connect();
  } catch (error) {
    console.error('Failed to get database client:', error);
    throw error;
  }
};

// Function to test database connection
const testConnection = async () => {
  try {
    const result = await query('SELECT 1 as test');
    return { success: true, result: result.rows[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to check if tables exist
const checkTables = async () => {
  try {
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'charging_stations', 'deletion_requests')
      ORDER BY table_name
    `);

    const existingTables = result.rows.map(row => row.table_name);
    const requiredTables = ['users', 'charging_stations', 'deletion_requests'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    return {
      success: missingTables.length === 0,
      existingTables,
      missingTables,
      requiredTables
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      existingTables: [],
      missingTables: ['users', 'charging_stations', 'deletion_requests'],
      requiredTables: ['users', 'charging_stations', 'deletion_requests']
    };
  }
};

module.exports = {
  query,
  getClient,
  pool,
  testConnection,
  checkTables
};
