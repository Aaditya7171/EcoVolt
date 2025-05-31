const { query } = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('Initializing database tables...');

    // Create users table
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

    // Create indexes for better performance
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

    // Create admin user if it doesn't exist
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

      console.log('Admin user created/verified successfully');
    } catch (adminError) {
      console.error('Error creating admin user:', adminError);
    }

    console.log('Database tables initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = { initDatabase };
