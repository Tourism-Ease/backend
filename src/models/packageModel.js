import mongoose from 'mongoose';
import { getImageUrl } from '../utils/getImageUrl.js';

//  ITINERARY SUB-SCHEMA
const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, 'Itinerary day number is required'],
      min: [1, 'Itinerary day must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'Itinerary title is required'],
      trim: true,
      minlength: [3, 'Itinerary title must be at least 3 characters'],
    },

    description: {
      type: String,
      required: [true, 'Itinerary description is required'],
      trim: true,
      minlength: [10, 'Itinerary description must be at least 10 characters'],
    },
  },
  { _id: false }
);

//   PICKUP LOCATION SUB-SCHEMA
const pickupLocationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, 'Pickup city is required'],
      trim: true,
      minlength: [2, 'City name must be at least 2 characters'],
    },
    place: {
      type: String,
      required: [true, 'Pickup place is required'],
      trim: true,
      minlength: [2, 'Pickup place must be at least 2 characters'],
    },
    time: {
      type: String,
      required: [true, 'Pickup time is required'],
    },
    priceAdjustment: {
      type: Number,
      default: 0,
      min: [-5000, 'Price adjustment cannot be less than -5000'],
    },
  },
  { _id: false }
);

//  MAIN PACKAGE SCHEMA
const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
      minlength: [3, 'Package title must be at least 3 characters'],
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel ID is required'],
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination ID is required'],
    },

    pickupLocations: {
      type: [pickupLocationSchema],
      required: [true, 'At least one pickup location is required'],
      validate: {
        validator: v => v.length > 0,
        message: 'Pickup locations cannot be empty',
      },
    },

    durationDays: {
      type: Number,
      required: [true, 'Duration (in days) is required'],
      min: [1, 'Duration must be at least 1 day'],
    },


    shortDesc: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      minlength: [10, 'Short description must be at least 10 characters'],
    },


    description: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
      minlength: [20, 'Full description must be at least 20 characters'],
    },

    itinerary: {
      type: [itinerarySchema],
      validate: {
        validator: v => v.length > 0,
        message: 'Itinerary must include at least one day',
      },
    },

    imageCover: {
      type: String,
      required: [true, 'Cover image is required'],
    },

    images: {
      type: [String],
      default: [],
    },

    transportation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transportation',
      required: [true, 'Transportation method is required'],
    },

    egyptianPrice: {
      type: Number,
      required: [true, 'Egyptian Pacakge price is required'],
      min: [0, 'Egyptian Price must be a positive number'],
    },

    childrenPrice: {
      type: Number,
      required: [true, 'Children Pacakge price is required'],
      min: [0, 'Children Price must be a positive number'],
    },

    foreignerPrice: {
      type: Number,
      min: [0, 'Foreigner Price must be a positive number'],
    },

    capacity: {
      type: Number,
      required: [true, 'Package capacity is required'],
      min: [1, 'Capacity must be at least 1 seat'],
    },

    availableSeats: {
      type: Number,
      min: [0, 'Available seats cannot be negative'],
    },

    departureDate: {
      type: Date,
      required: [true, 'Departure date is required'],
      validate: {
        validator: function (value) {
          return value >= new Date(); // cannot set a past date
        },
        message: 'Departure date cannot be in the past'
      }
    },

  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

/* ============================================================
   AUTO CALCULATIONS
============================================================ */

// Auto initialize availableSeats
packageSchema.pre('save', function (next) {
  if (this.isNew && this.availableSeats == null) {
    this.availableSeats = this.capacity;
  }
  next();
});



/* ============================================================
   STATIC METHODS
============================================================ */
packageSchema.methods.calculatePrice  = function ({
  adults = 0,
  foreigners = 0,
  children = 0,   // with seat
  infants = 0,    // free
  city = null,
}) {
  let baseEgyptian = this.egyptianPrice;

  // Fallback: use multiplier if foreignerPrice missing
  let baseForeigner = this.foreignerPrice ?? (this.egyptianPrice);

  // Fallback: if childrenPrice not defined → 0 (transport-only or manually handled)
  let childSeat = this.childrenPrice ?? 0;

  // Pickup adjustment
  let adjustment = 0;
  if (city) {
    const pickup = this.pickupLocations.find(loc => loc.city === city);
    if (pickup) adjustment = pickup.priceAdjustment;
  }

  const adultTotal = adults * (baseEgyptian + adjustment);
  const foreignerTotal = foreigners * (baseForeigner + adjustment);
  const childrenTotal = children * (childSeat + adjustment);
  const infantsTotal = 0;

  const total = adultTotal + foreignerTotal + childrenTotal;

  return {
    adults,
    foreigners,
    children,
    infants,
    city,
    total,
    breakdown: {
      adultTotal,
      foreignerTotal,
      childrenTotal,
      infantsTotal,
    }
  };
};



/* ============================================================
   VIRTUALS
============================================================ */

packageSchema.virtual('imageCoverUrl').get(function () {
  return this.imageCover ? getImageUrl(this.imageCover) : null;
});

packageSchema.virtual('imagesUrls').get(function () {
  return this.images?.length ? this.images.map(getImageUrl) : [];
});

//  MODEL
const PackageModel =
  mongoose.models.Package || mongoose.model('Package', packageSchema);

export default PackageModel;
