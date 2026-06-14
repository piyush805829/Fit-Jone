// Load environment config first (validates required vars)
const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Route imports (these files will be created next)
const downloadRoutes = require('./routes/downloadRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ─── Create Express App ──────────────────────────────────────────────
const app = express();

// Trust first proxy (Render, Heroku, etc.) for accurate rate-limiting IPs
app.set('trust proxy', 1);

// ─── Global Middleware (order matters) ───────────────────────────────

// Security headers — disable crossOriginResourcePolicy to allow APK redirects
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — allow the configured frontend URL(s) and any Vercel domain
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);

    if (env.nodeEnv === 'development') {
      return callback(null, true);
    }

    // Support comma-separated FRONTEND_URL list
    const allowedOrigins = env.frontendUrl.split(',').map((u) => u.trim());

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    callback(new Error('CORS Error: Origin not allowed'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'x-admin-key', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS requests across all routes

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// General rate limiter
app.use(generalLimiter);

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api', downloadRoutes);
app.use('/api/admin', adminRoutes);



// ─── Error Handling ──────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════╗');
      console.log('║         🚀 FitJone API Server           ║');
      console.log('╠══════════════════════════════════════════╣');
      console.log(`║  Port:        ${String(env.port).padEnd(27)}║`);
      console.log(`║  Environment: ${env.nodeEnv.padEnd(27)}║`);
      console.log(`║  Frontend:    ${env.frontendUrl.substring(0, 27).padEnd(27)}║`);
      console.log('╚══════════════════════════════════════════╝');
      console.log('');
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        try {
          await mongoose.disconnect();
          console.log('🗄️  MongoDB disconnected');
        } catch (err) {
          console.error('Error during MongoDB disconnect:', err.message);
        }
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
