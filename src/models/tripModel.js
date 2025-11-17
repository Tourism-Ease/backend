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
      type: String,
      required: [true, 'Destination is required'],
      minlength: [2, 'Destination must be at least 2 characters'],
      maxlength: [100, 'Destination must be at most 100 characters'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Trip price is required'],
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
      type: String,
      default: '07:30 AM Hotel Pickup',
      trim: true,
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
    transportation: {
      transportationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transportation',
        required: [true, 'Transportation reference is required'],
      },
      price: {
        type: Number,
        required: [true, 'Transportation price is required'],
        min: [0, 'Transportation price must be a positive number'],
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

// Virtual to expose imageCoverUrl and imagesUrls using your getImageUrl util
tripSchema.virtual('imageCoverUrl').get(function () {
  if (this.imageCover) {
    return getImageUrl(this.imageCover);
  }
  return null;
});

tripSchema.virtual('imagesUrls').get(function () {
  if (this.images && this.images.length) {
    return this.images.map((pid) => getImageUrl(pid));
  }
  return [];
});

const TripModel = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
export default TripModel;
