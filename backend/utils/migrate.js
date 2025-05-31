const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const migrate = async () => {
  try {
    console.log('Running database migrations...');

    // Add role column to users table if it doesn't exist
    try {
      await query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user'))
      `);
      console.log('Added role column to users table');
    } catch (error) {
      console.log('Role column already exists or error:', error.message);
    }

    // Add approval_status column to charging_stations table if it doesn't exist
    try {
      await query(`
        ALTER TABLE charging_stations
        ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'))
      `);
      console.log('Added approval_status column to charging_stations table');
    } catch (error) {
      console.log('Approval_status column already exists or error:', error.message);
    }

    // Add approved_by column to charging_stations table if it doesn't exist
    try {
      await query(`
        ALTER TABLE charging_stations
        ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id)
      `);
      console.log('Added approved_by column to charging_stations table');
    } catch (error) {
      console.log('Approved_by column already exists or error:', error.message);
    }

    // Create index for approval_status if it doesn't exist
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_charging_stations_approval_status ON charging_stations(approval_status)
      `);
      console.log('Created index for approval_status');
    } catch (error) {
      console.log('Index already exists or error:', error.message);
    }

    // Create deletion_requests table if it doesn't exist
    try {
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
      console.log('Created deletion_requests table');
    } catch (error) {
      console.log('Deletion_requests table already exists or error:', error.message);
    }

    // Create index for deletion_requests status if it doesn't exist
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status)
      `);
      console.log('Created index for deletion_requests status');
    } catch (error) {
      console.log('Index already exists or error:', error.message);
    }

    // Create admin user if it doesn't exist
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('Admin@EcoVolt', saltRounds);

      await query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE SET role = $4`,
        ['Admin', 'toadityavijay@gmail.com', hashedPassword, 'admin']
      );

      console.log('Admin user created/updated successfully');
    } catch (adminError) {
      console.error('Error creating admin user:', adminError);
    }

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  }
};

module.exports = { migrate };
