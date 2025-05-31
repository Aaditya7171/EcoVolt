const { query } = require('../config/database');

class DeletionRequest {
  constructor(id, station_id, requested_by, status, reviewed_by, reason, created_at, updated_at, station_name, requester_name, requester_email) {
    this.id = id;
    this.station_id = station_id;
    this.requested_by = requested_by;
    this.status = status || 'pending';
    this.reviewed_by = reviewed_by;
    this.reason = reason;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.station_name = station_name;
    this.requester_name = requester_name;
    this.requester_email = requester_email;
  }

  // Create a new deletion request
  static async create(requestData) {
    const { station_id, requested_by, reason } = requestData;

    try {
      const result = await query(
        `INSERT INTO deletion_requests (station_id, requested_by, reason)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [station_id, requested_by, reason || null]
      );

      const request = result.rows[0];
      return new DeletionRequest(
        request.id,
        request.station_id,
        request.requested_by,
        request.status,
        request.reviewed_by,
        request.reason,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Get all pending deletion requests for admin
  static async findPending() {
    try {
      const result = await query(
        `SELECT
          dr.id,
          dr.station_id,
          dr.requested_by,
          dr.status,
          dr.reviewed_by,
          dr.reason,
          dr.created_at,
          dr.updated_at,
          cs.name as station_name,
          u.name as requester_name,
          u.email as requester_email
        FROM deletion_requests dr
        LEFT JOIN charging_stations cs ON dr.station_id = cs.id
        LEFT JOIN users u ON dr.requested_by = u.id
        WHERE dr.status = 'pending'
        ORDER BY dr.created_at ASC`
      );

      return result.rows.map(row => new DeletionRequest(
        row.id,
        row.station_id,
        row.requested_by,
        row.status,
        row.reviewed_by,
        row.reason,
        row.created_at,
        row.updated_at,
        row.station_name,
        row.requester_name,
        row.requester_email
      ));
    } catch (error) {
      throw error;
    }
  }

  // Approve a deletion request and delete the station
  static async approve(requestId, adminId) {
    try {
      // Start a transaction
      await query('BEGIN');

      // Update the deletion request status
      const updateResult = await query(
        `UPDATE deletion_requests
         SET status = 'approved', reviewed_by = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [adminId, requestId]
      );

      if (updateResult.rows.length === 0) {
        await query('ROLLBACK');
        return null;
      }

      const request = updateResult.rows[0];

      // Delete the charging station
      await query(
        'DELETE FROM charging_stations WHERE id = $1',
        [request.station_id]
      );

      await query('COMMIT');

      return new DeletionRequest(
        request.id,
        request.station_id,
        request.requested_by,
        request.status,
        request.reviewed_by,
        request.reason,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // Reject a deletion request
  static async reject(requestId, adminId) {
    try {
      const result = await query(
        `UPDATE deletion_requests
         SET status = 'rejected', reviewed_by = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [adminId, requestId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const request = result.rows[0];
      return new DeletionRequest(
        request.id,
        request.station_id,
        request.requested_by,
        request.status,
        request.reviewed_by,
        request.reason,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Check if there's already a pending deletion request for a station
  static async findPendingByStationId(stationId) {
    try {
      const result = await query(
        'SELECT * FROM deletion_requests WHERE station_id = $1 AND status = \'pending\'',
        [stationId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const request = result.rows[0];
      return new DeletionRequest(
        request.id,
        request.station_id,
        request.requested_by,
        request.status,
        request.reviewed_by,
        request.reason,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      station_id: this.station_id,
      requested_by: this.requested_by,
      status: this.status,
      reviewed_by: this.reviewed_by,
      reason: this.reason,
      created_at: this.created_at,
      updated_at: this.updated_at,
      station_name: this.station_name,
      requester_name: this.requester_name,
      requester_email: this.requester_email
    };
  }
}

module.exports = DeletionRequest;
