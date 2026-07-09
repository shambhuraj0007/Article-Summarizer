// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./_Routes/AuthRouter');
const ProductRouter = require('./_Routes/ProductRouter');
const SummaryRouter = require('./_Routes/SummaryRouter');

require('./_Models/db');

const PORT = process.env.PORT || 8080;

// Body parser with increased limit for large extracted text
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// CORS setup - Automatically allow same-origin requests and whitelisted domains
const corsOptionsDelegate = function (req, callback) {
  const origin = req.header('Origin');
  const host = req.header('Host');
  const proto = req.header('x-forwarded-proto') || 'http';
  
  // Check if it is a same-origin request
  const isSameOrigin = origin && (
    origin === `${proto}://${host}` || 
    origin === `http://${host}` || 
    origin === `https://${host}`
  );

  // Define allowed cross-origin patterns (e.g. for external development or staging)
  const allowedOrigins = [
    "http://localhost:5173",
    "https://shambhuraj.vercel.app",
    "https://tasks-xi-rosy.vercel.app",
    /^https:\/\/.*\.vercel\.app$/ // Allow all Vercel deployments
  ];

  const isAllowedOrigin = origin && allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') return allowed === origin;
    return allowed.test(origin);
  });

  let corsOptions;
  if (!origin || isSameOrigin || isAllowedOrigin) {
    corsOptions = { 
      origin: true, 
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["Content-Length", "X-Request-Id"],
      maxAge: 86400 // 24 hours
    };
  } else {
    console.warn('⚠️ CORS blocked origin:', origin);
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

// Handle preflight requests globally
app.options('*', cors(corsOptionsDelegate));

// Test route
app.get('/ping', (req, res) => {
  res.send('PONG');
});

// Routes
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/summaries', SummaryRouter);

// Comprehensive diagnostic endpoint
app.get('/api/diagnostics', async (req, res) => {
  const aiService = require('./_Services/aiService');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    server: {
      running: true,
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    },
    database: {
      mongoUri: !!process.env.MONGO_URI,
      connected: true
    },
    authentication: {
      jwtSecret: !!process.env.JWT_SECRET
    },
    aiService: {
      ...aiService.getStatus(),
      apiKeyLength: process.env.OPENROUTER_API_KEY?.length,
      apiKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...',
      siteUrl: process.env.SITE_URL,
      siteName: process.env.SITE_NAME
    }
  };

  console.log('\n🔍 Diagnostics requested:', JSON.stringify(diagnostics, null, 2));
  res.json(diagnostics);
});

// Test AI with detailed logging
app.get('/api/test-ai', async (req, res) => {
  const aiService = require('./_Services/aiService');

  console.log('\n🧪 Running AI service test...');

  const testResult = await aiService.testConnection();
  const status = aiService.getStatus();

  res.json({
    success: testResult,
    message: testResult
      ? '✅ AI service is working correctly!'
      : '❌ AI service test failed. Check server logs for details.',
    status: status,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server (only if not running as a Vercel Serverless Function)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;
