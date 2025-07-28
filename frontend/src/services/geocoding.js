import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class GeocodingService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/geocoding`,
      timeout: 30000 // Increased to 30 seconds for geocoding
    })

    // Add auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle response errors
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Geocoding API error:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Search for locations by name (autocomplete)
   * @param {string} query - Location name to search for
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of location suggestions
   */
  async searchLocations(query, limit = 5) {
    try {
      if (!query || query.trim().length < 2) {
        return []
      }

      const response = await this.apiClient.get('/search', {
        params: {
          q: query.trim(),
          limit
        }
      })

      return response.data.data.locations || []
    } catch (error) {
      console.error('Location search error:', error)
      
      if (error.response?.status === 503) {
        throw new Error('Geocoding service is currently unavailable')
      } else if (error.response?.status === 504) {
        throw new Error('Search request timed out. Please try again.')
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection.')
      }
      
      throw new Error('Failed to search locations. Please try again.')
    }
  }

  /**
   * Get coordinates for a specific location name
   * @param {string} locationName - Exact location name
   * @returns {Promise<Object|null>} Location object with coordinates
   */
  async getCoordinates(locationName) {
    try {
      if (!locationName || !locationName.trim()) {
        return null
      }

      const response = await this.apiClient.get('/coordinates', {
        params: {
          location: locationName.trim()
        }
      })

      return response.data.data.location || null
    } catch (error) {
      console.error('Get coordinates error:', error)
      
      if (error.response?.status === 404) {
        return null
      }
      
      throw new Error('Failed to get coordinates for location')
    }
  }

  /**
   * Reverse geocoding - get location name from coordinates
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object|null>} Location object
   */
  async reverseGeocode(latitude, longitude) {
    try {
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required')
      }

      const response = await this.apiClient.get('/reverse', {
        params: {
          lat: latitude,
          lng: longitude
        }
      })

      return response.data.data.location || null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      
      if (error.response?.status === 404) {
        return null
      }
      
      throw new Error('Failed to get location name for coordinates')
    }
  }

  /**
   * Validate coordinates
   * @param {number} latitude - Latitude to validate
   * @param {number} longitude - Longitude to validate
   * @returns {Promise<boolean>} True if coordinates are valid
   */
  async validateCoordinates(latitude, longitude) {
    try {
      const response = await this.apiClient.get('/validate', {
        params: {
          lat: latitude,
          lng: longitude
        }
      })

      return response.data.data.valid || false
    } catch (error) {
      console.error('Coordinate validation error:', error)
      return false
    }
  }

  /**
   * Client-side coordinate validation
   * @param {number} latitude - Latitude to validate
   * @param {number} longitude - Longitude to validate
   * @returns {boolean} True if coordinates are valid
   */
  isValidCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    )
  }

  /**
   * Format coordinates for display
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} precision - Number of decimal places
   * @returns {string} Formatted coordinates
   */
  formatCoordinates(latitude, longitude, precision = 4) {
    if (!this.isValidCoordinates(latitude, longitude)) {
      return 'Invalid coordinates'
    }
    
    return `${parseFloat(latitude).toFixed(precision)}, ${parseFloat(longitude).toFixed(precision)}`
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - First point latitude
   * @param {number} lng1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lng2 - Second point longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    if (!this.isValidCoordinates(lat1, lng1) || !this.isValidCoordinates(lat2, lng2)) {
      return 0
    }

    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return R * c
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees to convert
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }
}

export default new GeocodingService()
