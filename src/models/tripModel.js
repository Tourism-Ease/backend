import mongoose from 'mongoose';
import { getImageUrl } from '../utils/getImageUrl.js';


const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      minlength: [3, 'Trip title must be at least 3 characters'],
      maxlength: [100, 'Trip title must be at most 100 characters'],
      trim: true,
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination ID is required'],
    },

    egyptianPrice: {
      type: Number,
      required: [true, 'Trip price is required'],
      min: [0, 'Price must be a positive number'],
    },

    childrenPrice: {
      type: Number,
      min: [0, 'Price must be a positive number'],
    },

    foreignerPrice: {
      type: Number,
      min: [0, 'Price must be a positive number'],
    },

    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
      minlength: [2, 'Duration must be at least 2 characters'],
      maxlength: [50, 'Duration must be at most 50 characters'],
    },
    pickUp: {
      time: {
        type: String,
        default: '07:30 AM',
        trim: true,
      },
      place: {
        type: String,
        default: 'Hotel Pickup',
        trim: true,
      },
    },

    overview: {
      type: String,
      trim: true,
      maxlength: [500, 'Overview cannot exceed 500 characters'],
    },
    highlights: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'Maximum 10 highlights are allowed',
      },
    },
    whatToBring: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'Maximum 10 items are allowed in whatToBring',
      },
    },
    
    imageCover: { type: String, required: true },
    images: {
      type: [String],
      validate: {
        validator: (arr) => !arr || arr.length <= 5,
        message: 'Maximum 5 images are allowed',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret?._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  }
);

// Virtuals for images
tripSchema.virtual('imageCoverUrl').get(function () {
  return this.imageCover ? getImageUrl(this.imageCover) : null;
});

tripSchema.virtual('imagesUrls').get(function () {
  return this.images?.length ? this.images.map(getImageUrl) : [];
});


/* ============================================================
   INSTANCE METHOD: Calculate total price for given passengers
============================================================ */
tripSchema.methods.calculatePrice = function ({
  adults = 0,
  children = 0,
  foreigners = 0,
  infants = 0, // still free
} = {}) {
  // Base prices (fallbacks identical to logic used before)
  const adultPrice = this.egyptianPrice ?? this.totalPrice;
  const childPrice = this.childrenPrice ?? adultPrice;
  const foreignerPrice = this.foreignerPrice ?? adultPrice;

  // Calculations
  const adultTotal = adults * adultPrice;
  const childrenTotal = children * childPrice;
  const foreignerTotal = foreigners * foreignerPrice;
  const infantsTotal = 0; // always free

  const total = adultTotal + childrenTotal + foreignerTotal;

  return {
    adults,
    children,
    foreigners,
    infants,
    total,
    breakdown: {
      adultTotal,
      childrenTotal,
      foreignerTotal,
      infantsTotal,
    },
  };
};





const TripModel = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
export default TripModel;
