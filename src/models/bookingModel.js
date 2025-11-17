import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Booking can be for Trip or Package
    bookingType: {
      type: String,
      enum: ['Trip', 'Package'],
      required: true,
    },

    // Dynamic reference to Trip or Package
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'bookingType',
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Total full price for booking
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // full = pay 100%
    // deposit = pay 50%
    paymentType: {
      type: String,
      enum: ['full', 'deposit'],
      required: true,
    },

    // Paid online or cash (calculated automatically)
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // pending     = not paid yet
    // partial     = deposit paid
    // paid        = fully paid
    // refunded    = refunded from Stripe
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },

    // pending, confirmed, cancelled
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },

    // Stripe identifiers
    stripeSessionId: String,
    stripePaymentIntentId: String,

    // Refund info
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundDate: Date,

    // Optional: for multi-day trips or packages
    dateFrom: Date,
    dateTo: Date,

    // Payment method
    paymentMethod: {
      type: String,
      enum: ['cash', 'stripe'],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

/* --------------------------------------------
 * AUTO-CALCULATE PAYMENT LOGIC
 * -------------------------------------------- */

bookingSchema.pre('validate', function (next) {
  if (!this.totalPrice) return next();

  if (this.paymentType === 'deposit') {
    const deposit = this.totalPrice * 0.5;

    // Stripe will pay deposit OR cash deposit
    this.paidAmount = deposit;
    this.remainingAmount = this.totalPrice - deposit;

    if (this.paymentMethod === 'stripe') {
      this.paymentStatus = 'partial';
    } else if (this.paymentMethod === 'cash') {
      this.paymentStatus = 'partial';
    }
  }

  if (this.paymentType === 'full') {
    this.paidAmount = this.totalPrice;
    this.remainingAmount = 0;
    this.paymentStatus = 'paid';
  }

  next();
});

const BookingModel = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default BookingModel;
