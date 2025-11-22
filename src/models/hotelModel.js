import mongoose from 'mongoose';
import { getImageUrl } from '../utils/getImageUrl.js';
import RoomTypeModel from './roomTypeModel.js';

const addressSchema = new mongoose.Schema(
  {
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    street: { type: String, trim: true },
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
    },
    stars: {
      type: Number,
      required: [true, 'Stars rating is required'],
      min: [1, 'Stars must be at least 1'],
      max: [5, 'Stars cannot exceed 5'],
    },
    address: {
      type: addressSchema,
      default: {},
    },
    propertyHighlights: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.every((item) => typeof item === 'string' && item.trim() !== '' && item.length <= 50),
        message: 'Highlights must be non-empty strings max 50 chars',
      },
    },
    rooms: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' }],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (arr) {
            if (!arr || arr.length !== 2) return false;
            const [lng, lat] = arr;
            return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
          },
          message: 'Coordinates must be [lng, lat] within valid ranges',
        },
        default: undefined,
      },
    },
    imageCover: { type: String, required: true },
    images: {
      type: [String],
      validate: {
        validator: (arr) =>
          !arr || (Array.isArray(arr) && arr.length <= 5 && arr.every((i) => typeof i === 'string' && i.trim() !== '')),
        message: 'Images must be non-empty strings, max 5',
      },
    },
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

// Geospatial index
hotelSchema.index({ location: '2dsphere' });

// Virtuals for images
hotelSchema.virtual('imageCoverUrl').get(function () {
  return this.imageCover ? getImageUrl(this.imageCover) : null;
});

hotelSchema.virtual('imagesUrls').get(function () {
  return this.images && this.images.length ? this.images.map(getImageUrl) : [];
});

// Prevent duplicate rooms in array
hotelSchema.path('rooms').validate(function (arr) {
  return Array.isArray(arr) && new Set(arr.map(String)).size === arr.length;
}, 'Rooms array contains duplicates');

// Auto-populate rooms
function autopopulateRooms(next) {
  this.populate('rooms');
  next();
}
hotelSchema.pre('find', autopopulateRooms);
hotelSchema.pre('findOne', autopopulateRooms);

// Cascade delete rooms on hotel removal
hotelSchema.pre('remove', async function (next) {
  await RoomTypeModel.deleteMany({ hotel: this._id });
  next();
});

const HotelModel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
export default HotelModel;
