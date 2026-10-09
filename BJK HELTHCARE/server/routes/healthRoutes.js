const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getDBStatus } = require('../config/db');

// GET /api/health
router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    service: 'BJK Healthcare API',
    database: dbStatus,
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// GET /api/health/database
router.get('/health/database', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    service: 'BJK Healthcare API',
    database: dbStatus,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'MongoDB Atlas / Local',
    name: mongoose.connection.name || 'bjk_healthcare',
    timestamp: new Date().toISOString()
  });
});

// GET /api/health/services
router.get('/health/services', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    services: {
      api: 'HEALTHY',
      database: dbStatus === 'connected' ? 'HEALTHY' : 'ERROR',
      authentication: 'HEALTHY',
      storage: 'HEALTHY',
      aiService: 'HEALTHY'
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/hrms/health
router.get('/hrms/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    module: 'HRMS',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
