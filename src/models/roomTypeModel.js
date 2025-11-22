import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
    },

    name: {
      type: String,
      required: [true, 'Room type name is required'],
      trim: true,
      minlength: [2, 'Room type name must be at least 2 characters'],
      maxlength: [50, 'Room type name cannot exceed 50 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },

    // PRICING FOR NATIONALITIES
    price: {
      egyptian: {
        type: Number,
        required: [true, 'Egyptian price is required'],
        min: [1, 'Egyptian price must be at least 1'],
      },
      foreigner: {
        type: Number,
        required: [true, 'Foreigner price is required'],
        min: [1, 'Foreigner price must be at least 1'],
        validate: {
          validator: function (value) {
            return value >= this.price.egyptian;
          },
          message: 'Foreigner price must be equal to or higher than Egyptian price',
        },
      },
    },

    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1 person'],
      max: [20, 'Capacity cannot exceed 20 people'],
    },

    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => {
          if (!Array.isArray(arr)) return false;

          return arr.every((item) => {
            if (typeof item !== 'string') return false;
            const trimmed = item.trim();
            return trimmed.length >= 2 && trimmed.length <= 50;
          });
        },
        message: 'Each amenity must be a non-empty string between 2–50 characters',
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

// Prevent duplicate room types for the same hotel
roomTypeSchema.index(
  { hotel: 1, name: 1 },
  { unique: true, message: 'This room type already exists for this hotel' }
);

const RoomTypeModel =
  mongoose.models.RoomType || mongoose.model('RoomType', roomTypeSchema);

export default RoomTypeModel;
