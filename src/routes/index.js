import userRoute from './userRoute.js';
import authRoute from './authRoute.js';
import hotelRoute from './hotelRoute.js';
import roomTypeRoute from './roomTypeRoute.js';
import transportationRoute from './transportationRoute.js';
import tripRoute from './tripRoute.js';
import packageRoute from './packageRoute.js';
import destinationRoute from './destinationRoute.js';
import bookingRoute from './bookingRoute.js';
import ragRoute from './ragRoute.js';

import express from '';

// Mount Routes
const mountRoutes = (app) => {
  app.get('/', (req, res) => {
    res.redirect('/api/v1');
  });
  app.get('/api/v1', (req, res) => {
    res.status(200).json({
      message: 'Welcome to TourismEase API v1 🚀',
      status: 'success',
      routes: {
        auth: '/api/v1/auth',
      },
    });
  });


  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/hotels', hotelRoute);
  app.use('/api/v1/room-types', roomTypeRoute);
  app.use('/api/v1/transportations', transportationRoute);
  app.use('/api/v1/destinations', destinationRoute);
  app.use('/api/v1/packages', packageRoute);
  app.use('/api/v1/trips', tripRoute);
  app.use('/api/v1/bookings', bookingRoute);
  app.use('/api/v1/fag', ragRoute);
};

export default mountRoutes;
