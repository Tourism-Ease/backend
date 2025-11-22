import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';

export const DashboardService = {
  // -------------------------
  // 1. Total revenue (last 30 days)
  // -------------------------
  async getRevenueLast30Days() {
    const result = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } },
      },
    ]);
    return result[0]?.totalRevenue || 0;
  },

  // -------------------------
  // 2. Total bookings (last 30 days)
  // -------------------------
  async getBookingsCountLast30() {
    return await Booking.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
  },

  // -------------------------
  // 3. Trips vs Packages
  // -------------------------
  async getTripsVsPackages() {
    return await Booking.aggregate([
      {
        $group: {
          _id: '$bookingType', // Trip / Package
          count: { $sum: 1 },
        },
      },
    ]);
  },

  // -------------------------
  // 4. Bookings Per City
  // -------------------------
  async getBookingsPerCity() {
    return await Booking.aggregate([
      {
        $lookup: {
          from: 'destinations',
          localField: 'destination',
          foreignField: '_id',
          as: 'dest',
        },
      },
      { $unwind: '$dest' },
      {
        $group: {
          _id: '$dest.city',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  },

  // -------------------------
  // 5. New Users (last 30 days)
  // -------------------------
  async getUsersLast30Days() {
    return await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
  },

  // -------------------------
  // 6. Payment Status Distribution
  // -------------------------
  async getPaymentStatusStats() {
    return await Booking.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);
  },

  // -------------------------
  // 7. Payment Type (deposit vs full)
  // -------------------------
  async getPaymentTypeStats() {
    return await Booking.aggregate([
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
        },
      },
    ]);
  },

  async getAllDashboardData() {
    return {
      revenueLast30Days: await this.getRevenueLast30Days(),
      bookingsLast30Days: await this.getBookingsCountLast30(),
      tripsVsPackages: await this.getTripsVsPackages(),
      bookingsPerCity: await this.getBookingsPerCity(),
      newUsersLast30Days: await this.getUsersLast30Days(),
      paymentStatusStats: await this.getPaymentStatusStats(),
      paymentTypeStats: await this.getPaymentTypeStats(),
    };
  },
};
