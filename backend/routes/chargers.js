const express = require('express');
const ChargingStation = require('../models/ChargingStation');
const DeletionRequest = require('../models/DeletionRequest');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Database health check endpoint
router.get('/health', async (req, res) => {
  try {
    const { testConnection, checkTables, query } = require('../config/database');

    console.log(`[${new Date().toISOString()}] Database health check requested`);

    // Test basic database connection
    const connectionTest = await testConnection();

    if (!connectionTest.success) {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed',
        data: {
          connection: 'FAILED',
          error: connectionTest.error,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check if required tables exist
    const tablesCheck = await checkTables();

    // Get basic counts if tables exist
    let counts = {};
    try {
      if (tablesCheck.existingTables.includes('users')) {
        const userCount = await query('SELECT COUNT(*) as count FROM users');
        counts.users = parseInt(userCount.rows[0].count);
      }

      if (tablesCheck.existingTables.includes('charging_stations')) {
        const stationCount = await query('SELECT COUNT(*) as count FROM charging_stations');
        counts.charging_stations = parseInt(stationCount.rows[0].count);
      }

      if (tablesCheck.existingTables.includes('deletion_requests')) {
        const deletionCount = await query('SELECT COUNT(*) as count FROM deletion_requests');
        counts.deletion_requests = parseInt(deletionCount.rows[0].count);
      }
    } catch (countError) {
      console.error('Error getting counts:', countError);
      counts.error = 'Failed to get table counts';
    }

    const isHealthy = tablesCheck.success;

    console.log(`[${new Date().toISOString()}] Database health check result: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? 'Database is healthy' : 'Database has issues - missing tables',
      data: {
        connection: 'OK',
        tables: {
          existing: tablesCheck.existingTables,
          missing: tablesCheck.missingTables,
          required: tablesCheck.requiredTables
        },
        counts: counts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database health check error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      data: {
        connection: 'ERROR',
        error: {
          message: error.message,
          code: error.code
        },
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Database initialization endpoint
router.post('/init-db', async (req, res) => {
  try {
    const { initDatabase } = require('../utils/initDatabase');

    console.log('Manual database initialization requested');
    await initDatabase();

    res.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual database initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: {
        message: error.message,
        code: error.code
      }
    });
  }
});

// Debug endpoint to view all data (remove in production)
router.get('/debug/all-data', authMiddleware, async (req, res) => {
  try {
    const { query } = require('../config/database');

    // Get all users (without passwords)
    const usersResult = await query('SELECT id, name, email, created_at FROM users ORDER BY id');

    // Get all charging stations with user info
    const stationsResult = await query(`
      SELECT
        cs.id,
        cs.name,
        cs.latitude,
        cs.longitude,
        cs.status,
        cs.power_output,
        cs.connector_type,
        cs.user_id,
        u.name as owner_name,
        u.email as owner_email,
        cs.created_at,
        cs.updated_at
      FROM charging_stations cs
      LEFT JOIN users u ON cs.user_id = u.id
      ORDER BY cs.id
    `);

    res.json({
      success: true,
      message: 'All database data retrieved',
      data: {
        users: usersResult.rows,
        charging_stations: stationsResult.rows,
        summary: {
          total_users: usersResult.rows.length,
          total_stations: stationsResult.rows.length
        }
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving debug data'
    });
  }
});

// @route   GET /api/chargers
// @desc    Get all charging stations with optional filters
// @access  Public (for guest users)
router.get('/', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log(`[${new Date().toISOString()}] GET /api/chargers - Starting request`);

    const { status, power_output, connector_type } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (power_output) {
      const parsedPowerOutput = parseInt(power_output);
      if (isNaN(parsedPowerOutput)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid power_output parameter. Must be a number.'
        });
      }
      filters.power_output = parsedPowerOutput;
    }
    if (connector_type) filters.connector_type = connector_type;

    console.log(`[${new Date().toISOString()}] Applying filters:`, filters);

    const stations = await ChargingStation.findAll(filters);

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] GET /api/chargers - Completed in ${duration}ms, found ${stations.length} stations`);

    res.json({
      success: true,
      message: 'Charging stations retrieved successfully',
      data: {
        stations: stations.map(station => station.toJSON()),
        count: stations.length
      },
      meta: {
        duration: duration,
        filters: filters,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Get chargers error after ${duration}ms:`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });

    // Provide more specific error messages based on error type
    let errorMessage = 'Server error while retrieving charging stations';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection failed. Please try again later.';
      statusCode = 503;
    } else if (error.code === '42P01') { // Table does not exist
      errorMessage = 'Database tables not initialized. Please contact support.';
      statusCode = 503;
    } else if (error.code === '42703') { // Column does not exist
      errorMessage = 'Database schema mismatch. Please contact support.';
      statusCode = 503;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Database query timed out. Please try again.';
      statusCode = 504;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      meta: {
        duration: duration,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
          error: error.message,
          code: error.code
        })
      }
    });
  }
});

// @route   GET /api/chargers/pending-counts
// @desc    Get count of pending approvals for admin
// @access  Admin only
router.get('/pending-counts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/chargers/pending-counts - Starting request`);

    // Try to get pending stations with error handling
    let pendingStations = [];
    try {
      pendingStations = await ChargingStation.findPending();
    } catch (stationError) {
      console.error('Error fetching pending stations:', stationError);
      // Continue with empty array if table doesn't exist yet
      if (stationError.code !== '42P01') { // Not "table does not exist"
        throw stationError;
      }
    }

    // Try to get pending deletions with error handling
    let pendingDeletions = [];
    try {
      pendingDeletions = await DeletionRequest.findPending();
    } catch (deletionError) {
      console.error('Error fetching pending deletions:', deletionError);
      // Continue with empty array if table doesn't exist yet
      if (deletionError.code !== '42P01') { // Not "table does not exist"
        throw deletionError;
      }
    }

    console.log(`[${new Date().toISOString()}] Found ${pendingStations.length} pending stations, ${pendingDeletions.length} pending deletions`);

    res.json({
      success: true,
      message: 'Pending counts retrieved successfully',
      data: {
        stations: pendingStations.length,
        deletions: pendingDeletions.length,
        total: pendingStations.length + pendingDeletions.length
      }
    });
  } catch (error) {
    console.error('Get pending counts error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    let errorMessage = 'Server error while retrieving pending counts';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection failed. Please try again later.';
      statusCode = 503;
    } else if (error.code === '42P01') {
      errorMessage = 'Database tables not initialized. Please contact support.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
});

// @route   GET /api/chargers/pending
// @desc    Get all pending charging stations for admin approval
// @access  Admin only
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingStations = await ChargingStation.findPending();

    res.json({
      success: true,
      message: 'Pending charging stations retrieved successfully',
      data: {
        stations: pendingStations.map(station => station.toJSON()),
        count: pendingStations.length
      }
    });
  } catch (error) {
    console.error('Get pending chargers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving pending charging stations'
    });
  }
});

// @route   GET /api/chargers/deletion-requests
// @desc    Get all pending deletion requests for admin
// @access  Admin only
router.get('/deletion-requests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingRequests = await DeletionRequest.findPending();

    res.json({
      success: true,
      message: 'Pending deletion requests retrieved successfully',
      data: {
        requests: pendingRequests.map(request => request.toJSON()),
        count: pendingRequests.length
      }
    });
  } catch (error) {
    console.error('Get pending deletion requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving pending deletion requests'
    });
  }
});

// @route   POST /api/chargers/deletion-requests/:id/approve
// @desc    Approve a deletion request and delete the station
// @access  Admin only
router.post('/deletion-requests/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deletion request ID'
      });
    }

    const approvedRequest = await DeletionRequest.approve(requestId, req.user.id);

    if (!approvedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Pending deletion request not found'
      });
    }

    res.json({
      success: true,
      message: 'Deletion request approved and station deleted successfully',
      data: {
        request: approvedRequest.toJSON()
      }
    });
  } catch (error) {
    console.error('Approve deletion request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving deletion request'
    });
  }
});

// @route   POST /api/chargers/deletion-requests/:id/reject
// @desc    Reject a deletion request
// @access  Admin only
router.post('/deletion-requests/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deletion request ID'
      });
    }

    const rejectedRequest = await DeletionRequest.reject(requestId, req.user.id);

    if (!rejectedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Pending deletion request not found'
      });
    }

    res.json({
      success: true,
      message: 'Deletion request rejected successfully',
      data: {
        request: rejectedRequest.toJSON()
      }
    });
  } catch (error) {
    console.error('Reject deletion request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting deletion request'
    });
  }
});

// @route   POST /api/chargers
// @desc    Create a new charging station
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, latitude, longitude, status, power_output, connector_type } = req.body;

    // Validation
    if (!name || !latitude || !longitude || !power_output || !connector_type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, latitude, longitude, power_output, and connector_type'
      });
    }

    // Validate latitude and longitude
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180'
      });
    }

    // Validate power output
    if (power_output <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Power output must be greater than 0'
      });
    }

    // Validate status
    if (status && !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Active or Inactive'
      });
    }

    const stationData = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: status || 'Active',
      power_output: parseInt(power_output),
      connector_type,
      user_id: req.user.id
    };

    // Check if user is admin to determine approval status
    const isAdmin = req.user.isAdmin();
    const station = await ChargingStation.create(stationData, isAdmin);

    const message = isAdmin
      ? 'Charging station created successfully'
      : 'Charging station submitted for approval';

    res.status(201).json({
      success: true,
      message,
      data: {
        station: station.toJSON()
      }
    });
  } catch (error) {
    console.error('Create charger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating charging station'
    });
  }
});

// @route   GET /api/chargers/:id
// @desc    Get a single charging station by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charging station ID'
      });
    }

    const station = await ChargingStation.findById(id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    res.json({
      success: true,
      message: 'Charging station retrieved successfully',
      data: {
        station: station.toJSON()
      }
    });
  } catch (error) {
    console.error('Get charger by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving charging station'
    });
  }
});

// @route   PUT /api/chargers/:id
// @desc    Update a charging station
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, status, power_output, connector_type } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charging station ID'
      });
    }

    // Check if station exists
    const existingStation = await ChargingStation.findById(id);
    if (!existingStation) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    // Check if user owns this station or is admin
    const isAdmin = req.user.isAdmin();
    if (!isAdmin && existingStation.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this charging station'
      });
    }

    // Validation
    if (!name || !latitude || !longitude || !power_output || !connector_type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, latitude, longitude, power_output, and connector_type'
      });
    }

    // Validate latitude and longitude
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180'
      });
    }

    // Validate power output
    if (power_output <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Power output must be greater than 0'
      });
    }

    // Validate status
    if (status && !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Active or Inactive'
      });
    }

    const updateData = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: status || 'Active',
      power_output: parseInt(power_output),
      connector_type
    };

    const updatedStation = await ChargingStation.update(id, updateData);

    res.json({
      success: true,
      message: 'Charging station updated successfully',
      data: {
        station: updatedStation.toJSON()
      }
    });
  } catch (error) {
    console.error('Update charger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating charging station'
    });
  }
});

// @route   DELETE /api/chargers/:id
// @desc    Request deletion of a charging station
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charging station ID'
      });
    }

    // Check if station exists
    const existingStation = await ChargingStation.findById(id);
    if (!existingStation) {
      return res.status(404).json({
        success: false,
        message: 'Charging station not found'
      });
    }

    // Check if user owns this station or is admin
    const isAdmin = req.user.isAdmin();
    if (!isAdmin && existingStation.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this charging station'
      });
    }

    // If admin, delete directly
    if (isAdmin) {
      const deleted = await ChargingStation.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Charging station not found'
        });
      }

      return res.json({
        success: true,
        message: 'Charging station deleted successfully'
      });
    }

    // For regular users, check if there's already a pending deletion request
    const existingRequest = await DeletionRequest.findPendingByStationId(id);
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A deletion request for this station is already pending'
      });
    }

    // Create deletion request
    const deletionRequest = await DeletionRequest.create({
      station_id: parseInt(id),
      requested_by: req.user.id,
      reason
    });

    res.json({
      success: true,
      message: 'Deletion request submitted for admin approval',
      data: {
        request: deletionRequest.toJSON()
      }
    });
  } catch (error) {
    console.error('Delete charger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing deletion request'
    });
  }
});

// @route   POST /api/chargers/:id/approve
// @desc    Approve a pending charging station
// @access  Admin only
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);

    if (isNaN(stationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid station ID'
      });
    }

    const approvedStation = await ChargingStation.approve(stationId, req.user.id);

    if (!approvedStation) {
      return res.status(404).json({
        success: false,
        message: 'Pending charging station not found'
      });
    }

    res.json({
      success: true,
      message: 'Charging station approved successfully',
      data: {
        station: approvedStation.toJSON()
      }
    });
  } catch (error) {
    console.error('Approve charger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving charging station'
    });
  }
});

// @route   POST /api/chargers/:id/reject
// @desc    Reject a pending charging station
// @access  Admin only
router.post('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);

    if (isNaN(stationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid station ID'
      });
    }

    const rejectedStation = await ChargingStation.reject(stationId, req.user.id);

    if (!rejectedStation) {
      return res.status(404).json({
        success: false,
        message: 'Pending charging station not found'
      });
    }

    res.json({
      success: true,
      message: 'Charging station rejected successfully',
      data: {
        station: rejectedStation.toJSON()
      }
    });
  } catch (error) {
    console.error('Reject charger error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting charging station'
    });
  }
});

module.exports = router;
