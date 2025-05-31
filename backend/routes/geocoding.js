const express = require('express');
const router = express.Router();
const geocodingService = require('../services/geocoding');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   GET /api/geocoding/search
// @desc    Search for locations by name (autocomplete)
// @access  Private
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
    }

    if (query.trim().length < 2) {
      return res.json({
        success: true,
        message: 'Query too short for search',
        data: {
          locations: []
        }
      });
    }

    const limitNum = limit ? parseInt(limit) : 5;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 10) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a number between 1 and 10'
      });
    }

    const locations = await geocodingService.searchLocations(query, limitNum);

    res.json({
      success: true,
      message: 'Location search completed successfully',
      data: {
        locations,
        query: query.trim(),
        count: locations.length
      }
    });
  } catch (error) {
    console.error('Location search error:', error);

    let statusCode = 500;
    let message = 'Server error during location search';

    if (error.message.includes('API key not configured')) {
      statusCode = 503;
      message = 'Geocoding service not available';
    } else if (error.message.includes('service error')) {
      statusCode = 502;
      message = 'External geocoding service error';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      message = 'Geocoding service timeout';
    }

    res.status(statusCode).json({
      success: false,
      message
    });
  }
});

// @route   GET /api/geocoding/coordinates
// @desc    Get coordinates for a specific location name
// @access  Private
router.get('/coordinates', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required'
      });
    }

    const result = await geocodingService.getCoordinates(location);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Coordinates retrieved successfully',
      data: {
        location: result
      }
    });
  } catch (error) {
    console.error('Get coordinates error:', error);

    let statusCode = 500;
    let message = 'Server error while retrieving coordinates';

    if (error.message.includes('API key not configured')) {
      statusCode = 503;
      message = 'Geocoding service not available';
    }

    res.status(statusCode).json({
      success: false,
      message
    });
  }
});

// @route   GET /api/geocoding/reverse
// @desc    Reverse geocoding - get location name from coordinates
// @access  Private
router.get('/reverse', async (req, res) => {
  try {
    const { lat: latitude, lng: longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and longitude (lng) parameters are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!geocodingService.validateCoordinates(lat, lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    const result = await geocodingService.reverseGeocode(lat, lng);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No location found for the given coordinates'
      });
    }

    res.json({
      success: true,
      message: 'Reverse geocoding completed successfully',
      data: {
        location: result
      }
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);

    let statusCode = 500;
    let message = 'Server error during reverse geocoding';

    if (error.message.includes('API key not configured')) {
      statusCode = 503;
      message = 'Geocoding service not available';
    }

    res.status(statusCode).json({
      success: false,
      message
    });
  }
});

// @route   GET /api/geocoding/validate
// @desc    Validate coordinates
// @access  Private
router.get('/validate', async (req, res) => {
  try {
    const { lat: latitude, lng: longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and longitude (lng) parameters are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const isValid = geocodingService.validateCoordinates(lat, lng);

    res.json({
      success: true,
      message: 'Coordinate validation completed',
      data: {
        valid: isValid,
        coordinates: {
          latitude: lat,
          longitude: lng
        }
      }
    });
  } catch (error) {
    console.error('Coordinate validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during coordinate validation'
    });
  }
});

module.exports = router;
