// Test utility to verify timeout and retry functionality
import { chargersAPI, clearChargersCache, getCacheStatus } from '@/services/api'

export const testTimeoutHandling = async () => {
  console.log('🧪 Testing timeout and retry functionality...')
  
  try {
    // Clear cache first
    clearChargersCache()
    console.log('✅ Cache cleared')
    
    // Test cache status
    const cacheStatus = getCacheStatus()
    console.log('📊 Cache status:', cacheStatus)
    
    // Test API call with retry mechanism
    console.log('🔄 Testing chargers API call...')
    const startTime = Date.now()
    
    const response = await chargersAPI.getAll()
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ API call successful in ${duration}ms`)
    console.log(`📊 Loaded ${response.data?.stations?.length || 0} charging stations`)
    
    // Test cache after successful call
    const newCacheStatus = getCacheStatus()
    console.log('📊 Cache status after API call:', newCacheStatus)
    
    return {
      success: true,
      duration,
      stationsCount: response.data?.stations?.length || 0,
      cacheStatus: newCacheStatus
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return {
      success: false,
      error: error.message,
      cacheStatus: getCacheStatus()
    }
  }
}

export const simulateSlowConnection = () => {
  console.log('🐌 Simulating slow connection...')
  // This would be used in development to test timeout handling
  // In a real scenario, you might throttle network in browser dev tools
}

export const testDatabaseHealth = async () => {
  console.log('🏥 Testing database health...')

  try {
    const response = await chargersAPI.checkHealth()

    if (response.success) {
      console.log('✅ Database is healthy')
      console.log('📊 Database status:', response.data)
      return { success: true, data: response.data }
    } else {
      console.log('⚠️ Database has issues:', response.message)
      return { success: false, message: response.message, data: response.data }
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error.message)
    return { success: false, error: error.message }
  }
}

export const initializeDatabase = async () => {
  console.log('🔧 Initializing database...')

  try {
    const response = await chargersAPI.initDatabase()

    if (response.success) {
      console.log('✅ Database initialized successfully')
      return { success: true }
    } else {
      console.log('❌ Database initialization failed:', response.message)
      return { success: false, message: response.message }
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error.message)
    return { success: false, error: error.message }
  }
}

export const logApiConfiguration = () => {
  console.log('⚙️ Current API Configuration:')
  console.log('- Timeout: 60 seconds')
  console.log('- Max Retries: 3')
  console.log('- Retry Delay: 1s base with exponential backoff')
  console.log('- Cache TTL: 30 seconds')
}
