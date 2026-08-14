const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'taskapp_jwt_secret_default_key_2026';

// Middleware to verify JWT Bearer token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token format.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Invalid or malformed authentication token.',
    });
  }
};

// Middleware to enforce specific roles (e.g. 'admin')
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden. This action requires ${role} privileges.`,
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET,
};
