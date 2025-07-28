const { query } = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...');

    // Test connection first
    const { testConnection } = require('../config/database');
    const connectionTest = await testConnection();

    if (!connectionTest.success) {
      throw new Error(`Database connection failed: ${connectionTest.error}`);
    }

    console.log('✅ Database connection verified');

    // Create users table
    console.log('📝 Creating users table...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create charging_stations table
    console.log('📝 Creating charging_stations table...');
    await query(`
      CREATE TABLE IF NOT EXISTS charging_stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        power_output INTEGER NOT NULL,
        connector_type VARCHAR(50) NOT NULL,
        approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
        approved_by INTEGER REFERENCES users(id),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create deletion_requests table
    console.log('📝 Creating deletion_requests table...');
    await query(`
      CREATE TABLE IF NOT EXISTS deletion_requests (
        id SERIAL PRIMARY KEY,
        station_id INTEGER REFERENCES charging_stations(id) ON DELETE CASCADE,
        requested_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        reviewed_by INTEGER REFERENCES users(id),
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    console.log('📝 Creating database indexes...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_charging_stations_user_id ON charging_stations(user_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_charging_stations_status ON charging_stations(status)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_charging_stations_approval_status ON charging_stations(approval_status)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_deletion_requests_station_id ON deletion_requests(station_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_deletion_requests_requested_by ON deletion_requests(requested_by)
    `);

    // Create admin user if it doesn't exist
    console.log('👤 Creating admin user...');
    try {
      const bcrypt = require('bcryptjs');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('Admin@EcoVolt', saltRounds);

      await query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING`,
        ['Admin', 'toadityavijay@gmail.com', hashedPassword, 'admin']
      );

      console.log('✅ Admin user created/verified successfully');
    } catch (adminError) {
      console.error('❌ Error creating admin user:', adminError);
      // Don't throw here, continue with initialization
    }

    console.log('✅ Database tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = { initDatabase };
