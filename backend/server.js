import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure structured logger
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
});

// Request ID middleware — attaches unique ID to each request
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});

// HTTP logging middleware
app.use(pinoHttp({ logger, genReqId: (req) => req.requestId }));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', import('./routes/auth.js'));
app.use('/api/v1/repos', import('./routes/repos.js'));

// Health check endpoint (for monitoring)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling middleware (must be last)
app.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';

  logger.error({ err, requestId }, err.message);

  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: err.code || 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      requestId,
    });
  } else {
    res.status(err.status || 500).json({
      error: err.code || 'INTERNAL_ERROR',
      message: err.message,
      requestId,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
