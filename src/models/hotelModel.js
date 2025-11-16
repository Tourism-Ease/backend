import mongoose from 'mongoose';
import { getImageUrl } from '../utils/getImageUrl.js';

const addressSchema = new mongoose.Schema(
  {
    country: { type: String },
    city: { type: String },
    street: { type: String },
  },
  { _id: false } // <--- prevent Mongoose from adding _id to address subdocument
);

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    address: {
      type: addressSchema,
      default: {},
    },
    description: { type: String },
    stars: {
      type: Number,
      min: 1,
      max: 5,
    },
    averageRating: { type: Number, default: 0 },
    numberOfRatings: { type: Number, default: 0 },
    // imageCover and images store Cloudinary public IDs (strings)
    imageCover: { type: String, required: true },
    images: {
      type: [String],
      validate: {
        validator: (arr) => !arr || arr.length <= 5,
        message: 'Maximum 5 images are allowed',
      },
    },
    propertyHighlights: { type: [String], default: [] }, // e.g. ['Free Wifi', 'Balcony', 'Pool']
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        validate: {
          validator: (arr) => arr.length === 2,
          message: 'Coordinates must be [lng, lat]',
        },
      },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret && ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  }
);

// create index for geospatial queries if coordinates exist
hotelSchema.index({ location: '2dsphere' });

// Virtual to expose imageCoverUrl and imagesUrls using your getImageUrl util
hotelSchema.virtual('imageCoverUrl').get(function () {
  if (this.imageCover) {
    return getImageUrl(this.imageCover);
  }
  return null;
});

hotelSchema.virtual('imagesUrls').get(function () {
  if (this.images && this.images.length) {
    return this.images.map((pid) => getImageUrl(pid));
  }
  return [];
});

const HotelModel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
export default HotelModel;
