const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ 
      message: 'Not authenticated',
      error: 'Authorization header missing'
    });
  }
  
  // Check if it starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Not authenticated',
      error: 'Invalid authorization format. Expected: Bearer <token>'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      message: 'Not authenticated',
      error: 'Token is missing from Authorization header'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Propagate role as well so requireRole can work correctly
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Not authenticated',
        error: 'Token has expired'
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Not authenticated',
        error: 'Invalid token'
      });
    } else {
      return res.status(401).json({ 
        message: 'Not authenticated',
        error: 'Token verification failed'
      });
    }
  }
};

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
}; 