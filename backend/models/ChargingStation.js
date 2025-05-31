const { query } = require('../config/database');

class ChargingStation {
  constructor(id, name, latitude, longitude, status, power_output, connector_type, approval_status, approved_by, user_id, created_at, updated_at, owner_name, owner_email) {
    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = status;
    this.power_output = power_output;
    this.connector_type = connector_type;
    this.approval_status = approval_status || 'approved';
    this.approved_by = approved_by;
    this.user_id = user_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.owner_name = owner_name;
    this.owner_email = owner_email;
  }

  // Create a new charging station
  static async create(stationData, isAdmin = false) {
    const { name, latitude, longitude, status, power_output, connector_type, user_id } = stationData;

    try {
      // Set approval status based on user role
      const approval_status = isAdmin ? 'approved' : 'pending';
      const approved_by = isAdmin ? user_id : null;

      const result = await query(
        `INSERT INTO charging_stations (name, latitude, longitude, status, power_output, connector_type, approval_status, approved_by, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, latitude, longitude, status || 'Active', power_output, connector_type, approval_status, approved_by, user_id]
      );

      const station = result.rows[0];
      return new ChargingStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.status,
        station.power_output,
        station.connector_type,
        station.approval_status,
        station.approved_by,
        station.user_id,
        station.created_at,
        station.updated_at,
        null,
        null
      );
    } catch (error) {
      throw error;
    }
  }

  // Get all charging stations with owner information
  static async findAll(filters = {}) {
    try {
      let queryText = `
        SELECT
          cs.id,
          cs.name,
          cs.latitude,
          cs.longitude,
          cs.status,
          cs.power_output,
          cs.connector_type,
          cs.approval_status,
          cs.approved_by,
          cs.user_id,
          cs.created_at,
          cs.updated_at,
          u.name as owner_name,
          u.email as owner_email
        FROM charging_stations cs
        LEFT JOIN users u ON cs.user_id = u.id
        WHERE cs.approval_status = 'approved'
      `;
      const queryParams = [];
      let paramCount = 0;

      // Apply filters
      if (filters.status) {
        paramCount++;
        queryText += ` AND cs.status = $${paramCount}`;
        queryParams.push(filters.status);
      }

      if (filters.power_output) {
        paramCount++;
        queryText += ` AND cs.power_output >= $${paramCount}`;
        queryParams.push(filters.power_output);
      }

      if (filters.connector_type) {
        paramCount++;
        queryText += ` AND cs.connector_type = $${paramCount}`;
        queryParams.push(filters.connector_type);
      }

      if (filters.user_id) {
        paramCount++;
        queryText += ` AND cs.user_id = $${paramCount}`;
        queryParams.push(filters.user_id);
      }

      queryText += ' ORDER BY cs.created_at DESC';

      const result = await query(queryText, queryParams);

      return result.rows.map(station => new ChargingStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.status,
        station.power_output,
        station.connector_type,
        station.approval_status,
        station.approved_by,
        station.user_id,
        station.created_at,
        station.updated_at,
        station.owner_name,
        station.owner_email
      ));
    } catch (error) {
      throw error;
    }
  }

  // Find charging station by ID with owner information
  static async findById(id) {
    try {
      const result = await query(
        `SELECT
          cs.id,
          cs.name,
          cs.latitude,
          cs.longitude,
          cs.status,
          cs.power_output,
          cs.connector_type,
          cs.approval_status,
          cs.approved_by,
          cs.user_id,
          cs.created_at,
          cs.updated_at,
          u.name as owner_name,
          u.email as owner_email
        FROM charging_stations cs
        LEFT JOIN users u ON cs.user_id = u.id
        WHERE cs.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const station = result.rows[0];
      return new ChargingStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.status,
        station.power_output,
        station.connector_type,
        station.approval_status,
        station.approved_by,
        station.user_id,
        station.created_at,
        station.updated_at,
        station.owner_name,
        station.owner_email
      );
    } catch (error) {
      throw error;
    }
  }

  // Update charging station
  static async update(id, updateData) {
    try {
      const { name, latitude, longitude, status, power_output, connector_type } = updateData;

      const result = await query(
        `UPDATE charging_stations
         SET name = $1, latitude = $2, longitude = $3, status = $4,
             power_output = $5, connector_type = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [name, latitude, longitude, status, power_output, connector_type, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const station = result.rows[0];
      return new ChargingStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.status,
        station.power_output,
        station.connector_type,
        station.user_id,
        station.created_at,
        station.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete charging station
  static async delete(id) {
    try {
      const result = await query(
        'DELETE FROM charging_stations WHERE id = $1 RETURNING *',
        [id]
      );

      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get pending charging stations for admin approval
  static async findPending() {
    try {
      const result = await query(
        `SELECT
          cs.id,
          cs.name,
          cs.latitude,
          cs.longitude,
          cs.status,
          cs.power_output,
          cs.connector_type,
          cs.approval_status,
          cs.approved_by,
          cs.user_id,
          cs.created_at,
          cs.updated_at,
          u.name as owner_name,
          u.email as owner_email
        FROM charging_stations cs
        LEFT JOIN users u ON cs.user_id = u.id
        WHERE cs.approval_status = 'pending'
        ORDER BY cs.created_at ASC`
      );

      return result.rows.map(station => new ChargingStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.status,
        station.power_output,
        station.connector_type,
        station.approval_status,
        station.approved_by,
        station.user_id,
        station.created_at,
        station.updated_at,
        station.owner_name,
        station.owner_email
      ));
    } catch (error) {
      throw error;
    }
  }

  // Approve a charging station
  static async approve(id, adminId) {
    try {
      const result = await query(
        `UPDATE charging_stations
         SET approval_status = 'approved', approved_by = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND approval_status = 'pending'
         RETURNING *`,
        [adminId, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const station = result.rows[0];
      return new ChargingStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.status,
        station.power_output,
        station.connector_type,
        station.approval_status,
        station.approved_by,
        station.user_id,
        station.created_at,
        station.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Reject a charging station
  static async reject(id, adminId) {
    try {
      const result = await query(
        `UPDATE charging_stations
         SET approval_status = 'rejected', approved_by = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND approval_status = 'pending'
         RETURNING *`,
        [adminId, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const station = result.rows[0];
      return new ChargingStation(
        station.id,
        station.name,
        station.latitude,
        station.longitude,
        station.status,
        station.power_output,
        station.connector_type,
        station.approval_status,
        station.approved_by,
        station.user_id,
        station.created_at,
        station.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      latitude: parseFloat(this.latitude),
      longitude: parseFloat(this.longitude),
      status: this.status,
      power_output: this.power_output,
      connector_type: this.connector_type,
      approval_status: this.approval_status,
      approved_by: this.approved_by,
      user_id: this.user_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      owner_name: this.owner_name,
      owner_email: this.owner_email
    };
  }
}

module.exports = ChargingStation;
