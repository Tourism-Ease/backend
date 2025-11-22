import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import app from './src/app.js';
import dbConnection from './src/config/database.js';
import { startCancelExpiredBookingsJob } from './src/jobs/cancelExpiredBookings.js';

// ===============================
//  ENVIRONMENT VARIABLES
// ===============================
const PORT = process.env.PORT || 8000;

// ===============================
//  DATABASE CONNECTION
// ===============================
dbConnection();

// ===============================
//  START SERVER
// ===============================
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
  // Cron jobs
  startCancelExpiredBookingsJob();

});

// ===============================
//  HANDLE UNHANDLED PROMISE REJECTIONS
// ===============================
process.on('unhandledRejection', (error) => {
  console.error(`Unhandled Rejection: ${error.name} | ${error.message}`);
  server.close(() => {
    console.log('Shutting down...');
    process.exit(1);
  });
});
