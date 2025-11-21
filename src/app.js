import express from 'express';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { xss } from 'express-xss-sanitizer';

import APIError from './utils/apiError.js';
import globalError from './middlewares/errorMiddleware.js';
import mountRoutes from './routes/index.js';
import './config/passport.js';
import { dbMiddleware } from './middlewares/dbMiddleware.js';
import { bookingWebhookHandler } from './services/bookingService.js';

const app = express();

// ===============================
//  MIDDLEWARE CONFIGURATION
// ===============================
const corsOptions = {
  origin: process.env.DOMAIN_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(compression());

// -------------------------------
// Stripe webhook must come BEFORE express.json()
// -------------------------------
app.post(
  '/api/v1/bookings/webhook',
  express.raw({ type: 'application/json' }),
  bookingWebhookHandler
);

app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// ===============================
//  SECURITY: RATE LIMITING + HPP
// ===============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(dbMiddleware)

app.use('/api', limiter);
app.use(hpp({ whitelist: ['price', 'sold', 'quantity', 'avgRating'] }));

// ===============================
//  PASSPORT (Google OAuth)
// ===============================
app.use(passport.initialize());

// ===============================
//  ROUTES
// ===============================
mountRoutes(app);

// ===============================
//  HANDLING UNDEFINED ROUTES
// ===============================
app.all('*', (req, res, next) => {
  const error = new APIError(`Can't find this route: ${req.originalUrl}`, 400);
  next(error);
});

// ===============================
//  GLOBAL ERROR HANDLER
// ===============================
app.use(globalError);

export default app;
