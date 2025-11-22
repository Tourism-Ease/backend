import cron from 'node-cron';
import BookingModel from '../models/bookingModel.js';
import PackageModel from '../models/packageModel.js';
// import { sendEmail } from '../utils/sendEmail.js';

export const startCancelExpiredBookingsJob = () => {

  // Testing purposes
  // cron.schedule('*/10 * * * * *', async () => { // every 10 seconds

  cron.schedule('*/30 * * * *', async () => {  // every 30 mins
    const now = new Date();
    const expiredBookings = await BookingModel.find({
      paymentMethod: 'cash',
      bookingStatus: 'pending',
      expiresAt: { $lte: now }
    });

    for (const booking of expiredBookings) {
      booking.bookingStatus = 'cancelled';
      booking.paymentStatus = 'pending';
      await booking.save();

      // Release seats if package
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

      // Notify user
      console.log('Booking Expired',
        'Your pending booking has been automatically cancelled as payment was not received within 48 hours.');
      // await sendEmail(
      //   booking.user.email,
      //   'Booking Expired',
      //   'Your pending booking has been automatically cancelled as payment was not received within 48 hours.'
      // );
    }
  });
};
