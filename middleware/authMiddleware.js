const jwt = require('jsonwebtoken');

// VERIFY TOKEN (existing)
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      const error = new Error('No token provided');
      error.statusCode = 401;
      return next(error);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      error.message = 'Token has expired';
      error.statusCode = 401;
    } else {
      error.message = 'Invalid token';
      error.statusCode = 401;
    }
    next(error);
  }
};

// VERIFY ADMIN (NEW - Add this!)
exports.verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      const error = new Error('No token provided');
      error.statusCode = 401;
      return next(error);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      const error = new Error('Admin access required');
      error.statusCode = 403;
      return next(error);
    }
    
    req.userId = decoded.userId;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      error.message = 'Token has expired';
      error.statusCode = 401;
    } else {
      error.message = 'Invalid token';
      error.statusCode = 401;
    }
    next(error);
  }
};