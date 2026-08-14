const express = require('express');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const themeRoutes = require('./routes/themeRoutes');

const app = express();

// Disable HTTP ETag caching for real-time mobile API synchronization
app.set('etag', false);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploaded Avatar Media Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logging Middleware for Backend Terminal Console
app.use((req, res, next) => {
  const start = Date.now();
  const time = new Date().toLocaleTimeString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusSymbol = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    console.log(
      `[${time}] ${statusSymbol} ${req.method} ${req.originalUrl} -> Status: ${statusCode} (${duration}ms)`
    );
    if (req.body && Object.keys(req.body).length > 0 && req.method !== 'GET') {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '***';
      console.log(`   └─ 📦 Body:`, JSON.stringify(sanitizedBody));
    }
  });

  next();
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TaskApp Server is running smoothly with TiDB Cloud Database',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/themes', themeRoutes);


// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
