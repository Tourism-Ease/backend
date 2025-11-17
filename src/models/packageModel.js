import mongoose from 'mongoose';
import { getImageUrl } from '../utils/getImageUrl.js';

const itinerarySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false } // ✅ disable _id for itinerary subdocuments
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },

    roomTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' }],

    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },

    pickupPoint: { type: String, required: true },

    durationDays: { type: Number, required: true },

    shortDesc: { type: String, required: true },

    description: { type: String, required: true },

    itinerary: [itinerarySchema], // use sub-schema without _id

    imageCover: { type: String, required: true },

    images: [String],

    transportation: {
      transport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transportation', required: true },
      price: { type: Number, required: true },
    },

    basePrice: { type: Number, required: true },

    totalPrice: { type: Number, required: true },
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

        // Add packageId inside itinerary items
        // if (ret.itinerary && Array.isArray(ret.itinerary)) {
        //   ret.itinerary = ret.itinerary.map((item) => ({
        //     ...item,
        //     packageId: ret.id,
        //   }));
        // }

        return ret;
      },
    },
  }
);

// Virtuals for Cloudinary URLs
packageSchema.virtual('imageCoverUrl').get(function () {
  return this.imageCover ? getImageUrl(this.imageCover) : null;
});

packageSchema.virtual('imagesUrls').get(function () {
  return this.images && this.images.length ? this.images.map(getImageUrl) : [];
});

const PackageModel = mongoose.models.Package || mongoose.model('Package', packageSchema);

export default PackageModel;
