import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import { imageStorage } from './config/cloudinary.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import serviceBookingRoutes from './routes/serviceBookingRoutes.js';
import sparePartRoutes from './routes/sparePartRoutes.js';
import partRequestRoutes from './routes/partRequestRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { success, ApiError } from './utils/apiResponse.js';

export function createApp(options = {}) {
  const app = express();
  app.locals.imageStorage = options.imageStorage || imageStorage;
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.origins.includes(origin))
          return callback(null, true);
        callback(new ApiError(403, 'Origin is not allowed'));
      },
    }),
  );
  app.get(['/health', '/api/health'], (_req, res) => {
    res.set('Cache-Control', 'no-store');
    const connected = mongoose.connection.readyState === 1;
    if (!connected)
      return res.status(503).json({
        success: false,
        message: 'Database is unavailable',
        errors: [],
      });
    return success(res, 'AutoCare API is healthy', {
      status: 'ok',
      database: 'connected',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 1000,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests; try again later',
        errors: [],
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/service-bookings', serviceBookingRoutes);
  app.use('/api/spare-parts', sparePartRoutes);
  app.use('/api/part-requests', partRequestRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
export default createApp();
