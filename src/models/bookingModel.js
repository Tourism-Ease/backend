import mongoose from "mongoose";

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

    people: {
      adults: {
        type: Number,
        required: true,
        min: [1, "At least one adult is required"],
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
      foreigners: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },

    paymentType: {
      type: String,
      enum: ["full", "deposit"],
      required: [true, "Payment type is required"],
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },

    remainingAmount: {
      type: Number,
      default: 0,
      min: [0, "Remaining amount cannot be negative"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    bookingNumber: {
      type: String,
      required: [true, "Booking Number is required"],
    },

    stripeSessionId: {
      type: String,
      sparse: true,
    },

    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: [0, "Refund amount cannot be negative"],
    },

    refundDate: {
      type: Date,
      validate: {
        validator: function (val) {
          return !val || val instanceof Date;
        },
        message: "Invalid refund date",
      },
    },

    dateFrom: {
      type: Date,
      required: [
        function () {
          return this.dateTo;
        },
        "dateFrom is required when dateTo is provided",
      ],
    },

    dateTo: {
      type: Date,
      validate: {
        validator: function (val) {
          return !val || (this.dateFrom && val >= this.dateFrom);
        },
        message: "dateTo must be greater than or equal to dateFrom",
      },
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "stripe"],
      required: [true, "Payment method is required"],
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


/* -------------------------------------------------
 * VIRTUALS
 * ------------------------------------------------- */
bookingSchema.virtual("isUpcoming").get(function () {
  return this.dateFrom && this.dateFrom > new Date();
});

//  PRICE CALCULATION LOGIC(Trips & Packages) with Foreigners 40 % on total
bookingSchema.pre("validate", async function (next) {
  try {
    if (!this.item || !this.bookingType) return next();

    let baseItem;

    // Load Trip or Package
    if (this.bookingType === "Trip") {
      baseItem = await mongoose.model("Trip").findById(this.item);
    } else {
      baseItem = await mongoose
        .model("Package")
        .findById(this.item)
        .populate("hotel transportation");
    }

    if (!baseItem) return next(new Error("Invalid Trip/Package reference"));

    const { adults = 0, children = 0, foreigners = 0 } = this.people || {};
    const totalPeople = adults + children + foreigners;

    let total = 0;

    /* ------------------ TRIP PRICING ------------------ */
    if (this.bookingType === "Trip") {
      const adultPrice = baseItem.price;
      const childPrice = adultPrice * 1; // children 100%
      const transportPrice = baseItem.transportation?.price || 0;

      const adultTotal = adults * (adultPrice + transportPrice);
      const childTotal = children * (childPrice + transportPrice);
      const foreignersBaseTotal = foreigners * (adultPrice + transportPrice);
      const foreignersTotal = foreignersBaseTotal * 1.4; // 40% extra on everything

      total = adultTotal + childTotal + foreignersTotal;
    }

    /* ------------------ PACKAGE PRICING ------------------ */
    if (this.bookingType === "Package") {
      // const basePrice = baseItem.basePrice;
      // const hotelPrice = baseItem.hotel?.price || 0;
      const transportPrice = baseItem.transportation?.price || 0;


      const adultPrice = baseItem.totalPrice;
      const childPrice = transportPrice; // children only pay transportation
      const foreignersPrice = adultPrice * 1.4; // 40% extra





      const adultTotal = parseFloat(adultPrice * adults)
      const childTotal = parseFloat(childPrice * children)
      const foreignersTotal = parseFloat(foreignersPrice * foreigners)

      console.log('adult', adultTotal);
      console.log('child', transportPrice);
      console.log('foreigner', foreignersTotal);

      total = adultTotal + childTotal + foreignersTotal;

      console.log(total);

      // adult => 10200
      // forigner => 14280
      // children => 1200
    }

    this.totalPrice = total;

    next();
  } catch (err) {
    next(err);
  }
});



/* ============================================================
    PAYMENT CALCULATION LOGIC
   ============================================================ */
bookingSchema.pre("validate", function (next) {
  if (!this.totalPrice || !this.paymentType) {
    this.paidAmount = 0;
    this.remainingAmount = 0;
    return next();
  }

  if (this.paymentType === "full") {
    this.paidAmount = this.totalPrice;
    this.remainingAmount = 0;
  } else if (this.paymentType === "deposit") {
    this.paidAmount = this.totalPrice * 0.3; // deposit = 30%
    this.remainingAmount = this.totalPrice - this.paidAmount;
  } else {
    this.paidAmount = 0;
    this.remainingAmount = this.totalPrice;
  }

  next();
});


/* -------------------------------------------------
 * INSTANCE METHOD: Can be refunded?
 * ------------------------------------------------- */
bookingSchema.methods.canRefund = function () {
  return this.paymentStatus === "paid" || this.paymentStatus === "partial";
};

/* -------------------------------------------------
 * INDEXES FOR PERFORMANCE
 * ------------------------------------------------- */
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingType: 1, item: 1 });

const BookingModel =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default BookingModel;
