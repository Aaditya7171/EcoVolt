const adminMiddleware = (req, res, next) => {
  try {
    // Check if user exists (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authorization' 
    });
  }
};

module.exports = adminMiddleware;
