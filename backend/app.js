const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./utils/initDatabase');
const authRoutes = require('./routes/auth');
const chargerRoutes = require('./routes/chargers');
const geocodingRoutes = require('./routes/geocoding');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      process.env.FRONTEND_URL || 'https://ecovolt.vercel.app',
      'https://ecovolt-frontend.vercel.app',
      'https://ecovolt.vercel.app'
    ]
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'], // Common frontend dev ports
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EcoVolt Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chargers', chargerRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EcoVolt Charging Station API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      chargers: {
        list: 'GET /api/chargers',
        get: 'GET /api/chargers/:id',
        create: 'POST /api/chargers',
        update: 'PUT /api/chargers/:id',
        delete: 'DELETE /api/chargers/:id'
      },
      geocoding: {
        search: 'GET /api/geocoding/search?q=location',
        coordinates: 'GET /api/geocoding/coordinates?location=name',
        reverse: 'GET /api/geocoding/reverse?lat=x&lng=y',
        validate: 'GET /api/geocoding/validate?lat=x&lng=y'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔄 Starting EcoVolt Backend Server...');

    // Start the server first
    const server = app.listen(PORT, () => {
      console.log(`🚀 EcoVolt Backend Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    });

    // Initialize database tables in the background
    setTimeout(async () => {
      try {
        console.log('🔄 Initializing database tables...');
        await initDatabase();
        console.log('✅ Database initialization completed successfully!');
      } catch (error) {
        console.error('⚠️ Database initialization failed, but server is still running:', error.message);
        console.log('💡 You can manually create tables or check database connection');
      }
    }, 1000);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
