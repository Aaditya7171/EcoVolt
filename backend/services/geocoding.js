const axios = require('axios');

class GeocodingService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
    console.log('OpenStreetMap Nominatim geocoding service initialized');
  }

  /**
   * Search for locations by name with autocomplete suggestions
   * @param {string} query - Location name to search for
   * @param {number} limit - Maximum number of results (default: 5)
   * @returns {Promise<Array>} Array of location suggestions
   */
  async searchLocations(query, limit = 5) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query.trim(),
          format: 'json',
          limit: Math.min(limit, 10),
          addressdetails: 1,
          extratags: 1
        },
        headers: {
          'User-Agent': 'EcoVolt-ChargingStation-App/1.0 (contact@ecovolt.com)'
        },
        timeout: 30000 // Increased to 30 second timeout
      });

      return response.data.map(location => ({
        name: location.display_name.split(',')[0].trim(),
        country: location.address?.country || '',
        state: location.address?.state || location.address?.province || null,
        city: location.address?.city || location.address?.town || location.address?.village || null,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        displayName: this.formatDisplayName(location),
        fullAddress: location.display_name,
        type: location.type || 'location',
        importance: location.importance || 0
      }));
    } catch (error) {
      console.error('Geocoding search error:', error.message);

      if (error.response) {
        // API error response
        throw new Error(`Geocoding service error: ${error.response.status}`);
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        throw new Error('Geocoding service timeout');
      } else {
        // Network or other error
        throw new Error('Geocoding service unavailable');
      }
    }
  }

  /**
   * Get coordinates for a specific location name
   * @param {string} locationName - Exact location name
   * @returns {Promise<Object|null>} Location object with coordinates or null
   */
  async getCoordinates(locationName) {
    try {
      const results = await this.searchLocations(locationName, 1);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reverse geocoding - get location name from coordinates
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object|null>} Location object or null
   */
  async reverseGeocode(latitude, longitude) {
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'EcoVolt-ChargingStation-App/1.0 (contact@ecovolt.com)'
        },
        timeout: 30000 // Increased to 30 second timeout
      });

      if (response.data && response.data.display_name) {
        const location = response.data;
        return {
          name: location.display_name.split(',')[0].trim(),
          country: location.address?.country || '',
          state: location.address?.state || location.address?.province || null,
          city: location.address?.city || location.address?.town || location.address?.village || null,
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
          displayName: this.formatDisplayName(location),
          fullAddress: location.display_name
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      throw new Error('Reverse geocoding failed');
    }
  }

  /**
   * Format display name for location
   * @param {Object} location - Location object from API
   * @returns {string} Formatted display name
   */
  formatDisplayName(location) {
    // For OpenStreetMap Nominatim, use the display_name or construct from address
    if (location.display_name) {
      // Take the first few parts of the display name for a cleaner look
      const parts = location.display_name.split(',').slice(0, 3);
      return parts.join(',').trim();
    }

    // Fallback to constructing from address components
    let displayName = location.address?.city || location.address?.town || location.address?.village || location.name || 'Unknown';

    if (location.address?.state || location.address?.province) {
      displayName += `, ${location.address.state || location.address.province}`;
    }

    if (location.address?.country) {
      displayName += `, ${location.address.country}`;
    }

    return displayName;
  }

  /**
   * Validate coordinates
   * @param {number} latitude - Latitude to validate
   * @param {number} longitude - Longitude to validate
   * @returns {boolean} True if coordinates are valid
   */
  validateCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }
}

module.exports = new GeocodingService();
