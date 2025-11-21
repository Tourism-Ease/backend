import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  filterBookingsForLoggedUsers,
  cancelBooking,
  confirmBooking,
  payRemainingAmount,
  bookingWebhookHandler
} from '../services/bookingService.js';
import { protect, allowedTo } from '../services/authService.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// ----------------------------
// USER ROUTES
// ----------------------------
router.post('/', allowedTo('user'), createBooking);
router.get('/', allowedTo('user', 'admin'), filterBookingsForLoggedUsers, getBookings);
router.get('/:id', allowedTo('user', 'admin'), getBookingById);
router.patch('/:id/cancel', allowedTo('user', 'admin'), cancelBooking);
router.get('/:id/pay-remaining', allowedTo('user'), payRemainingAmount);

// ----------------------------
// ADMIN ROUTES
// ----------------------------
router.put('/:id/confirm', allowedTo('admin'), confirmBooking);

// ----------------------------
// STRIPE WEBHOOK
// ----------------------------
router.post('/webhook', express.raw({ type: 'application/json' }), bookingWebhookHandler);

export default router;
