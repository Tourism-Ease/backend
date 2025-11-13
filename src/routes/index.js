import userRoute from './userRoute.js';
import authRoute from './authRoute.js';

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
};

export default mountRoutes;
