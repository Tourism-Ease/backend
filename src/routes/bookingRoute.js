import express from 'express';
import {
  createBooking,
  // webhookCheckout,
  getBookings,
  getBookingById,
  filterBookingsForLoggedUsers,
  cancelBooking,
  confirmBooking,
  payRemainingAmount,
  bookingWebhookHandler,
} from '../services/bookingService.js';

import { protect, allowedTo } from '../services/authService.js';

const router = express.Router();




app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  bookingWebhookHandler
);


// ----------------------------
// PROTECTED ROUTES
// ----------------------------
router.use(protect);

// ----------------------------
// USER ROUTES
// ----------------------------

// Create a booking (user books a trip/package)
router.post('/', allowedTo('user'), createBooking);

// Get user's own bookings (or admin sees all)
router.get('/', allowedTo('user', 'admin'), filterBookingsForLoggedUsers, getBookings);

// Get single booking
router.get('/:id', allowedTo('user', 'admin'), getBookingById);

// Cancel booking (user can cancel if allowed)
router.patch('/:id/cancel', allowedTo('user', 'admin'), cancelBooking);

// Pay remaining amount (for deposit bookings)
router.get('/:id/pay-remaining', allowedTo('user'), payRemainingAmount);

// ----------------------------
// ADMIN ROUTES
// ----------------------------

// Confirm booking (admin)
router.put('/:id/confirm', allowedTo('admin'), confirmBooking);

// Stripe webhook (no auth, called by Stripe)
// router.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout);

export default router;
