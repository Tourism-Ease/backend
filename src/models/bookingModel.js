import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    bookingType: {
      type: String,
      enum: ["Trip", "Package"],
      required: [true, "Booking type is required"],
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "bookingType",
      required: [true, "Item reference is required"],
      index: true,
    },

    // Snapshot of booking info at the time of booking
    snapshot: {
      title: String,
      departureDate: Date,
      durationDays: Number,      // for package
      pickUp: {                  // only for package, optional for trip
        city: String,
        place: String,
        time: String,
        priceAdjustment: Number,
      },
      priceBreakdown: {
        adult: Number,
        foreigner: Number,
        child: Number,
        infant: Number,
      },
    },

    people: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 }, // with seat
      infants: { type: Number, default: 0, min: 0 },  // free
      foreigners: { type: Number, default: 0, min: 0 },
    },

    totalPrice: { type: Number, required: true, min: 0 },

    paymentType: {
      type: String,
      enum: ["full", "deposit"],
      required: [true, "Payment type is required"],
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0, min: 0 },

    paymentMethod: {
      type: String,
      enum: ["cash", "stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "pending",
    },

    bookingNumber: { type: String, required: true },

    stripeSessionId: { type: String, sparse: true },
    stripePaymentIntentId: { type: String, sparse: true },

    refundAmount: { type: Number, default: 0, min: 0 },
    refundDate: { type: Date },

    bookingDate: { type: Date },

    // Optional expiry for unpaid bookings (TTL index can auto-remove)
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
  }
);

/* --------------------
 * Virtuals
 * -------------------- */
bookingSchema.virtual("isUpcoming").get(function () {
  return this.dateFrom && this.dateFrom > new Date();
});

/* --------------------
 * Pre-validate: calculate paid/remaining
 * -------------------- */
bookingSchema.pre("validate", function (next) {
  if (!this.totalPrice) {
    this.paidAmount = 0;
    this.remainingAmount = 0;
    return next();
  }

  if (this.paymentType === "full") {
    this.paidAmount = this.totalPrice;
    this.remainingAmount = 0;
  } else if (this.paymentType === "deposit") {
    this.paidAmount = this.totalPrice * 0.5;
    this.remainingAmount = this.totalPrice - this.paidAmount;
  } else {
    this.paidAmount = 0;
    this.remainingAmount = this.totalPrice;
  }

  next();
});

/* --------------------
 * Instance method: can refund
 * -------------------- */
bookingSchema.methods.canRefund = function () {
  return ["paid", "partial"].includes(this.paymentStatus);
};

/* --------------------
 * Indexes
 * -------------------- */
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingType: 1, item: 1 });

const BookingModel =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default BookingModel;
