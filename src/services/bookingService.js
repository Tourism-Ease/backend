import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import asyncHandler from 'express-async-handler';
import APIError from '../utils/apiError.js';

import * as factory from './handlerFactory.js';

import BookingModel from '../models/bookingModel.js';
import UserModel from '../models/userModel.js';
import TripModel from '../models/tripModel.js';
// import PackageModel from '../models/packageModel.js';

// Mock function to send email (replace with your actual email service)
const sendEmail = async (to, subject, text) => {
  console.log(`Email sent to ${to} | Subject: ${subject} | Text: ${text}`);
};

// -------------------------------------------------------------
// Filter Logged User Bookings
// -------------------------------------------------------------
export const filterBookingsForLoggedUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObject = { user: req.user._id };
  next();
});

// Helper: extract form data
const extractBookingData = (req) => {
  const {
    itemId,
    bookingType,
    quantity = 1,
    paymentType,
    dateFrom,
    dateTo,
    paymentMethod,
  } = req.body;
  if (!['Trip', 'Package'].includes(bookingType)) {
    throw new APIError('Invalid bookingType. Must be trip or package', 400);
  }
  if (!['cash', 'stripe'].includes(paymentMethod)) {
    throw new APIError('Invalid payment method. Must be cash or stripe', 400);
  }
  return { itemId, bookingType, quantity, paymentType, dateFrom, dateTo, paymentMethod };
};

// -------------------------------------------------------------
// CREATE BOOKING (CASH or STRIPE)
// -------------------------------------------------------------
export const createBooking = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { itemId, bookingType, quantity, paymentType, dateFrom, dateTo, paymentMethod } =
    extractBookingData(req);

  const model = bookingType === 'Trip' ? TripModel : PackageModel;
  const item = await model.findById(itemId);
  if (!item) return next(new APIError(`No ${bookingType} found with ID: ${itemId}`, 404));

  const basePrice = item.price || 0;
  const totalPrice = basePrice * quantity;

  if (paymentMethod === 'cash') {
    // --------------------- CASH ---------------------
    const booking = await BookingModel.create({
      user: userId,
      bookingType,
      item: itemId,
      quantity,
      paymentType,
      totalPrice,
      dateFrom,
      dateTo,
      paymentMethod: 'cash',
      paidAmount: paymentType === 'full' ? totalPrice : totalPrice * 0.5,
      remainingAmount: paymentType === 'full' ? 0 : totalPrice * 0.5,
      paymentStatus: paymentType === 'full' ? 'paid' : 'partial',
      bookingStatus: 'confirmed',
    });

    await sendEmail(
      req.user.email,
      'Booking Created',
      `Your booking for ${item.title} is created.`
    );
    return res.status(201).json({ status: 'success', data: booking });
  }

  // --------------------- STRIPE ---------------------
  // Calculate amount for Stripe based on full/deposit
  let stripeAmount = totalPrice;
  if (paymentType === 'deposit') {
    stripeAmount = totalPrice * 0.5; // 50% deposit
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: Math.round(stripeAmount * 100),
          product_data: {
            name: `${bookingType.toUpperCase()} - ${item.title}`,
          },
        },
        quantity,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success`,
    cancel_url: `${process.env.FRONTEND_URL}/pay`,
    customer_email: req.user.email,
    client_reference_id: itemId,
    metadata: {
      bookingType,
      quantity,
      paymentType,
      dateFrom,
      dateTo,
      totalPrice, // keep totalPrice for later reference in webhook
    },
  });

  res.status(200).json({ status: 'success', sessionUrl: session.url });
});

// -------------------------------------------------------------
// STRIPE WEBHOOK: CREATE BOOKING AFTER PAYMENT
// -------------------------------------------------------------
const createCardBooking = async (session) => {
  try {
    const itemId = session.client_reference_id;
    const { bookingType, quantity, paymentType, dateFrom, dateTo, totalPrice } = session.metadata;

    const user = await UserModel.findOne({ email: session.customer_email });
    if (!user) return;

    let paidAmount = session.amount_total / 100;
    let remainingAmount = 0;
    let paymentStatus = 'paid';

    if (paymentType === 'deposit') {
      const deposit = totalPrice * 0.5;
      paidAmount = deposit;
      remainingAmount = totalPrice - deposit;
      paymentStatus = 'partial';
    }

    const booking = await BookingModel.create({
      user: user._id,
      bookingType,
      item: itemId,
      quantity,
      paymentType,
      totalPrice,
      paidAmount,
      remainingAmount,
      paymentStatus,
      bookingStatus: 'confirmed',
      dateFrom,
      dateTo,
      paymentMethod: 'stripe',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
    });

    await sendEmail(
      user.email,
      'Booking Confirmed',
      `Your booking for ${bookingType} is confirmed. Paid: ${paidAmount} EGP${remainingAmount ? ', Remaining: ' + remainingAmount + ' EGP' : ''}.`
    );
  } catch (err) {
    console.error('Error creating Stripe booking:', err.message);
  }
};

// Webhook
export const webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createCardBooking(event.data.object);
  }

  res.status(200).json({ received: true });
});
// -------------------------------------------------------------
// Cancel Booking (with Stripe refund if needed)
// -------------------------------------------------------------
export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await BookingModel.findById(id);
  if (!booking) return next(new APIError('Booking not found', 404));

  if (req.user.role === 'user' && booking.user.toString() !== req.user._id.toString()) {
    return next(new APIError('Not authorized to cancel this booking', 403));
  }

  if (booking.bookingStatus === 'cancelled') {
    return next(new APIError('Booking is already cancelled', 400));
  }

  if (booking.paymentMethod === 'cash') {
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'pending';
    await booking.save();
    await sendEmail(req.user.email, 'Booking Cancelled', `Your booking has been cancelled.`);
    return res.status(200).json({ status: 'success', data: booking });
  }

  if (booking.paymentMethod === 'stripe') {
    if (!booking.stripePaymentIntentId) {
      return next(new APIError('Stripe payment not found for refund', 400));
    }

    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: Math.round(booking.paidAmount * 100),
    });

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.refundAmount = booking.paidAmount;
    booking.refundDate = new Date();
    await booking.save();

    await sendEmail(
      req.user.email,
      'Booking Cancelled & Refunded',
      `Your booking has been cancelled and refunded.`
    );

    return res.status(200).json({
      status: 'success',
      message: 'Booking cancelled and refunded successfully',
      data: booking,
      refund,
    });
  }
});

// -------------------------------------------------------------
// Admin Confirm Booking
// -------------------------------------------------------------
export const confirmBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await BookingModel.findById(id);
  if (!booking) return next(new APIError('Booking not found', 404));

  booking.bookingStatus = 'confirmed';
  await booking.save();

  const user = await UserModel.findById(booking.user);
  await sendEmail(user.email, 'Booking Confirmed', `Your booking is now confirmed.`);

  res.status(200).json({ status: 'success', data: booking });
});

// -------------------------------------------------------------
// User Pay Remaining Amount (for deposit bookings)
// -------------------------------------------------------------
export const payRemainingAmount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await BookingModel.findById(id);
  if (!booking) return next(new APIError('Booking not found', 404));

  if (booking.paymentType !== 'deposit') {
    return next(new APIError('No remaining payment for this booking', 400));
  }

  const remainingAmount = booking.remainingAmount;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: Math.round(remainingAmount * 100),
          product_data: { name: `Remaining Payment for Booking ${booking.id}` },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success`,
    cancel_url: `${process.env.FRONTEND_URL}/pay`,
    customer_email: req.user.email,
    client_reference_id: booking.id,
    metadata: {
      bookingId: booking.id,
      remainingAmount,
    },
  });

  res.status(200).json({ status: 'success', sessionUrl: session.url });
});

// -------------------------------------------------------------
// CRUD with Handler Factory
// -------------------------------------------------------------
export const getBookings = factory.getAll(BookingModel, 'item');
export const getBookingById = factory.getOneById(BookingModel);
export const deleteBooking = factory.deleteOne(BookingModel);
