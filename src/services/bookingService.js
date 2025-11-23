import mongoose from 'mongoose';

import * as factory from './handlerFactory.js';
import { getImageUrl } from '../utils/getImageUrl.js';


import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import APIError from '../utils/apiError.js';

import BookingModel from '../models/bookingModel.js';
import UserModel from '../models/userModel.js';
import TripModel from '../models/tripModel.js';
import PackageModel from '../models/packageModel.js';
import { sendEmail } from '../utils/sendEmail.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Filter logged-in user's bookings
export const filterBookingsForLoggedUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObject = { user: req.user._id };
  next();
});

// Generate Booking Number
const generateBookingNumber = () => 'B-' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36).toUpperCase();

// Create Booking
export const createBooking = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      itemId,
      bookingType,
      paymentType,
      paymentMethod,
      counts,
      pickupCity,
      departureDate,
    } = req.body;

    const userId = req.user._id;

    // --------------------------
    //  Validate booking input
    // --------------------------
    if (!['Trip', 'Package'].includes(bookingType))
      throw new APIError('Invalid bookingType', 400);

    if (!['cash', 'stripe'].includes(paymentMethod))
      throw new APIError('Invalid paymentMethod', 400);

    // --------------------------
    //  Fetch the Trip/Package
    // --------------------------
    const Model = bookingType === 'Trip' ? TripModel : PackageModel;
    const item = await Model.findById(itemId);
    if (!item) throw new APIError(`${bookingType} not found`, 404);

    // --------------------------
    //  Determine booking date
    // --------------------------
    let bookingDate;

    if (bookingType === 'Package') {
      bookingDate = item.departureDate;
      if (!bookingDate) throw new APIError('Package departure date missing', 500);
    } else {
      if (!departureDate)
        throw new APIError('Departure date required for trips', 400);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const depDate = new Date(departureDate);
      depDate.setHours(0, 0, 0, 0);

      if (depDate < tomorrow)
        throw new APIError('Departure date must be tomorrow or later', 400);

      bookingDate = depDate;
    }

    // --------------------------
    //  Calculate Pricing
    // --------------------------
    const priceData =
      bookingType === 'Trip'
        ? item.calculatePrice(counts)
        : item.calculatePrice({ ...counts, city: pickupCity });

    const total = priceData.total;

    const paidAmount =
      paymentType === 'full' ? total : total * 0.5;

    const remainingAmount =
      paymentType === 'full' ? 0 : total * 0.5;

    // --------------------------
    //  Prepare Booking Data
    // --------------------------
    const bookingData = {
      user: userId,
      bookingType,
      item: itemId,
      people: counts,
      paymentType,
      bookingDate,
      paymentMethod,
      totalPrice: total,
      paidAmount,
      remainingAmount,
      paymentStatus: paymentType === 'full' ? 'paid' : 'partial',
      bookingStatus: paymentMethod === 'cash' ? 'pending' : 'confirmed',
      bookingNumber: generateBookingNumber(),
      pickupCity: bookingType === 'Package' ? pickupCity || null : null,
    };

    // --------------------------
    //  Stripe Metadata (STRING only)
    // --------------------------
    const stripeMetadata = {
      bookingType: String(bookingType),
      paymentType: String(paymentType),
      counts: JSON.stringify(counts),
      userId: String(userId),
    };

    if (bookingType === 'Package')
      stripeMetadata.pickupCity = String(pickupCity || '');

    // --------------------------
    //  Validate & Update Seats
    // --------------------------
    if (bookingType === 'Package') {
      const totalPeople = counts.adults + counts.children + counts.foreigners;

      // For Stripe, don't decrement seats yet
      if (paymentMethod === 'cash') {
        if (totalPeople > item.availableSeats) {
          throw new APIError('Not enough available seats', 400);
        }

        item.availableSeats -= totalPeople;
        await item.save({ session });
      }
    }


    // --------------------------
    //  CASH Payment
    // --------------------------
    if (paymentMethod === 'cash') {
      bookingData.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

      // bookingData.expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes for testing

      const [booking] = await BookingModel.create([bookingData], { session });

      await sendEmail({
        email: req.user.email,
        subject: 'Payment Pending - Safarny',
        html: cashPaymentReminderEmail({ user: req.user, booking, item })
      });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        status: 'success',
        data: booking,
      });
    }

    // --------------------------
    //  STRIPE Payment
    // --------------------------
    const stripeAmount = Math.round(paidAmount * 100);

    const imageCover = getImageUrl(item.imageCover);

    // Helper to safely build a line for each category
    function buildLine(label, count, data) {
      if (!count) return ""; // Skip null or zero
      const price = data?.price ?? 0;
      const total = data?.total ?? 0;
      return `${label} (${count})   ${price} x ${count} = ${total} EGP`;
    }

    const lines = [];

    lines.push(buildLine("Adults", counts.adults, priceData.breakdown.adult));
    lines.push(buildLine("Children", counts.children, priceData.breakdown.child));
    lines.push(buildLine("Foreigners", counts.foreigners, priceData.breakdown.foreigner));

    const filteredLines = lines.filter(Boolean); // remove empty ones

    const breakdownText = filteredLines
      .map(line => `• ${line}`)
      .join(" | ") + ` | Total: ${total ?? 0} EGP` +
      (paymentType === "deposit" ? ` | Deposit (50%): ${paidAmount ?? 0} EGP` : "");



    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: 'egp',
            unit_amount: stripeAmount,
            product_data: {
              name: `${bookingType} - ${item.title}`,
              images: [imageCover],
              description: breakdownText,
            },
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}/bookings`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/fail`,

      customer_email: req.user.email,
      client_reference_id: itemId,
      metadata: stripeMetadata,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: 'success',
      sessionUrl: stripeSession.url,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
});



//  Stripe Webhook Handler
export const bookingWebhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const {
        bookingType,
        counts,
        paymentType,
        dateFrom,
        dateTo,
        userId,
        pickupCity
      } = session.metadata;
      const itemId = session.client_reference_id;

      // --------------------------
      //  Fetch user and item
      // --------------------------
      const user = await UserModel.findById(userId);
      if (!user) {
        console.error(`User not found: ${userId}`);
        return res.status(400).send('User not found');
      }

      const itemModel = bookingType === 'Trip' ? TripModel : PackageModel;
      const item = await itemModel.findById(itemId);
      if (!item) {
        console.error(`${bookingType} not found: ${itemId}`);
        return res.status(400).send(`${bookingType} not found`);
      }

      // --------------------------
      //  Prevent duplicate bookings
      // --------------------------
      const exists = await BookingModel.findOne({ stripeSessionId: session.id });
      if (exists) {
        console.log(`Booking already exists for session: ${session.id}`);
        return res.status(200).json({ received: true });
      }

      // --------------------------
      //  Decrement seats only for Package
      // --------------------------
      if (bookingType === 'Package') {
        const totalPeople = JSON.parse(counts).adults
          + JSON.parse(counts).children
          + JSON.parse(counts).foreigners;

        if (totalPeople > item.availableSeats) {
          console.error(`Not enough seats for item ${itemId}`);
          return res.status(400).send('Not enough available seats');
        }

        item.availableSeats -= totalPeople;
        await item.save();
      }

      // --------------------------
      //  Create Booking
      // --------------------------
      const paidAmount = session.amount_total / 100;
      const remainingAmount = paymentType === 'deposit' ? paidAmount : 0;

      const booking = await BookingModel.create({
        user: user._id,
        bookingType,
        item: item._id,
        people: JSON.parse(counts),
        paymentType,
        paymentMethod: 'stripe',
        dateFrom,
        dateTo,
        paidAmount,
        remainingAmount,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        bookingNumber: generateBookingNumber(),
        stripeSessionId: session.id,
        pickupCity: pickupCity || null,
      });

      // --------------------------
      //  Send confirmation email
      // --------------------------
      try {
        await sendEmail({
          email: user.email,
          subject: 'Booking Confirmed - Safarny',
          html: bookingConfirmationEmail({ user, booking, item })
        });
      } catch (emailErr) {
        console.error('Failed to send booking email:', emailErr);
      }

      console.log(`Booking created successfully for session: ${session.id}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    res.status(500).send('Internal Server Error');
  }
});



// export const bookingWebhookHandler = asyncHandler(async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;
//     const { bookingType, counts, paymentType, dateFrom, dateTo, userId, pickupCity } = session.metadata;
//     const itemId = session.client_reference_id;

//     const user = await UserModel.findById(userId);
//     if (!user) return;

//     // Prevent duplicate booking
//     const exists = await BookingModel.findOne({ stripeSessionId: session.id });
//     if (exists) return;

//     const paidAmount = session.amount_total / 100;
//     const remainingAmount = paymentType === 'deposit' ? paidAmount : 0;
//     const booking = await BookingModel.create({
//       user: user._id,
//       bookingType,
//       item: itemId,
//       people: JSON.parse(counts),
//       paymentType,
//       paymentMethod: 'stripe',
//       dateFrom,
//       dateTo,
//       paidAmount,
//       remainingAmount,
//       paymentStatus: 'paid',
//       bookingStatus: 'confirmed',
//       bookingNumber: generateBookingNumber(),
//       stripeSessionId: session.id,
//       pickupCity
//     });

//     await sendEmail({
//       email: user.email,
//       subject: 'Booking Confirmed - Safarny',
//       html: bookingConfirmationEmail({ user, booking, item })
//     });
//   }

//   res.status(200).json({ received: true });
// });

// Cancel Booking
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await BookingModel.findById(id).populate('item');
  if (!booking) throw new APIError('Booking not found', 404);

  if (req.user.role === 'user' && booking.user.toString() !== req.user._id.toString())
    throw new APIError('Not authorized', 403);

  if (booking.bookingStatus === 'cancelled') throw new APIError('Booking already cancelled', 400);

  // Increment availableSeats if booking is a Package
  if (booking.bookingType === 'Package') {
    const item = await PackageModel.findById(booking.item);
    if (item) {
      const seatsToRelease =
        (booking.people.adults || 0) +
        (booking.people.children || 0) +
        (booking.people.foreigners || 0);
      item.availableSeats += seatsToRelease;
      await item.save();
    }
  }


  if (booking.paymentMethod === 'cash') {
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'pending';
    await booking.save();

    await sendEmail({
      email: req.user.email,
      subject: 'Booking Cancelled - Safarny',
      html: bookingCancelledCashEmail({ user: req.user, booking })
    });

    return res.status(200).json({ status: 'success', data: booking });
  }

  // Stripe refund
  const refund = await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId, amount: Math.round(booking.paidAmount * 100) });
  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded';
  booking.refundAmount = booking.paidAmount;
  booking.refundDate = new Date();
  await booking.save();

  await sendEmail({
    email: req.user.email,
    subject: 'Booking Cancelled & Refunded - Safarny',
    html: bookingCancelledRefundedEmail({ user: req.user, booking })
  });

  res.status(200).json({ status: 'success', data: booking, refund });
});

// Confirm Booking (Admin)
export const confirmBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await BookingModel.findById(id).populate('item').populate('user');
  if (!booking) throw new APIError('Booking not found', 404);

  booking.bookingStatus = 'confirmed';
  booking.paymentStatus = 'paid';
  await booking.save();

  await sendEmail({
    email: booking.user.email,
    subject: 'Booking Confirmed - Safarny',
    html: bookingConfirmationEmail({ user: req.user, booking })
  });

  res.status(200).json({ status: 'success', data: booking });
});

// Pay Remaining Amount
export const payRemainingAmount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await BookingModel.findById(id);
  if (!booking) throw new APIError('Booking not found', 404);
  if (booking.paymentType !== 'deposit') throw new APIError('No remaining payment for this booking', 400);

  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: { currency: 'egp', unit_amount: Math.round(booking.remainingAmount * 100), product_data: { name: `Remaining Payment for ${booking.bookingNumber}` } },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success`,
    cancel_url: `${process.env.FRONTEND_URL}/pay`,
    customer_email: req.user.email,
    client_reference_id: booking._id.toString(),
    metadata: { bookingId: booking._id.toString(), remainingAmount: booking.remainingAmount }
  });

  res.status(200).json({ status: 'success', sessionUrl: session.url });
});


export const getBookings = factory.getAll(BookingModel, 'item');
export const getBookingById = factory.getOneById(BookingModel);
export const deleteBooking = factory.deleteOne(BookingModel);




export const bookingConfirmationEmail = ({ user, booking, item }) => {
  const { bookingNumber, bookingType, totalPrice, paidAmount, remainingAmount, bookingDate, people } = booking;

  return `
  <div style="font-family:Arial,sans-serif; background:#f8f9fa; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
      <h2 style="color:#007bff;">Booking Confirmed!</h2>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your booking is confirmed for <strong>${item.title}</strong> (${bookingType}).</p>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr><td><strong>Booking Number:</strong></td><td>${bookingNumber}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${new Date(bookingDate).toLocaleDateString()}</td></tr>
        <tr><td><strong>Total Price:</strong></td><td>${totalPrice} EGP</td></tr>
        <tr><td><strong>Paid:</strong></td><td>${paidAmount} EGP</td></tr>
        <tr><td><strong>Remaining:</strong></td><td>${remainingAmount} EGP</td></tr>
        <tr><td><strong>People:</strong></td><td>
          ${people.adults ? `Adults: ${people.adults} <br>` : ''}
          ${people.children ? `Children: ${people.children} <br>` : ''}
          ${people.foreigners ? `Foreigners: ${people.foreigners} <br>` : ''}
        </td></tr>
      </table>
      <p>Thank you for booking with <strong>Safarny</strong>. We look forward to your trip!</p>
      <p style="color:#888; font-size:12px;">If you have any questions, contact us at support@safarny.com</p>
    </div>
  </div>
  `;
};


export const cashPaymentReminderEmail = ({ user, booking, item }) => {
  const { bookingNumber, bookingType, totalPrice, paidAmount, bookingDate, people, expiresAt } = booking;

  return `
  <div style="font-family:Arial,sans-serif; background:#f8f9fa; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
      <h2 style="color:#ffc107;">Payment Pending</h2>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your booking for <strong>${item.title}</strong> (${bookingType}) is awaiting cash payment.</p>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr><td><strong>Booking Number:</strong></td><td>${bookingNumber}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${new Date(bookingDate).toLocaleDateString()}</td></tr>
        <tr><td><strong>Total Amount Due:</strong></td><td>${totalPrice} EGP</td></tr>
        <tr><td><strong>Amount Paid:</strong></td><td>${paidAmount} EGP</td></tr>
        <tr><td><strong>Expires At:</strong></td><td>${new Date(expiresAt).toLocaleString()}</td></tr>
      </table>
      <p>Please complete your cash payment before the expiration to secure your booking.</p>
      <p style="color:#888; font-size:12px;">For assistance, contact support@safarny.com</p>
    </div>
  </div>
  `;
};


export const bookingCancelledRefundedEmail = ({ user, booking }) => {
  const { bookingNumber, bookingType, item, refundAmount } = booking;

  return `
  <div style="font-family:Arial,sans-serif; background:#f8f9fa; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
      <h2 style="color:#dc3545;">Booking Cancelled & Refunded</h2>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your booking for <strong>${item.title}</strong> (${bookingType}) has been cancelled.</p>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr><td><strong>Booking Number:</strong></td><td>${bookingNumber}</td></tr>
        <tr><td><strong>Refund Amount:</strong></td><td>${refundAmount ?? 0} EGP</td></tr>
      </table>
      <p>The refunded amount should reflect in your account within 3-5 business days.</p>
      <p style="color:#888; font-size:12px;">For questions, contact support@safarny.com</p>
    </div>
  </div>
  `;
};

export const bookingCancelledCashEmail = ({ user, booking }) => {
  const { bookingNumber, bookingType, item } = booking;

  return `
  <div style="font-family:Arial,sans-serif; background:#f8f9fa; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
      <h2 style="color:#ffc107;">Booking Cancelled</h2>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your booking for <strong>${item.title}</strong> (${bookingType}) has been cancelled.</p>
      <p>No payment has been refunded as your booking was made with cash. Please contact support if you need assistance.</p>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr><td><strong>Booking Number:</strong></td><td>${bookingNumber}</td></tr>
      </table>
      <p style="color:#888; font-size:12px;">For questions, contact support@safarny.com</p>
    </div>
  </div>
  `;
};
